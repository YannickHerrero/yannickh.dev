import { describe, expect, test } from "bun:test";
import { neighborPanel } from "../src/components/react/panel-navigation";
import {
  desktopReducer,
  initialDesktop,
  stateFromUrl,
  urlFromState,
} from "../src/components/react/desktop-state";

test("panel neighbors follow stacked and side-by-side geometry", () => {
  const home = { id: "home", left: 0, top: 0, width: 400, height: 800 };
  const first = { id: "illium", left: 410, top: 0, width: 600, height: 390 };
  const second = {
    id: "explorer",
    left: 410,
    top: 410,
    width: 600,
    height: 390,
  };
  expect(neighborPanel([home, first, second], "illium", "j")).toBe("explorer");
  expect(neighborPanel([home, first, second], "explorer", "k")).toBe("illium");
  expect(neighborPanel([home, first, second], "explorer", "h")).toBe("home");
  expect(neighborPanel([home, first, second], "home", "h")).toBeUndefined();
  expect(
    neighborPanel(
      [home, first, { ...second, left: 1020, top: 0 }],
      "illium",
      "l"
    )
  ).toBe("explorer");
});

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
    expect(state.panels).toEqual(["illium", "contact"]);
    expect(state.active).toBe("contact");
    expect(stateFromUrl(urlFromState(state).slice(1))).toEqual(state);
    expect(desktopReducer(state, { type: "open", id: "unknown" })).toEqual(
      state
    );
  });
});
