/**
 * Configuration type for repos.config.ts
 * Used to define which repositories to include in the catalog
 */
export interface RepoConfig {
  /** GitHub username or organization */
  owner: string;
  /** Repository name */
  repo: string;
  /** Mark as featured project (pinned to top) */
  featured?: boolean;
  /** Additional custom tags to merge with GitHub topics */
  customTags?: string[];
}

/**
 * Normalized project data stored in projects.json
 * Used for client-side search and filtering
 */
export interface Project {
  /** URL-safe identifier: owner-repo in kebab-case */
  slug: string;
  /** Repository name (display title) */
  title: string;
  /** Repository description from GitHub */
  description: string;
  /** GitHub username or organization */
  owner: string;
  /** Repository name */
  repo: string;
  /** Normalized tags (GitHub topics + custom tags) */
  tags: string[];
  /** Star count */
  stars: number;
  /** ISO date string of last update */
  updatedAt: string;
  /** Homepage URL if set on GitHub */
  homepage: string | null;
  /** GitHub repository URL */
  htmlUrl: string;
  /** Default branch name */
  defaultBranch: string;
  /** Whether this is a featured project */
  featured: boolean;
}

/**
 * Structure of the generated projects.json file
 */
export interface ProjectsIndex {
  /** All projects */
  projects: Project[];
  /** All unique tags across projects (sorted) */
  allTags: string[];
  /** ISO date string when the index was generated */
  generatedAt: string;
}

/**
 * GitHub API response types
 */
export interface GitHubRepoResponse {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  topics?: string[];
}

export interface GitHubTopicsResponse {
  names: string[];
}

export interface GitHubReadmeResponse {
  content: string;
  encoding: string;
  path: string;
}

/**
 * Cache entry structure for local development caching
 */
export interface CacheEntry {
  /** ETag from GitHub API for conditional requests */
  etag?: string;
  /** Last updated timestamp from repo */
  updatedAt: string;
  /** Cached repository metadata */
  metadata: GitHubRepoResponse;
  /** Cached topics */
  topics: string[];
  /** Cached README content (raw markdown) */
  readme: string;
  /** When this cache entry was created */
  fetchedAt: string;
}

/**
 * Sort options for the project list
 */
export type SortOption = "updated" | "stars" | "name";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  by: SortOption;
  direction: SortDirection;
}

/**
 * GitHub profile data fetched from profile README
 */
export interface Profile {
  /** GitHub username */
  username: string;
  /** Raw README markdown content */
  readme: string;
  /** ISO date string when profile was fetched */
  fetchedAt: string;
}

/**
 * Structure of the generated profile.json file
 */
export interface ProfileIndex {
  profile: Profile | null;
  fetchedAt: string;
}

/**
 * GitHub contribution data for a single day
 */
export interface ContributionDay {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of contributions on this day */
  count: number;
  /** GitHub's intensity level (0-4) */
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * Structure of the generated contributions.json file
 */
export interface ContributionsIndex {
  /** Array of contribution days for the past year */
  contributions: ContributionDay[];
  /** Total contributions in the past year */
  totalContributions: number;
  /** GitHub username */
  username: string;
  /** ISO date string when contributions were fetched */
  fetchedAt: string;
}
