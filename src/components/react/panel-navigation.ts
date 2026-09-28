export type PanelDirection = "h" | "j" | "k" | "l";
export interface PanelBounds {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

// Choose the nearest center in the requested direction, within a 90-degree cone.
// Geometry follows the actual responsive layout, including stacked detail panes.
export function neighborPanel(
  panels: PanelBounds[],
  active: string,
  direction: PanelDirection
): string | undefined {
  const origin = panels.find((panel) => panel.id === active);
  if (!origin) return;
  const horizontal = direction === "h" || direction === "l";
  const sign = direction === "h" || direction === "k" ? -1 : 1;
  return panels
    .filter((panel) => panel.id !== active)
    .map((panel) => {
      const dx = panel.left + panel.width / 2 - origin.left - origin.width / 2;
      const dy = panel.top + panel.height / 2 - origin.top - origin.height / 2;
      const forward = (horizontal ? dx : dy) * sign;
      const sideways = Math.abs(horizontal ? dy : dx);
      return { id: panel.id, forward, sideways, distance: Math.hypot(dx, dy) };
    })
    .filter((panel) => panel.forward > 1 && panel.sideways <= panel.forward)
    .sort((a, b) => a.distance - b.distance)[0]?.id;
}
