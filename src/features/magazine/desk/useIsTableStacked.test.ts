import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DESK_TABLE_STACK_WIDTH, useIsTableStacked } from "./useIsTableStacked";

type ResizeCallback = (
  entries: Array<{ contentRect: { width: number } }>,
) => void;

/** The ResizeObserver callbacks the hook registered, fired by hand. */
let resizeCallbacks: ResizeCallback[] = [];
const disconnect = vi.fn();

class StubResizeObserver {
  constructor(callback: ResizeCallback) {
    resizeCallbacks.push(callback);
  }
  observe() {}
  disconnect() {
    disconnect();
  }
}

function makeTable(clientWidth: number): HTMLElement {
  const table = document.createElement("div");
  Object.defineProperty(table, "clientWidth", {
    configurable: true,
    value: clientWidth,
  });
  return table;
}

function fireResize(width: number) {
  act(() => {
    for (const callback of resizeCallbacks) {
      callback([{ contentRect: { width } }]);
    }
  });
}

beforeEach(() => {
  resizeCallbacks = [];
  disconnect.mockClear();
  vi.stubGlobal("ResizeObserver", StubResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useIsTableStacked", () => {
  it("stacks a table narrower than the phone step on first measure", () => {
    const { result } = renderHook(() =>
      useIsTableStacked({ current: makeTable(343) }),
    );
    expect(result.current).toBe(true);
  });

  it("stays wide at and above the phone step", () => {
    const { result } = renderHook(() =>
      useIsTableStacked({ current: makeTable(DESK_TABLE_STACK_WIDTH) }),
    );
    expect(result.current).toBe(false);
  });

  it("follows the table across the step as it resizes", () => {
    const { result } = renderHook(() =>
      useIsTableStacked({ current: makeTable(900) }),
    );
    expect(result.current).toBe(false);

    fireResize(DESK_TABLE_STACK_WIDTH - 1);
    expect(result.current).toBe(true);

    fireResize(DESK_TABLE_STACK_WIDTH);
    expect(result.current).toBe(false);
  });

  it("reads a box with no width yet as wide", () => {
    const { result } = renderHook(() =>
      useIsTableStacked({ current: makeTable(0) }),
    );
    expect(result.current).toBe(false);
  });

  it("disconnects its observer on unmount", () => {
    const { unmount } = renderHook(() =>
      useIsTableStacked({ current: makeTable(900) }),
    );
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
