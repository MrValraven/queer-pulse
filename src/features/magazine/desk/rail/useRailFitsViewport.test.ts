import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RAIL_PIN_TOP_PROPERTY,
  useRailFitsViewport,
} from "./useRailFitsViewport";

/** The ResizeObserver callbacks the hook registered, fired by hand. */
let resizeCallbacks: Array<() => void> = [];

class StubResizeObserver {
  constructor(callback: () => void) {
    resizeCallbacks.push(callback);
  }
  observe() {}
  disconnect() {}
}

let railHeight = 0;
let scrollMarginTop = "14px";

function makeRail(): HTMLElement {
  const rail = document.createElement("aside");
  Object.defineProperty(rail, "offsetHeight", {
    configurable: true,
    get: () => railHeight,
  });
  return rail;
}

function setViewportHeight(height: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
}

function fireResize() {
  for (const callback of resizeCallbacks) callback();
}

beforeEach(() => {
  resizeCallbacks = [];
  railHeight = 0;
  scrollMarginTop = "14px";
  setViewportHeight(900);
  vi.stubGlobal("ResizeObserver", StubResizeObserver);
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    () =>
      ({
        scrollMarginTop,
        scrollMarginBottom: "14px",
      }) as CSSStyleDeclaration,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useRailFitsViewport", () => {
  it("pins a rail that fits by its sticky offset", () => {
    railHeight = 600;
    const rail = makeRail();
    renderHook(() => useRailFitsViewport({ current: rail }, true));
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("14px");
  });

  it("pins a rail taller than the viewport by its bottom", () => {
    railHeight = 1200;
    const rail = makeRail();
    renderHook(() => useRailFitsViewport({ current: rail }, true));
    // 900 viewport - 1200 rail - 14 gap
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("-314px");
  });

  it("moves to a bottom pin when a card grows the rail past the viewport", () => {
    railHeight = 700;
    const rail = makeRail();
    renderHook(() => useRailFitsViewport({ current: rail }, true));
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("14px");

    railHeight = 1000;
    fireResize();
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("-114px");
  });

  it("re-measures when the window height changes", () => {
    railHeight = 800;
    const rail = makeRail();
    renderHook(() => useRailFitsViewport({ current: rail }, true));
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("14px");

    setViewportHeight(700);
    window.dispatchEvent(new Event("resize"));
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("-114px");
  });

  it("leaves the CSS default when the offset does not read as pixels", () => {
    scrollMarginTop = "";
    railHeight = 1200;
    const rail = makeRail();
    renderHook(() => useRailFitsViewport({ current: rail }, true));
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("");
  });

  it("writes nothing while stacked and clears its value when it stacks", () => {
    railHeight = 600;
    const rail = makeRail();
    const { rerender } = renderHook(
      ({ isEnabled }) => useRailFitsViewport({ current: rail }, isEnabled),
      { initialProps: { isEnabled: true } },
    );
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("14px");

    rerender({ isEnabled: false });
    expect(rail.style.getPropertyValue(RAIL_PIN_TOP_PROPERTY)).toBe("");
  });
});
