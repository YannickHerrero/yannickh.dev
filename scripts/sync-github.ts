#!/usr/bin/env bun
/**
 * GitHub Sync Script
 *
 * Fetches repository metadata, topics, and READMEs from GitHub
 * and generates static content for the project catalog.
 *
 * Usage: bun run scripts/sync-github.ts
 *
 * Environment variables:
 *   GITHUB_TOKEN - Optional, but recommended to avoid rate limits
 */

import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import pLimit from "p-limit";
import { repos } from "../repos.config";
import type {
  RepoConfig,
  Project,
  ProjectsIndex,
  GitHubRepoResponse,
  GitHubTopicsResponse,
  GitHubReadmeResponse,
  CacheEntry,
  Profile,
  ProfileIndex,
  ContributionDay,
  ContributionsIndex,
} from "../src/types";

// Configuration
const CONCURRENCY_LIMIT = 4;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const CACHE_DIR = ".cache/repos";
const GENERATED_DIR = "src/generated";
const CONTENT_DIR = "src/content/projects";

// GitHub API base URLs
const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

// Get token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Stats for summary
let successCount = 0;
let failCount = 0;
let cacheHitCount = 0;

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create slug from owner and repo
 */
function createSlug(owner: string, repo: string): string {
  return `${owner}-${repo}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

/**
 * Normalize tags: lowercase, kebab-case, dedupe
 */
function normalizeTags(topics: string[], customTags: string[] = []): string[] {
  const allTags = [...topics, ...customTags];
  const normalized = allTags.map((tag) =>
    tag
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  );
  return [...new Set(normalized)].filter(Boolean).sort();
}

/**
 * Get cache file path for a repo
 */
function getCachePath(owner: string, repo: string): string {
  return join(CACHE_DIR, owner, `${repo}.json`);
}

/**
 * Read cache entry if it exists
 */
async function readCache(
  owner: string,
  repo: string
): Promise<CacheEntry | null> {
  const cachePath = getCachePath(owner, repo);
  if (!existsSync(cachePath)) {
    return null;
  }
  try {
    const content = await readFile(cachePath, "utf-8");
    return JSON.parse(content) as CacheEntry;
  } catch {
    return null;
  }
}

/**
 * Write cache entry
 */
async function writeCache(
  owner: string,
  repo: string,
  entry: CacheEntry
): Promise<void> {
  const cachePath = getCachePath(owner, repo);
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(entry, null, 2));
}

/**
 * Make a GitHub API request with retries and rate limit handling
 */
async function githubFetch<T>(
  endpoint: string,
  options: { etag?: string } = {}
): Promise<{ data: T | null; etag?: string; notModified: boolean }> {
  const url = `${GITHUB_API}${endpoint}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "project-catalog-sync",
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  if (options.etag) {
    headers["If-None-Match"] = options.etag;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { headers });

      // Handle rate limiting
      const remaining = response.headers.get("X-RateLimit-Remaining");
      const resetTime = response.headers.get("X-RateLimit-Reset");

      if (response.status === 403 && remaining === "0") {
        const resetDate = resetTime
          ? new Date(parseInt(resetTime) * 1000)
          : new Date();
        const waitMinutes = Math.ceil(
          (resetDate.getTime() - Date.now()) / 60000
        );

        console.error("\n[!] GitHub API rate limit exceeded!");
        if (GITHUB_TOKEN) {
          console.error(
            `    Rate limit resets at ${resetDate.toLocaleTimeString()} (${waitMinutes} minutes)`
          );
        } else {
          console.error(
            "    TIP: Set GITHUB_TOKEN environment variable for higher rate limits (5000/hr vs 60/hr)"
          );
          console.error(
            `    Rate limit resets at ${resetDate.toLocaleTimeString()} (${waitMinutes} minutes)`
          );
        }
        throw new Error("Rate limit exceeded");
      }

      // Handle 304 Not Modified
      if (response.status === 304) {
        return { data: null, notModified: true };
      }

      // Handle 404
      if (response.status === 404) {
        throw new Error(`Not found: ${endpoint}`);
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      const newEtag = response.headers.get("ETag") || undefined;

      return { data, etag: newEtag, notModified: false };
    } catch (error) {
      lastError = error as Error;

      // Don't retry on rate limit or 404
      if (
        lastError.message.includes("Rate limit") ||
        lastError.message.includes("Not found")
      ) {
        throw lastError;
      }

      // Exponential backoff for retryable errors
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.log(`    Retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error("Unknown error");
}

/**
 * Rewrite relative URLs in README markdown to absolute GitHub URLs
 */
function rewriteReadmeUrls(
  markdown: string,
  owner: string,
  repo: string,
  defaultBranch: string
): string {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}`;
  const blobBase = `https://github.com/${owner}/${repo}/blob/${defaultBranch}`;

  // Helper to check if URL is absolute
  const isAbsolute = (url: string) =>
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//") ||
    url.startsWith("#") ||
    url.startsWith("mailto:");

  // Helper to normalize relative path
  const normalizePath = (path: string) => {
    // Remove leading ./ or /
    return path.replace(/^\.?\//, "");
  };

  // Rewrite image references: ![alt](path) or <img src="path">
  let result = markdown;

  // Markdown images: ![alt](./path) or ![alt](path)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    if (isAbsolute(url)) return match;
    const cleanPath = normalizePath(url.split(/[?#]/)[0]);
    const suffix = url.slice(cleanPath.length + (url.startsWith("./") ? 2 : 0));
    return `![${alt}](${rawBase}/${cleanPath}${suffix})`;
  });

  // HTML images: <img src="path">
  result = result.replace(
    /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
    (match, before, url, after) => {
      if (isAbsolute(url)) return match;
      const cleanPath = normalizePath(url);
      return `<img ${before}src="${rawBase}/${cleanPath}"${after}>`;
    }
  );

  // Markdown links to files: [text](./path) - but not anchors
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (isAbsolute(url)) return match;
    // Skip if it's an anchor link
    if (url.startsWith("#")) return match;
    // Skip if already processed as image
    if (match.startsWith("!")) return match;
    const cleanPath = normalizePath(url.split(/[?#]/)[0]);
    const suffix = url.slice(cleanPath.length + (url.startsWith("./") ? 2 : 0));
    return `[${text}](${blobBase}/${cleanPath}${suffix})`;
  });

  return result;
}

/**
 * Fetch all data for a single repository
 */
async function fetchRepo(
  config: RepoConfig
): Promise<{ project: Project; readme: string } | null> {
  const { owner, repo, featured = false, customTags = [] } = config;
  const slug = createSlug(owner, repo);

  console.log(`[*] Fetching ${owner}/${repo}...`);

  try {
    // Check cache first
    const cached = await readCache(owner, repo);

    // Fetch repo metadata (with conditional request if cached)
    const metaResult = await githubFetch<GitHubRepoResponse>(
      `/repos/${owner}/${repo}`,
      { etag: cached?.etag }
    );

    let metadata: GitHubRepoResponse;
    let topics: string[];
    let readme: string;
    let etag = metaResult.etag;

    if (metaResult.notModified && cached) {
      // Use cached data
      console.log(`    Cache hit (not modified)`);
      cacheHitCount++;
      metadata = cached.metadata;
      topics = cached.topics;
      readme = cached.readme;
    } else if (metaResult.data) {
      // Fetch fresh data
      metadata = metaResult.data;

      // Fetch topics
      const topicsResult = await githubFetch<GitHubTopicsResponse>(
        `/repos/${owner}/${repo}/topics`
      );
      topics = topicsResult.data?.names || [];

      // Fetch README
      try {
        const readmeResult = await githubFetch<GitHubReadmeResponse>(
          `/repos/${owner}/${repo}/readme`
        );
        if (readmeResult.data) {
          // Decode base64 content
          const rawReadme = Buffer.from(
            readmeResult.data.content,
            "base64"
          ).toString("utf-8");
          // Rewrite URLs
          readme = rewriteReadmeUrls(
            rawReadme,
            owner,
            repo,
            metadata.default_branch
          );
        } else {
          readme = `# ${repo}\n\nNo README available.`;
        }
      } catch {
        readme = `# ${repo}\n\nNo README available.`;
      }

      // Update cache
      await writeCache(owner, repo, {
        etag,
        updatedAt: metadata.updated_at,
        metadata,
        topics,
        readme,
        fetchedAt: new Date().toISOString(),
      });
    } else {
      throw new Error("No data received");
    }

    // Normalize tags
    const normalizedTags = normalizeTags(topics, customTags);

    const project: Project = {
      slug,
      title: metadata.name,
      description: metadata.description || "",
      owner,
      repo,
      tags: normalizedTags,
      stars: metadata.stargazers_count,
      updatedAt: metadata.pushed_at || metadata.updated_at,
      homepage: metadata.homepage || null,
      htmlUrl: metadata.html_url,
      defaultBranch: metadata.default_branch,
      featured,
    };

    console.log(`    OK (${project.stars} stars, ${project.tags.length} tags)`);
    successCount++;

    return { project, readme };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`    FAILED: ${message}`);
    failCount++;
    return null;
  }
}

/**
 * Generate markdown frontmatter for a project
 * Note: slug is NOT included in frontmatter as Astro infers it from the filename
 */
function generateFrontmatter(project: Project): string {
  // Omit slug from frontmatter - Astro uses filename as slug
  const frontmatter = {
    title: project.title,
    description: project.description,
    owner: project.owner,
    repo: project.repo,
    tags: project.tags,
    stars: project.stars,
    updatedAt: project.updatedAt,
    homepage: project.homepage,
    htmlUrl: project.htmlUrl,
    defaultBranch: project.defaultBranch,
    featured: project.featured,
  };

  return `---\n${Object.entries(frontmatter)
    .map(([key, value]) => {
      if (value === null) return `${key}: null`;
      if (Array.isArray(value)) return `${key}: ${JSON.stringify(value)}`;
      if (typeof value === "string") return `${key}: ${JSON.stringify(value)}`;
      return `${key}: ${value}`;
    })
    .join("\n")}\n---`;
}

/**
 * Main sync function
 */
async function main() {
  console.log("=".repeat(60));
  console.log("GitHub Sync - Project Catalog");
  console.log("=".repeat(60));

  if (GITHUB_TOKEN) {
    console.log("[i] Using GITHUB_TOKEN for authenticated requests");
  } else {
    console.log("[!] No GITHUB_TOKEN set - using unauthenticated requests");
    console.log("    Rate limit: 60 requests/hour");
    console.log("    TIP: Set GITHUB_TOKEN for 5000 requests/hour\n");
  }

  console.log(`[i] Found ${repos.length} repositories to sync\n`);

  // Create directories
  await mkdir(GENERATED_DIR, { recursive: true });

  // Clean and recreate content directory
  if (existsSync(CONTENT_DIR)) {
    await rm(CONTENT_DIR, { recursive: true });
  }
  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(CACHE_DIR, { recursive: true });

  // Fetch all repos with concurrency limit
  const limit = pLimit(CONCURRENCY_LIMIT);
  const results = await Promise.all(
    repos.map((config) => limit(() => fetchRepo(config)))
  );

  // Filter successful results
  const successfulResults = results.filter(
    (r): r is { project: Project; readme: string } => r !== null
  );

  // Sort: featured first, then by stars
  successfulResults.sort((a, b) => {
    if (a.project.featured !== b.project.featured) {
      return a.project.featured ? -1 : 1;
    }
    return b.project.stars - a.project.stars;
  });

  // Extract projects and collect all tags
  const projects = successfulResults.map((r) => r.project);
  const allTagsSet = new Set<string>();
  projects.forEach((p) => p.tags.forEach((t) => allTagsSet.add(t)));
  const allTags = [...allTagsSet].sort();

  // Generate projects.json
  const projectsIndex: ProjectsIndex = {
    projects,
    allTags,
    generatedAt: new Date().toISOString(),
  };

  await writeFile(
    join(GENERATED_DIR, "projects.json"),
    JSON.stringify(projectsIndex, null, 2)
  );

  // Generate markdown files for each project
  for (const { project, readme } of successfulResults) {
    const frontmatter = generateFrontmatter(project);
    const content = `${frontmatter}\n\n${readme}`;
    await writeFile(join(CONTENT_DIR, `${project.slug}.md`), content);
  }

  // Fetch profile README (from first repo owner, assumed to be the user)
  const profileUsername = repos[0]?.owner || "YannickHerrero";
  const profile = await fetchProfileReadme(profileUsername);

  // Generate profile.json
  const profileIndex: ProfileIndex = {
    profile,
    fetchedAt: new Date().toISOString(),
  };

  await writeFile(
    join(GENERATED_DIR, "profile.json"),
    JSON.stringify(profileIndex, null, 2)
  );

  // Fetch contribution data
  const contributions = await fetchContributions(profileUsername);

  // Generate contributions.json (always create, even if empty, to avoid build errors)
  const contributionsIndex: ContributionsIndex | null = contributions;
  await writeFile(
    join(GENERATED_DIR, "contributions.json"),
    JSON.stringify(contributionsIndex, null, 2)
  );

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("Sync Complete");
  console.log("=".repeat(60));
  console.log(`  Success:    ${successCount}`);
  console.log(`  Failed:     ${failCount}`);
  console.log(`  Cache hits: ${cacheHitCount}`);
  console.log(`  Tags:       ${allTags.length}`);
  console.log(`  Profile:    ${profile ? "OK" : "Not found"}`);
  console.log(
    `  Contributions: ${contributions ? `${contributions.totalContributions} total` : "Not found"}`
  );
  console.log(`\n  Generated:`);
  console.log(`    - ${GENERATED_DIR}/projects.json`);
  console.log(`    - ${GENERATED_DIR}/profile.json`);
  console.log(`    - ${GENERATED_DIR}/contributions.json`);
  console.log(`    - ${CONTENT_DIR}/*.md (${successfulResults.length} files)`);
  console.log("");

  // Exit with error if any failed
  if (failCount > 0) {
    process.exit(1);
  }
}

/**
 * Fetch GitHub contribution data using GraphQL API
 */
async function fetchContributions(
  username: string
): Promise<ContributionsIndex | null> {
  console.log(`[*] Fetching contributions for ${username}...`);

  if (!GITHUB_TOKEN) {
    console.log(`    SKIPPED: GITHUB_TOKEN required for contribution data`);
    return null;
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "project-catalog-sync",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || "GraphQL error");
    }

    const calendar =
      result.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      console.log(`    No contribution data found`);
      return null;
    }

    // Flatten weeks into days and map contribution levels
    const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
      NONE: 0,
      FIRST_QUARTILE: 1,
      SECOND_QUARTILE: 2,
      THIRD_QUARTILE: 3,
      FOURTH_QUARTILE: 4,
    };

    const contributions: ContributionDay[] = [];
    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: levelMap[day.contributionLevel] ?? 0,
        });
      }
    }

    console.log(
      `    OK (${calendar.totalContributions} contributions, ${contributions.length} days)`
    );

    return {
      contributions,
      totalContributions: calendar.totalContributions,
      username,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`    SKIPPED: ${message}`);
    return null;
  }
}

/**
 * Fetch GitHub profile README
 */
async function fetchProfileReadme(username: string): Promise<Profile | null> {
  console.log(`[*] Fetching profile README for ${username}...`);

  try {
    // Profile READMEs are in a repo named same as username
    const readmeResult = await githubFetch<GitHubReadmeResponse>(
      `/repos/${username}/${username}/readme`
    );

    if (readmeResult.data) {
      const rawReadme = Buffer.from(
        readmeResult.data.content,
        "base64"
      ).toString("utf-8");

      // Rewrite URLs to point to GitHub
      const readme = rewriteReadmeUrls(rawReadme, username, username, "main");

      console.log(`    OK (${readme.length} chars)`);

      return {
        username,
        readme,
        fetchedAt: new Date().toISOString(),
      };
    }

    console.log(`    No profile README found`);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`    SKIPPED: ${message}`);
    return null;
  }
}

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
