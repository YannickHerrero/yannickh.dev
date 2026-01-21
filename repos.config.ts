import type { RepoConfig } from "./src/types";

/**
 * Curated list of repositories to include in the project catalog.
 *
 * Add repositories by specifying the owner and repo name.
 * Optionally mark as featured or add custom tags.
 *
 * Example:
 * {
 *   owner: "facebook",
 *   repo: "react",
 *   featured: true,
 *   customTags: ["ui-library", "frontend"]
 * }
 */
export const repos: RepoConfig[] = [
  {
    owner: "YannickHerrero",
    repo: "mira",
    featured: true,
    customTags: [
      "media-streaming",
      "mobile",
      "react-native",
      "expo",
      "video-player",
      "cross-platform",
    ],
  },
  {
    owner: "YannickHerrero",
    repo: "miru",
    customTags: [
      "tui",
      "cli",
      "rust",
      "media-streaming",
      "terminal",
      "video-player",
    ],
  },
  {
    owner: "YannickHerrero",
    repo: "life",
    customTags: [
      "pwa",
      "habit-tracker",
      "offline-first",
      "personal-dashboard",
      "web-app",
    ],
  },
  {
    owner: "YannickHerrero",
    repo: "dotfiles",
    customTags: [
      "dotfiles",
      "config",
      "neovim",
      "tmux",
      "zsh",
      "linux",
      "developer-tools",
    ],
  },
  {
    owner: "YannickHerrero",
    repo: "mtools",
    customTags: [
      "developer-tools",
      "privacy-first",
      "local-first",
      "productivity",
      "web-app",
      "api-client",
    ],
  },
  {
    owner: "YannickHerrero",
    repo: "Yomu",
    customTags: [
      "ios",
      "mobile",
      "japanese-learning",
      "flashcards",
      "srs",
      "language-learning",
    ],
  },
  {
    owner: "YannickHerrero",
    repo: "user-styles",
    customTags: [
      "userstyles",
      "browser-extension",
      "theming",
      "base16",
      "css",
      "stylus",
    ],
  },
];
