import { useEffect, useRef } from "react";
import InfoContent from "./InfoContent";

export default function HelpDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="help-dialog"
      aria-labelledby="help-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="help-inner">
        <header className="tile-header">
          <h2 id="help-title">Keyboard & navigation</h2>
          <button
            className="text-button"
            onClick={onClose}
            aria-label="Close help"
          >
            esc ×
          </button>
        </header>
        <div
          className="help-body"
          tabIndex={0}
          role="region"
          aria-label="Keyboard help content"
        >
          <InfoContent page="help" />
        </div>
      </div>
    </dialog>
  );
}
