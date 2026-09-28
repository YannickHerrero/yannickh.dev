import { useEffect, useRef, useState } from "react";
import { themes, type ThemeId } from "../../data/themes";
import "../../styles/theme-picker.css";

export default function ThemePicker({
  current,
  onSelect,
  onClose,
}: {
  current: ThemeId;
  onSelect: (id: ThemeId) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(
    themes.findIndex((theme) => theme.id === current)
  );
  const candidate = themes[selected];
  const move = (offset: number) =>
    setSelected((index) => (index + offset + themes.length) % themes.length);
  const apply = () => {
    onSelect(candidate.id);
    onClose();
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    stage.current?.focus();
    return () => {
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    // Warm only the selected full-size wallpaper; previews use smaller files.
    const image = new Image();
    image.src = candidate.wallpaper;
  }, [candidate]);

  return (
    <dialog
      ref={dialog}
      className="theme-picker"
      aria-labelledby="theme-picker-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
        if (
          event.key === "Enter" &&
          event.target instanceof HTMLElement &&
          (event.target === stage.current ||
            event.target.closest(".theme-card"))
        ) {
          event.preventDefault();
          apply();
        }
      }}
    >
      <div className="theme-picker-inner">
        <header className="tile-header">
          <h2 id="theme-picker-title">Switch theme</h2>
          <button
            className="text-button"
            onClick={onClose}
            aria-label="Close theme picker"
          >
            esc ×
          </button>
        </header>
        <div
          className="theme-stage"
          ref={stage}
          tabIndex={0}
          role="region"
          aria-label="Theme previews"
          aria-describedby="theme-picker-instructions"
        >
          {themes.map((theme, index) => {
            const offset =
              ((index - selected + themes.length + 2) % themes.length) - 2;
            return (
              <button
                type="button"
                key={theme.id}
                className="theme-card"
                tabIndex={-1}
                aria-label={`Preview ${theme.name}`}
                aria-pressed={index === selected}
                onClick={() => setSelected(index)}
                style={{
                  transform: `translate(-50%, -50%) translateX(${offset * 53}%) rotateY(${offset * -17}deg) scale(${1 - Math.abs(offset) * 0.13})`,
                  zIndex: 3 - Math.abs(offset),
                }}
              >
                <div
                  className="theme-preview"
                  data-theme={theme.id}
                  style={{ backgroundImage: `url("${theme.preview}")` }}
                  aria-hidden="true"
                >
                  <div className="mini-bar">
                    <span>▦ yannickh.dev</span>
                    <span>01 / workspace</span>
                  </div>
                  <div className="mini-tiles">
                    <div className="mini-window">
                      <div className="mini-title">~/home</div>
                      <div className="mini-content">
                        <span className="mini-eyebrow">
                          DEVELOPER / BUILDER
                        </span>
                        <strong>Hi, I&apos;m Yannick.</strong>
                        <span>Always building something.</span>
                        <div className="mini-rule" />
                        <span className="mini-selected">▸ Illium</span>
                        <span>· Sovereign</span>
                        <span>· Aniplayer iOS</span>
                        <span>· Explorer</span>
                      </div>
                    </div>
                    <div className="mini-window mini-detail">
                      <div className="mini-title">~/projects/illium</div>
                      <div className="mini-content">
                        <span className="mini-eyebrow">
                          DESKTOP ENVIRONMENT
                        </span>
                        <strong>Illium</strong>
                        <span>Built around your keyboard.</span>
                        <div className="mini-demo">
                          <i />
                          <i />
                          <i />
                        </div>
                        <span className="mini-selected">
                          Rust · Slint · Windows
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mini-bar mini-bottom">
                    <span>Inspired by Illium</span>
                    <span>● focused</span>
                  </div>
                </div>
                <span className="theme-card-label">{theme.name}</span>
              </button>
            );
          })}
        </div>
        <div className="theme-caption" aria-live="polite">
          <h3>{candidate.name}</h3>
          <p>{candidate.description}</p>
          <span className="muted">
            {selected + 1} / {themes.length}
            {candidate.id === current ? " · current theme" : " · preview"}
          </span>
        </div>
        <div className="theme-picker-actions">
          <button
            className="action"
            onClick={() => move(-1)}
            aria-label="Previous theme"
          >
            ←
          </button>
          <button className="action primary" onClick={apply}>
            Apply {candidate.name}
          </button>
          <button
            className="action"
            onClick={() => move(1)}
            aria-label="Next theme"
          >
            →
          </button>
        </div>
        <footer id="theme-picker-instructions">
          <span>
            <kbd>←</kbd> <kbd>→</kbd> browse
          </span>
          <span>
            <kbd>enter</kbd> apply
          </span>
          <span>
            <kbd>esc</kbd> cancel
          </span>
          <span>Illustrative workspace previews</span>
        </footer>
      </div>
    </dialog>
  );
}
