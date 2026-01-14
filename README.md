# Project Catalog

A production-ready static website for showcasing curated GitHub repositories. Built with Astro, React, and Tailwind CSS.

## Features

- **100% Static Output** - Pre-rendered pages for maximum performance
- **Build-time GitHub Sync** - All data fetched at build time, no runtime API calls
- **Fuzzy Search** - Client-side search powered by Fuse.js
- **Tag Filtering** - Filter projects by GitHub topics and custom tags
- **Sorting** - Sort by stars, last updated, or name
- **README Rendering** - Each project page displays the repository README with syntax highlighting
- **Responsive Design** - Clean, mobile-first UI with Tailwind CSS

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or later

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd project-catalog

# Install dependencies
bun install
```

### Development

```bash
# Sync GitHub data and start dev server
bun run dev
```

This will:

1. Fetch repository data from GitHub
2. Generate static content files
3. Start the Astro dev server at http://localhost:4321

### Build for Production

```bash
# Sync and build static site
bun run build

# Preview the production build
bun run preview
```

## Adding Repositories

Edit `repos.config.ts` to add repositories to your catalog:

```typescript
import type { RepoConfig } from "./src/types";

export const repos: RepoConfig[] = [
  // Basic usage
  {
    owner: "facebook",
    repo: "react",
  },

  // With optional fields
  {
    owner: "vercel",
    repo: "next.js",
    featured: true, // Pin to top of list
    customTags: ["framework"], // Add custom tags
  },
];
```

### RepoConfig Options

| Field        | Type     | Required | Description                                 |
| ------------ | -------- | -------- | ------------------------------------------- |
| `owner`      | string   | Yes      | GitHub username or organization             |
| `repo`       | string   | Yes      | Repository name                             |
| `featured`   | boolean  | No       | Pin project to top of list                  |
| `customTags` | string[] | No       | Additional tags to merge with GitHub topics |

## GitHub Sync

The sync script (`scripts/sync-github.ts`) handles all GitHub data fetching:

### What It Does

1. Reads repository list from `repos.config.ts`
2. Fetches from GitHub API:
   - Repository metadata (name, description, stars, etc.)
   - Topics (used as tags)
   - README content
3. Processes README:
   - Rewrites relative URLs to absolute GitHub URLs
   - Preserves GitHub-flavored markdown
4. Generates:
   - `src/generated/projects.json` - Index for client-side search
   - `src/content/projects/*.md` - Markdown files for each project

### Running Manually

```bash
bun run sync:github
```

### Rate Limits

Without authentication, GitHub allows 60 requests per hour. For higher limits, you need a GitHub Personal Access Token.

#### Getting a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name like "project-catalog-sync"
4. Select scope: **`public_repo`** (only needed for public repos)
5. Click **Generate token** and copy it immediately

#### Using the Token

**Option 1: Environment variable**

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
bun run build
```

**Option 2: Create `.env.local` file (recommended)**

```bash
cp .env.example .env.local
# Edit .env.local and add your token
```

The `.env.local` file:

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

With a token, you get 5,000 requests per hour instead of 60.

### Caching

The sync script caches API responses in `.cache/` to:

- Speed up development rebuilds
- Reduce API calls
- Use conditional requests (ETags) when possible

Clear the cache to force fresh data:

```bash
rm -rf .cache
```

## Project Structure

```
project-catalog/
├── repos.config.ts          # Your curated repo list
├── scripts/
│   └── sync-github.ts       # GitHub sync script
├── src/
│   ├── components/
│   │   └── react/
│   │       └── ProjectCatalog.tsx  # Search/filter React island
│   ├── content/
│   │   ├── config.ts        # Astro content collection schema
│   │   └── projects/        # Generated: project markdown files
│   ├── generated/
│   │   └── projects.json    # Generated: search index
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ProjectLayout.astro
│   ├── pages/
│   │   ├── index.astro      # Home page
│   │   └── project/
│   │       └── [slug].astro # Project detail pages
│   ├── styles/
│   │   └── global.css       # Tailwind + custom styles
│   └── types/
│       └── index.ts         # TypeScript types
├── public/
│   └── favicon.svg
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Available Scripts

| Script                 | Description                 |
| ---------------------- | --------------------------- |
| `bun run dev`          | Sync + start dev server     |
| `bun run build`        | Sync + build for production |
| `bun run preview`      | Preview production build    |
| `bun run sync:github`  | Sync GitHub data only       |
| `bun run lint`         | Run ESLint                  |
| `bun run lint:fix`     | Fix ESLint errors           |
| `bun run format`       | Format with Prettier        |
| `bun run format:check` | Check formatting            |

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Go to [Vercel](https://vercel.com) and click **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Astro - settings are pre-configured in `vercel.json`
5. **Add your GitHub token as an environment variable:**
   - Go to **Settings** → **Environment Variables**
   - Add: `GITHUB_TOKEN` = `ghp_xxxxxxxxxxxxxxxxxxxx`
   - Select all environments (Production, Preview, Development)
6. Click **Deploy**

The build will automatically sync GitHub data and generate static pages.

### Manual Deployment

Build the static site:

```bash
bun run build
```

The output is in `dist/`. Deploy to any static hosting:

- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront

## Environment Variables

| Variable       | Required | Description                                          |
| -------------- | -------- | ---------------------------------------------------- |
| `GITHUB_TOKEN` | No       | GitHub PAT for higher rate limits (5000/hr vs 60/hr) |

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v5
- **UI Components**: [React](https://react.dev/) 19 (islands only)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3
- **Search**: [Fuse.js](https://www.fusejs.io/)
- **Package Manager**: [Bun](https://bun.sh/)
- **Syntax Highlighting**: [Shiki](https://shiki.matsu.io/) (built into Astro)

## License

MIT
