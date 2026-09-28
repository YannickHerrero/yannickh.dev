import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { findProject, portfolio, projectGroups } from "../../data/portfolio";
import ProjectContent from "./ProjectContent";
import InfoContent, { type InfoPage } from "./InfoContent";
import CommandPalette, { type Command } from "./CommandPalette";
import HelpDialog from "./HelpDialog";
import { neighborPanel, type PanelDirection } from "./panel-navigation";
import {
  desktopReducer,
  initialDesktop,
  stateFromUrl,
  urlFromState,
  type DesktopAction,
  type DesktopState,
} from "./desktop-state";
import "../../styles/desktop.css";

function titleFor(id: string) {
  return (
    findProject(id)?.name ??
    { home: "Home", about: "About", contact: "Contact", help: "Help" }[id] ??
    id
  );
}
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest('input, textarea, select, [contenteditable="true"]')
  );
}
function plainClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0
  );
}

export default function Desktop() {
  const [state, setState] = useState<DesktopState>(initialDesktop);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [palette, setPalette] = useState(false);
  const [help, setHelp] = useState(false);
  const [leader, setLeader] = useState(false);
  const leaderArmed = useRef(false);
  const [theme, setTheme] = useState("dark");
  const [opaque, setOpaque] = useState(false);
  const [split, setSplit] = useState(35);
  const [announcement, setAnnouncement] = useState("");
  const workspace = useRef<HTMLDivElement>(null);

  const focusPanel = useCallback((id: string, returnToProject?: string) => {
    requestAnimationFrame(() => {
      const projectLink = returnToProject
        ? document.getElementById(`project-link-${returnToProject}`)
        : null;
      (projectLink ?? document.getElementById(`window-${id}`))?.focus();
    });
  }, []);

  const act = useCallback(
    (action: DesktopAction, moveFocus = true) => {
      const next = desktopReducer(stateRef.current, action);
      stateRef.current = next;
      setState(next);
      if (action.type === "open" || action.type === "close") {
        const url = urlFromState(next);
        if (url !== location.pathname + location.search)
          history.pushState(null, "", url);
        setAnnouncement(
          action.type === "open"
            ? `Opened ${titleFor(action.id)}`
            : `Closed ${titleFor(action.id)}`
        );
      } else if (action.type === "focus") {
        history.replaceState(null, "", urlFromState(next));
      }
      if (moveFocus)
        focusPanel(
          next.active,
          action.type === "close" ? action.id : undefined
        );
    },
    [focusPanel]
  );

  useEffect(() => {
    const next = stateFromUrl(location.search);
    setHelp(
      new URLSearchParams(location.search).getAll("panel").includes("help")
    );
    stateRef.current = next;
    setState(next);
    setTheme(document.documentElement.dataset.theme ?? "dark");
    setOpaque(document.documentElement.dataset.opaque === "true");
    setReady(true);
    const restore = () => {
      const restored = stateFromUrl(location.search);
      setHelp(
        new URLSearchParams(location.search).getAll("panel").includes("help")
      );
      stateRef.current = restored;
      setState(restored);
      focusPanel(restored.active);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [focusPanel]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const cancelLeader = () => {
      clearTimeout(timeout);
      leaderArmed.current = false;
      setLeader(false);
    };
    const movePanel = (direction: PanelDirection) => {
      const current = stateRef.current;
      const ids = ["home", ...current.panels];
      const panels = ids.flatMap((id) => {
        const rect = document
          .getElementById(`window-${id}`)
          ?.getBoundingClientRect();
        return rect && rect.width > 0 && rect.height > 0
          ? [
              {
                id,
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              },
            ]
          : [];
      });
      // Mobile and maximized layouts show one window at a time.
      const next =
        panels.length > 1
          ? neighborPanel(panels, current.active, direction)
          : ids[
              ids.indexOf(current.active) +
                (direction === "h" || direction === "k" ? -1 : 1)
            ];
      if (next) act({ type: "focus", id: next });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing) {
        cancelLeader();
        return;
      }
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        cancelLeader();
        if (!help) setPalette((value) => !value);
        return;
      }
      if (isTyping(event.target) || palette || help) {
        cancelLeader();
        return;
      }
      if (event.ctrlKey && !event.metaKey && !event.altKey && key === "b") {
        event.preventDefault();
        event.stopPropagation();
        cancelLeader();
        leaderArmed.current = true;
        setLeader(true);
        timeout = setTimeout(cancelLeader, 2000);
        return;
      }
      if (leaderArmed.current) {
        cancelLeader();
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          ["h", "j", "k", "l"].includes(key)
        ) {
          event.preventDefault();
          event.stopPropagation();
          movePanel(key as PanelDirection);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "?") {
        event.preventDefault();
        setHelp(true);
      }
    };
    // Capture the leader's second key before the project list's j/k handler.
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", cancelLeader);
    window.addEventListener("pointerdown", cancelLeader);
    return () => {
      clearTimeout(timeout);
      leaderArmed.current = false;
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", cancelLeader);
      window.removeEventListener("pointerdown", cancelLeader);
    };
  }, [act, palette, help]);

  function changeTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {
      /* Optional preference. */
    }
  }
  function changeOpacity() {
    const next = !opaque;
    setOpaque(next);
    document.documentElement.dataset.opaque = String(next);
    try {
      localStorage.setItem("portfolio-opaque", String(next));
    } catch {
      /* Optional preference. */
    }
  }
  function openLink(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (!plainClick(event)) return;
    event.preventDefault();
    if (id === "help") setHelp(true);
    else act({ type: "open", id });
  }
  function resize(value: number) {
    setSplit(Math.max(25, Math.min(55, value)));
  }

  const commands: Command[] = [
    ...portfolio.map((project) => ({
      id: `open-${project.id}`,
      section: "Projects",
      label: `${project.name} - ${project.category}`,
      run: () => act({ type: "open", id: project.id, alongside: true }),
    })),
    {
      id: "help",
      section: "Navigate",
      label: "Keyboard help",
      run: () => setHelp(true),
    },
    ...["about", "contact"].map((id) => ({
      id,
      section: "Navigate",
      label: `Open ${titleFor(id)}`,
      run: () => act({ type: "open", id }),
    })),
    ...["home", ...state.panels].map((id) => ({
      id: `focus-${id}`,
      section: "Windows",
      label: `Focus ${titleFor(id)}`,
      run: () => act({ type: "focus", id }),
    })),
    {
      id: "maximize",
      section: "Windows",
      label: state.maximized
        ? "Restore tiled layout"
        : `Maximize ${titleFor(state.active)}`,
      run: () => act({ type: "maximize", id: state.active }),
    },
    ...(state.active !== "home"
      ? [
          {
            id: "close",
            section: "Windows",
            label: `Close ${titleFor(state.active)}`,
            run: () => act({ type: "close", id: state.active }),
          },
        ]
      : []),
    {
      id: "wider",
      section: "Tiling",
      label: "Widen project navigator",
      run: () => resize(split + 5),
    },
    {
      id: "narrower",
      section: "Tiling",
      label: "Narrow project navigator",
      run: () => resize(split - 5),
    },
    {
      id: "reset",
      section: "Tiling",
      label: "Reset window sizes",
      run: () => setSplit(35),
    },
    {
      id: "theme",
      section: "Appearance",
      label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
      run: changeTheme,
    },
    {
      id: "opacity",
      section: "Appearance",
      label: opaque ? "Use translucent panels" : "Use opaque panels",
      run: changeOpacity,
    },
  ];

  function tile(id: string, children: ReactNode) {
    const path =
      id === "home"
        ? "~/home"
        : findProject(id)
          ? `~/projects/${id}`
          : `~/${id}`;
    return (
      <section
        id={`window-${id}`}
        key={id}
        className={`tile surface ${id === "home" ? "home-tile" : "detail-tile"}`}
        tabIndex={-1}
        aria-label={`${titleFor(id)} window`}
        data-active={state.active === id}
        data-window={id}
        hidden={!!state.maximized && state.maximized !== id}
        onFocusCapture={() => {
          if (stateRef.current.active !== id) act({ type: "focus", id }, false);
        }}
        onPointerDown={() => {
          if (stateRef.current.active !== id) act({ type: "focus", id }, false);
        }}
      >
        <header className="tile-header">
          <span className="tile-path">
            <span className="window-symbol" aria-hidden="true">
              {id === "home" ? "▦" : "◇"}
            </span>
            {path}
          </span>
          {ready && (
            <div className="window-controls">
              <button
                onClick={() => act({ type: "maximize", id })}
                aria-label={`${state.maximized === id ? "Restore" : "Maximize"} ${titleFor(id)}`}
                title={state.maximized === id ? "Restore tiling" : "Maximize"}
              >
                {state.maximized === id ? "⊟" : "□"}
              </button>
              {id !== "home" && (
                <button
                  onClick={() => act({ type: "close", id })}
                  aria-label={`Close ${titleFor(id)}`}
                  title="Close window"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </header>
        <div
          className="tile-body"
          tabIndex={0}
          role="region"
          aria-label={`${titleFor(id)} content`}
        >
          {children}
        </div>
        <footer className="tile-status">
          <span>
            {id === "home"
              ? `${portfolio.length} projects / selected work`
              : (findProject(id)?.status ?? "Yannick Herrero")}
          </span>
          <span>{state.active === id ? "● focused" : "○ idle"}</span>
        </footer>
      </section>
    );
  }

  return (
    <div className="desktop" data-ready={ready}>
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            if (plainClick(event)) {
              event.preventDefault();
              act({ type: "focus", id: "home" });
            }
          }}
        >
          <span className="accent">▦</span>yannickh.dev
        </a>
        <nav aria-label="Main navigation">
          <a
            href="/"
            onClick={(event) => {
              if (plainClick(event)) {
                event.preventDefault();
                act({ type: "focus", id: "home" });
              }
            }}
          >
            Projects
          </a>
          <a href="/about" onClick={(event) => openLink(event, "about")}>
            About
          </a>
          <a href="/contact" onClick={(event) => openLink(event, "contact")}>
            Contact
          </a>
        </nav>
        <div className="topbar-right">
          <span className="availability">
            <span className="status-dot" />
            Open to freelance
          </span>
          {ready && (
            <button
              className="command-trigger"
              onClick={() => setPalette(true)}
            >
              Commands <kbd>⌘ / Ctrl K</kbd>
            </button>
          )}
        </div>
      </header>
      <main id="main-content" className="desktop-main">
        <div className="workspace-heading">
          <span>
            <span className="accent">01</span> / personal workspace
          </span>
          <span>
            France <span aria-hidden="true">·</span> desktop / mobile / web
          </span>
        </div>
        {ready && (
          <nav className="window-switcher" aria-label="Open windows">
            {["home", ...state.panels].map((id) => (
              <button
                key={id}
                aria-pressed={state.active === id}
                onClick={() => act({ type: "focus", id })}
              >
                {titleFor(id)}
              </button>
            ))}
            <button
              className="switcher-add"
              onClick={() => setPalette(true)}
              aria-label="Open a window"
            >
              +
            </button>
          </nav>
        )}
        <div
          ref={workspace}
          className="workspace"
          data-count={state.panels.length}
          data-maximized={!!state.maximized}
          style={{ "--navigator-width": `${split}%` } as CSSProperties}
        >
          {tile(
            "home",
            <div className="home-content">
              <div className="home-intro">
                <p className="eyebrow">
                  Developer / builder / endlessly curious
                </p>
                <h1>
                  Hi, I&apos;m Yannick<span className="accent">.</span>
                </h1>
                <p className="home-lead">
                  If an idea gets stuck in my head,
                  <br className="wide-only" /> I&apos;ll probably end up
                  building it.
                </p>
                <div className="home-signature">
                  <span className="muted">
                    Freelance developer, based in France.
                  </span>
                  <span className="accent">Rust · TypeScript · Swift</span>
                </div>
              </div>
              <div className="projects-heading">
                <h2>Selected projects</h2>
                {ready ? (
                  <button
                    className="text-button"
                    onClick={() => setPalette(true)}
                  >
                    Find a project <kbd>Ctrl K</kbd>
                  </button>
                ) : (
                  <span className="muted">Explore my work ↘</span>
                )}
              </div>
              <div
                className="project-navigator"
                onKeyDown={(event) => {
                  if (
                    !["ArrowDown", "ArrowUp", "j", "k", "Home", "End"].includes(
                      event.key
                    ) ||
                    isTyping(event.target) ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.altKey
                  )
                    return;
                  const links = Array.from(
                    event.currentTarget.querySelectorAll<HTMLAnchorElement>(
                      ".project-link"
                    )
                  );
                  const index = links.indexOf(
                    document.activeElement as HTMLAnchorElement
                  );
                  if (index < 0) return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? links.length - 1
                        : (index +
                            (["ArrowDown", "j"].includes(event.key) ? 1 : -1) +
                            links.length) %
                          links.length;
                  links[next]?.focus();
                }}
              >
                {projectGroups.map((group) => (
                  <section
                    key={group}
                    className="project-group"
                    aria-label={group}
                  >
                    <h3 className="eyebrow">{group}</h3>
                    {portfolio
                      .filter((project) => project.group === group)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="project-row"
                          data-open={state.panels.includes(project.id)}
                        >
                          <a
                            id={`project-link-${project.id}`}
                            className="project-link"
                            href={`/work/${project.id}`}
                            onClick={(event) => openLink(event, project.id)}
                          >
                            <span className="project-cursor" aria-hidden="true">
                              {state.panels.includes(project.id) ? "▸" : "·"}
                            </span>
                            <span className="project-row-main">
                              <span className="project-name">
                                {project.name}
                              </span>
                              <span className="project-category">
                                {project.category}
                              </span>
                            </span>
                            <span className="project-row-stack">
                              {project.stack[0]}
                            </span>
                            <span className="project-arrow" aria-hidden="true">
                              ↗
                            </span>
                          </a>
                          {ready && (
                            <button
                              className="alongside"
                              aria-label={`Open ${project.name} alongside`}
                              title="Open alongside (keep another window)"
                              onClick={() =>
                                act({
                                  type: "open",
                                  id: project.id,
                                  alongside: true,
                                })
                              }
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}
                  </section>
                ))}
              </div>
              <div className="home-bottom">
                <a
                  href="https://github.com/YannickHerrero"
                  target="_blank"
                  rel="noreferrer"
                >
                  All repositories ↗
                </a>
                <a href="mailto:hello@yannickh.dev">
                  Let&apos;s build something ↗
                </a>
              </div>
            </div>
          )}
          {state.panels.length > 0 && !state.maximized && (
            <div
              className="window-divider"
              role="separator"
              tabIndex={0}
              aria-label="Resize project navigator"
              aria-orientation="vertical"
              aria-valuemin={25}
              aria-valuemax={55}
              aria-valuenow={split}
              onKeyDown={(event) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  resize(
                    event.key === "Home"
                      ? 25
                      : event.key === "End"
                        ? 55
                        : split + (event.key === "ArrowLeft" ? -2 : 2)
                  );
                }
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                event.preventDefault();
                event.currentTarget.focus();
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId))
                  return;
                const rect = workspace.current?.getBoundingClientRect();
                if (rect)
                  resize(
                    Math.round(((event.clientX - rect.left) / rect.width) * 100)
                  );
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  event.currentTarget.releasePointerCapture(event.pointerId);
              }}
            />
          )}
          {state.panels.length > 0 && (
            <div
              className="detail-grid"
              data-count={state.panels.length}
              hidden={state.maximized === "home"}
            >
              {state.panels.map((id) =>
                tile(
                  id,
                  findProject(id) ? (
                    <ProjectContent project={findProject(id)!} />
                  ) : (
                    <InfoContent page={id as InfoPage} />
                  )
                )
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="desktop-footer">
        <span>
          <span className="accent">▦</span> Inspired by{" "}
          <a href="https://github.com/YannickHerrero/illium">Illium</a>
        </span>
        {leader ? (
          <span className="leader-hint accent">
            Ctrl+B → h left · j down · k up · l right
          </span>
        ) : (
          <span className="footer-hints">
            <kbd>ctrl/⌘ k</kbd> commands <kbd>ctrl b</kbd> then <kbd>hjkl</kbd>{" "}
            panels
          </span>
        )}
        <a href="/help" onClick={(event) => openLink(event, "help")}>
          Help <kbd>?</kbd>
        </a>
      </footer>
      <div role="status" className="sr-only">
        {leader
          ? "Panel navigation: H left, J down, K up, L right. Escape to cancel."
          : announcement}
      </div>
      {palette && (
        <CommandPalette commands={commands} onClose={() => setPalette(false)} />
      )}
      {help && <HelpDialog onClose={() => setHelp(false)} />}
    </div>
  );
}
