import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export interface Command {
  id: string;
  label: string;
  section: string;
  run: () => void;
}
export default function CommandPalette({
  commands,
  onClose,
}: {
  commands: Command[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const filtered = useMemo(
    () =>
      commands.filter((command) =>
        `${command.label} ${command.section}`
          .toLowerCase()
          .includes(query.toLowerCase().trim())
      ),
    [commands, query]
  );
  const index = Math.min(selected, Math.max(filtered.length - 1, 0));

  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const modal = dialog.current;
    modal?.showModal();
    input.current?.focus();
    return () => {
      modal?.close();
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    document
      .getElementById(`command-${index}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [index, query]);

  function execute(command: Command) {
    onClose();
    requestAnimationFrame(command.run);
  }
  return (
    <dialog
      ref={dialog}
      className="command-dialog"
      aria-labelledby="command-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="command-inner">
        <header>
          <span id="command-title">Command palette</span>
          <button
            className="text-button"
            onClick={onClose}
            aria-label="Close command palette"
          >
            esc ×
          </button>
        </header>
        <div className="command-search">
          <span aria-hidden="true">❯</span>
          <input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            placeholder="Find a project, window or action…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-autocomplete="list"
            aria-activedescendant={
              filtered.length ? `command-${index}` : undefined
            }
            onKeyDown={(event) => {
              if (["ArrowDown", "ArrowUp", "Enter"].includes(event.key))
                event.preventDefault();
              if (event.key === "ArrowDown")
                setSelected((index + 1) % Math.max(1, filtered.length));
              if (event.key === "ArrowUp")
                setSelected(
                  (index - 1 + filtered.length) % Math.max(1, filtered.length)
                );
              if (event.key === "Enter" && filtered[index])
                execute(filtered[index]);
            }}
          />
        </div>
        <ul
          id="command-results"
          role="listbox"
          aria-label="Commands"
          className="command-results"
        >
          {filtered.map((command, i) => (
            <li
              key={command.id}
              id={`command-${i}`}
              role="option"
              aria-selected={i === index}
              onMouseMove={() => setSelected(i)}
              onClick={() => execute(command)}
            >
              <span className="command-section">{command.section}</span>
              <span>{command.label}</span>
              <span className="command-enter" aria-hidden="true">
                ↵
              </span>
            </li>
          ))}
        </ul>
        {!filtered.length && (
          <p className="command-empty" role="status">
            No commands found. Try a project name or “theme”.
          </p>
        )}
        <footer>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>enter</kbd> select
          </span>
          <span>{filtered.length} results</span>
        </footer>
      </div>
    </dialog>
  );
}
