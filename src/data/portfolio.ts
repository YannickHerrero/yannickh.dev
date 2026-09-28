export interface PortfolioProject {
  id: string;
  name: string;
  group: "Currently building" | "Selected work" | "More projects";
  category: string;
  summary: string;
  story: string;
  highlights: string[];
  stack: string[];
  status: string;
  repo?: string;
  website?: string;
  image?: string;
  imageAlt?: string;
  imageShape?: "portrait";
}

export const projectGroups = [
  "Currently building",
  "Selected work",
  "More projects",
] as const;
const github = "https://github.com/YannickHerrero";

// Editorial order is intentional. Popularity and a recent push are not proxies for quality.
export const portfolio: PortfolioProject[] = [
  {
    id: "illium",
    name: "Illium",
    group: "Currently building",
    category: "Desktop environment",
    summary: "A quieter Windows desktop. Built around your keyboard.",
    story:
      "A tiling window manager and experimental Windows 11 shell written in Rust. Workspaces, a launcher, panels and companion applications share one visual language. This portfolio borrows its window-management approach and Catppuccin palette.",
    highlights: [
      "Automatic tiling and keyboard-driven workspaces",
      "A shared theme across the shell and companion apps",
      "V1 integration validation is ongoing; not a verified stable release",
    ],
    stack: ["Rust", "Slint", "Windows 11"],
    status: "Experimental",
    repo: `${github}/illium`,
  },
  {
    id: "sovereign",
    name: "Sovereign",
    group: "Currently building",
    category: "Developer tools",
    summary: "Your coding agents. Your machines. Wherever you are.",
    story:
      "A self-hosted console that brings agent tasks, conversations and diffs into one interface. A Rust server runs on each machine, with a responsive Svelte interface for desktop and phone.",
    highlights: [
      "Adapters for pi and Claude Code",
      "Tasks, conversations and diffs in one workspace",
      "Remote access to agents running on your own hardware",
    ],
    stack: ["Rust", "Svelte", "TypeScript"],
    status: "In development",
    repo: `${github}/sovereign`,
    website: "https://sovereign-landing-chi.vercel.app/",
    image: "/images/sovereign.webp",
    imageAlt:
      "Sovereign desktop interface showing a conversation and project workspaces with demo data",
  },
  {
    id: "aniplayer-ios",
    name: "Aniplayer iOS",
    group: "Selected work",
    category: "Native Apple app",
    summary: "Anime, manga and your progress. All in one place.",
    story:
      "A personal SwiftUI anime player and manga reader built around AniList. Native video playback, offline downloads and a reading interface live alongside release schedules and watch progress. The repository also includes macOS and visionOS targets.",
    highlights: [
      "MPVKit playback with subtitle and audio-track controls",
      "AniList watchlists and reading-progress tracking",
      "Offline episodes and manga chapters",
    ],
    stack: ["SwiftUI", "MPVKit", "AniList"],
    status: "Personal app",
    repo: `${github}/aniplayer-ios`,
    image: "/images/aniplayer.webp",
    imageAlt:
      "Aniplayer iPhone watchlist with continue-watching progress and anime poster grid",
    imageShape: "portrait",
  },
  {
    id: "explorer",
    name: "Explorer",
    group: "Selected work",
    category: "Windows utility",
    summary: "Your files, without fighting your file manager.",
    story:
      "A keyboard-driven Windows file explorer with Finder-style columns. Built with Tauri, React and Rust, it combines rich previews with optional Vim navigation and familiar file operations.",
    highlights: [
      "Column navigation, quick open and rich file previews",
      "Optional Vim bindings alongside mouse navigation",
      "Scoop installation and standalone Windows releases",
    ],
    stack: ["Tauri", "React", "Rust"],
    status: "Installable",
    repo: `${github}/Explorer`,
    image: "/images/explorer.webp",
    imageAlt:
      "Explorer file manager with column navigation and a preview panel",
  },
  {
    id: "doku",
    name: "Doku",
    group: "Selected work",
    category: "Language learning",
    summary: "A little French, one story at a time.",
    story:
      "A French-learning app built around graded stories and a cat mascot. Read at your level, look up words as you go and build a reading habit without leaving the story.",
    highlights: [
      "Graded stories for French learners",
      "Tap-to-translate and audio pronunciation",
      "Reading-progress tracking",
    ],
    stack: ["Mobile", "Language learning"],
    status: "Product",
    website: "https://www.learnfrenchwithdoku.app/",
  },
  {
    id: "miru",
    name: "miru",
    group: "Selected work",
    category: "Terminal application",
    summary: "From search to playback, without leaving the terminal.",
    story:
      "A Rust CLI for discovering movies, TV shows and anime through TMDB, resolving sources with Torrentio and playing them in MPV. A focused terminal interface keeps the journey short.",
    highlights: [
      "Keyboard-first search and episode selection",
      "MPV playback with configurable themes",
      "Optional Real-Debrid integration",
    ],
    stack: ["Rust", "TUI", "MPV"],
    status: "Public source",
    repo: `${github}/miru`,
  },
  {
    id: "traki",
    name: "Traki",
    group: "More projects",
    category: "Native Apple app",
    summary: "Make language-learning time visible.",
    story:
      "A one-tap study timer with separate learning modes, session history and consistency statistics. Native Apple integrations keep the timer close without requiring the app to stay open.",
    highlights: [
      "Widgets and Live Activities",
      "Apple Watch companion",
      "Session-based statistics and iCloud sync",
    ],
    stack: ["SwiftUI", "WidgetKit", "watchOS"],
    status: "Personal app",
    repo: `${github}/traki`,
    image: "/images/traki.webp",
    imageAlt:
      "Traki home screen with language-learning modes and study progress",
    imageShape: "portrait",
  },
  {
    id: "hibi",
    name: "Hibi",
    group: "More projects",
    category: "Language learning",
    summary: "Turn Japanese immersion into something you remember.",
    story:
      "A self-hosted ecosystem connecting sentence mining, reading, listening and spaced repetition. One flashcard backend serves a family of immersion and review clients.",
    highlights: [
      "Shared API and TypeScript client SDK",
      "Sentence mining from immersion content",
      "FSRS-based spaced repetition",
    ],
    stack: ["TypeScript", "Hono", "React"],
    status: "Public source",
    repo: `${github}/hibi`,
  },
  {
    id: "solaris",
    name: "Solaris",
    group: "More projects",
    category: "Terminal game",
    summary: "Start with a solar panel. End with a universe.",
    story:
      "A cosmic idle game that lives in your terminal. Build an energy empire through increasingly improbable machines, upgrades and prestige mechanics.",
    highlights: [
      "Twenty types of energy producers",
      "Upgrades, achievements and prestige progression",
      "Offline progress and a keyboard-driven interface",
    ],
    stack: ["Rust", "Ratatui"],
    status: "Playable",
    repo: `${github}/Solaris`,
    image: "/images/solaris.webp",
    imageAlt:
      "Solaris terminal game with energy production, upgrades and resources",
  },
];

export function findProject(id: string) {
  return portfolio.find((project) => project.id === id);
}
