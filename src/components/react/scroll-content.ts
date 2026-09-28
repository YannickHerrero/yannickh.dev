// Scroll the active content region even when its window header has focus.
// Callers preserve text editing, modifiers, separators and modal precedence.
export function scrollContent(
  element: HTMLElement | null,
  key: string
): boolean {
  if (!element) return false;
  const page = Math.max(64, element.clientHeight * 0.85);
  switch (key) {
    case "j":
    case "ArrowDown":
      element.scrollBy({ top: 64, behavior: "instant" });
      break;
    case "k":
    case "ArrowUp":
      element.scrollBy({ top: -64, behavior: "instant" });
      break;
    case "PageDown":
      element.scrollBy({ top: page, behavior: "instant" });
      break;
    case "PageUp":
      element.scrollBy({ top: -page, behavior: "instant" });
      break;
    case "Home":
      element.scrollTo({ top: 0, behavior: "instant" });
      break;
    case "End":
      element.scrollTo({ top: element.scrollHeight, behavior: "instant" });
      break;
    default:
      return false;
  }
  return true;
}
