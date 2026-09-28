# Yannick's workspace

A personal portfolio styled as a small tiling desktop, inspired by [Illium](https://github.com/YannickHerrero/illium). Built with Astro, React and CSS Grid. Static pages remain available without JavaScript.

## The desktop

- Original mountain wallpaper, 75%-opaque panel backgrounds and backdrop blur. Text and screenshots stay fully opaque.
- Five visual themes: Original (default), Akane, Snow, Ruins and Catppuccin Latte, with a self-hosted JetBrains Mono font.
- An Illium-style coverflow theme picker and modal keyboard help. Home fills the workspace when it is the only window.
- A project navigator, up to two detail windows, automatic tiling, maximize/restore and close controls.
- A draggable and keyboard-adjustable navigator divider (25–55%). Detail windows stack on medium screens and sit side by side on wide screens.
- A command palette for navigation, focusing windows, layout actions, theme and transparency preferences.
- A single visible window with a window switcher on mobile. No forced horizontal scrolling.
- Shareable desktop URLs, browser back/forward support and standalone `/work/:id` pages.
- Original `/project/:slug` URLs are preserved as an archive, with repository READMEs available in an expandable section.

## Run locally

Requires Bun 1.3.14 or later.

```sh
bun install
# Recommended: export GITHUB_TOKEN in your shell for the build-time public GitHub sync.
bun run dev
```

The dev server runs at `http://localhost:4321`. `dev` and `build` sync public GitHub repositories first. An unauthenticated cold sync can exceed GitHub's 60-request/hour limit. Use an environment token with read access only; never commit it. No token is sent to the browser.

After the first sync, iterate without hitting GitHub:

```sh
bun run astro dev
```

Production build and local preview:

```sh
bun run build
bun run preview
```

## Editing the portfolio

The curated content lives in **`src/data/portfolio.ts`**, independently of GitHub popularity:

- `group` and array order control the navigator.
- `summary`, `story` and `highlights` provide the editorial presentation.
- `stack` and `status` describe the project without inferring maturity from push dates.
- `repo` and `website` are optional, so products like Doku do not need a public repository.
- Screenshots live in `public/images/`; sources and attribution are documented there.

The selected projects are Illium, Sovereign, Aniplayer iOS, Explorer, Doku and miru, with Traki, Hibi and Solaris as additional work.

`repos.config.ts` separately maintains the legacy GitHub archive. Retain old entries to keep existing inbound URLs working. `scripts/sync-github.ts` generates ignored content in `src/content/projects/` and metadata in `src/generated/`; API responses are cached in `.cache/`.

## Keyboard and mouse

| Action             | Keyboard                                                           | Mouse / touch              |
| ------------------ | ------------------------------------------------------------------ | -------------------------- |
| Commands           | `Ctrl+K` / `Cmd+K`                                                 | Commands button            |
| Navigate projects  | `j/k` or `↑/↓` anywhere in active Home; Home/End select first/last | Click a project            |
| Scroll content     | `j/k`, `↑/↓`, PageUp/PageDown, Home/End in projects and help       | Mouse wheel / touch        |
| Open project       | Enter                                                              | Click its name             |
| Open alongside     | Select `Project name - category` in Commands, or Tab to `+`        | Project command or `+`     |
| Focus a window     | `Ctrl+B`, release, then `h/j/k/l`; Tab or “Focus …” command        | Window switcher or panel   |
| Switch theme       | `Ctrl+B`, release, then `w`; or “Switch theme” in Commands         | “Switch theme” in Commands |
| Maximize / restore | Window button or command                                           | Title-bar square button    |
| Close              | Window button or command                                           | Title-bar `×`              |
| Resize navigator   | Focus separator; left/right, Home/End, or commands                 | Drag separator             |
| Dismiss popup      | Escape                                                             | Close button or backdrop   |
| Help               | `?` outside text fields                                            | Help link                  |

Clicking a project in Home replaces a detail window. Each project has one descriptive palette entry, which opens it alongside the current project (like the `+` button); if both slots are occupied, the second is replaced. Home cannot be closed. Each window's scroll region is keyboard-focusable. Project navigation works immediately after page load or focusing Home, not only after tabbing to a project link. Home remembers the last focused project when switching panels. In a project or the help popup, `j/k` and arrows scroll only that content region, even when its header has focus. PageUp/PageDown scroll by a page; Home/End jump to the top/bottom. Text fields, palette search, modifier combinations and resize separators keep their own key handling.

**Leader sequence:** press Ctrl+B, release it, then press H (left), J (down), K (up), L (right), or W (themes). The prefix expires after two seconds; Escape, a click or loss of window focus cancels it. Directional focus follows the actual panel geometry. On mobile or in maximized mode, H/K select the previous window and J/L the next. The handler consumes the second key before list navigation and never arms the prefix in text fields or dialogs. Browser shortcuts are intercepted only while focus is in the web page; extensions/OS-level reserved shortcuts may still take priority. `/` is no longer a shortcut.

The palette, help and theme selector use native modal dialogs with focus containment and restoration. Theme and opacity preferences use local storage when available. “Use opaque panels” offers a no-blur, high-contrast alternative. Reduced-motion and reduced-transparency preferences are respected, and browsers without backdrop-filter support use opaque panels.

## Themes

`src/data/themes.ts` lists the themes and image paths; palette tokens live in `src/styles/global.css`. The default Original theme is retained for new visitors. Existing `light` preferences migrate to Catppuccin Latte.

In the picker, left/right arrows or the arrow buttons browse the carousel. Clicking a visible preview selects it; Enter or Apply commits the choice. Escape cancels without changing the active theme. The choice persists across reloads and static project pages when browser storage is available.

Only the first wallpaper from Akane, Snow and Latte is included. Ruins uses the user-selected `ruins.jpg` and Illium's matching cached Dynamic Dark palette, not the palette of whatever wallpaper is currently active. Full-size wallpapers and small picker previews are optimized separately. The previews are illustrative HTML layouts, not personal desktop screenshots. Attribution and remaining third-party artwork licensing uncertainties are recorded in `public/images/README.md`; those assets are not relicensed as MIT.

## Validation

```sh
bun run lint
bun run check
bun run test
bunx playwright install chromium
bun run test:e2e
```

Run the GitHub sync at least once before the checks/build. Browser tests build and serve the static output, covering desktop and mobile mouse/keyboard navigation, focus restoration, tiling, resizing, history, preferences, blocked storage, small screens, no-JavaScript pages and axe accessibility checks. Screenshots and failure traces are written to ignored `test-results/`.

CI runs the same checks on pull requests and pushes to `master`. The headless Chromium configuration avoids the host WSLg display to keep compositor frames reliable.

## Deployment

The output is static HTML in `dist/`, suitable for Vercel. Keep a build-time `GITHUB_TOKEN` configured for the archive sync. The existing daily rebuild workflow uses the `VERCEL_DEPLOY_HOOK` repository secret.

## Structure

```text
src/data/portfolio.ts                    Curated project content
src/data/themes.ts                       Theme catalog and preference helpers
src/components/react/ThemePicker.tsx     Visual theme carousel
src/components/react/HelpDialog.tsx      Keyboard help popup
src/components/react/panel-navigation.ts Directional focus geometry
src/components/react/Desktop.tsx         Desktop shell and input handling
src/components/react/desktop-state.ts    Window state and URL serialization
src/components/react/CommandPalette.tsx  Searchable command dialog
src/components/react/ProjectContent.tsx  Shared project presentation
src/components/react/InfoContent.tsx     About, contact and keyboard help
src/styles/global.css                    Theme and shared presentation
src/styles/desktop.css                   Tiling, palette and responsive layout
src/pages/work/[id].astro                Static curated project pages
src/pages/project/[slug].astro           Preserved legacy archive pages
```

## License

MIT. See `public/images/README.md` for visual asset sources; artwork visible inside application screenshots belongs to its respective owners.
