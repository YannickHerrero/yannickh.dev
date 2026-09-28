# Yannick's workspace

A personal portfolio styled as a small tiling desktop, inspired by [Illium](https://github.com/YannickHerrero/illium). Built with Astro, React and CSS Grid. Static pages remain available without JavaScript.

## The desktop

- Original mountain wallpaper, 75%-opaque panel backgrounds and backdrop blur. Text and screenshots stay fully opaque.
- Illium-inspired Catppuccin dark/light colors and a self-hosted JetBrains Mono font.
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

| Action             | Keyboard                                           | Mouse / touch            |
| ------------------ | -------------------------------------------------- | ------------------------ |
| Commands           | `Ctrl+K` / `Cmd+K`, or `/` outside text fields     | Commands button          |
| Navigate projects  | Tab, arrows, or `j` / `k` in the project list      | Click a project          |
| Open project       | Enter                                              | Click its name           |
| Open alongside     | “Open … alongside” command, or Tab to `+`          | `+` next to a project    |
| Focus a window     | Tab or “Focus …” command                           | Window switcher or panel |
| Maximize / restore | Window button or command                           | Title-bar square button  |
| Close              | Window button or command                           | Title-bar `×`            |
| Resize navigator   | Focus separator; left/right, Home/End, or commands | Drag separator           |
| Dismiss palette    | Escape                                             | Close button or backdrop |
| Help               | `?` outside text fields                            | Help link                |

Normal project opens replace a detail window. “Alongside” keeps a second detail window; if both slots are already occupied, it replaces the second. The Home window cannot be closed. Each window's scroll region is keyboard-focusable.

The palette uses a native modal dialog with focus containment and restoration. Theme and opacity preferences use local storage when available. “Use opaque panels” offers a no-blur, high-contrast alternative. Reduced-motion and reduced-transparency preferences are respected, and browsers without backdrop-filter support use opaque panels.

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
