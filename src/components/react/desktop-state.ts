import { portfolio } from "../../data/portfolio";

export const validPanels = new Set([
  "about",
  "contact",
  "help",
  ...portfolio.map((p) => p.id),
]);
export interface DesktopState {
  panels: string[];
  active: string;
  maximized: string | null;
}
export const initialDesktop: DesktopState = {
  panels: [],
  active: "home",
  maximized: null,
};
export type DesktopAction =
  | { type: "open"; id: string; alongside?: boolean }
  | { type: "close"; id: string }
  | { type: "focus"; id: string }
  | { type: "maximize"; id: string }
  | { type: "restore"; state: DesktopState };

export function desktopReducer(
  state: DesktopState,
  action: DesktopAction
): DesktopState {
  if (action.type === "restore") return action.state;
  if (action.type === "open") {
    if (!validPanels.has(action.id)) return state;
    let panels = [...state.panels];
    if (!panels.includes(action.id)) {
      if (!panels.length) panels = [action.id];
      else if (action.alongside && panels.length < 2) panels.push(action.id);
      else {
        const index = action.alongside
          ? 1
          : Math.max(0, panels.indexOf(state.active));
        panels[Math.min(index, panels.length - 1)] = action.id;
      }
    }
    return { panels, active: action.id, maximized: null };
  }
  if (action.type === "close") {
    const panels = state.panels.filter((id) => id !== action.id);
    return { panels, active: "home", maximized: null };
  }
  const exists = action.id === "home" || state.panels.includes(action.id);
  if (!exists) return state;
  if (action.type === "focus")
    return {
      ...state,
      active: action.id,
      maximized: state.maximized ? action.id : null,
    };
  return {
    ...state,
    active: action.id,
    maximized: state.maximized === action.id ? null : action.id,
  };
}

export function stateFromUrl(search: string): DesktopState {
  const params = new URLSearchParams(search);
  const panels = [
    ...new Set(params.getAll("panel").filter((id) => validPanels.has(id))),
  ].slice(0, 2);
  const requested = params.get("active");
  const active =
    requested === "home" || panels.includes(requested ?? "")
      ? requested!
      : (panels.at(-1) ?? "home");
  return { panels, active, maximized: null };
}

export function urlFromState(state: DesktopState): string {
  const params = new URLSearchParams();
  state.panels.forEach((id) => params.append("panel", id));
  if (state.panels.length) params.set("active", state.active);
  return params.size ? `/?${params}` : "/";
}
