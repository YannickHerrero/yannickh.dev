import { describe, expect, test } from "bun:test";
import {
  desktopReducer,
  initialDesktop,
  stateFromUrl,
  urlFromState,
} from "../src/components/react/desktop-state";

describe("tiling state", () => {
  test("normal opens replace the focused detail; alongside keeps a second window", () => {
    let state = desktopReducer(initialDesktop, { type: "open", id: "illium" });
    state = desktopReducer(state, { type: "open", id: "sovereign" });
    expect(state.panels).toEqual(["sovereign"]);
    state = desktopReducer(state, {
      type: "open",
      id: "aniplayer-ios",
      alongside: true,
    });
    expect(state.panels).toEqual(["sovereign", "aniplayer-ios"]);
    state = desktopReducer(state, {
      type: "open",
      id: "explorer",
      alongside: true,
    });
    expect(state.panels).toEqual(["sovereign", "explorer"]);
    state = desktopReducer(state, {
      type: "open",
      id: "sovereign",
      alongside: true,
    });
    expect(state.panels).toEqual(["sovereign", "explorer"]);
    expect(state.active).toBe("sovereign");
  });
  test("close returns to home and restores tiling", () => {
    let state = desktopReducer(initialDesktop, { type: "open", id: "illium" });
    state = desktopReducer(state, { type: "maximize", id: "illium" });
    expect(state.maximized).toBe("illium");
    expect(desktopReducer(state, { type: "close", id: "illium" })).toEqual(
      initialDesktop
    );
  });
  test("URLs discard unknown panels and duplicates and limit window count", () => {
    const state = stateFromUrl(
      "?panel=unknown&panel=illium&panel=illium&panel=help&panel=contact&active=unknown"
    );
    expect(state.panels).toEqual(["illium", "help"]);
    expect(state.active).toBe("help");
    expect(stateFromUrl(urlFromState(state).slice(1))).toEqual(state);
    expect(desktopReducer(state, { type: "open", id: "unknown" })).toEqual(
      state
    );
  });
});
