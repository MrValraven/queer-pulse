import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useStudioRailCollapsed,
  useStudioRailPanelFold,
} from "./useStudioRailCollapsed";

const RAIL_KEY = "qp.studio.rail.collapsed.v1";

function useRail(isRequested: boolean) {
  useStudioRailPanelFold(isRequested);
  return useStudioRailCollapsed();
}

function renderRail(isRequested = false) {
  return renderHook(
    ({ isRequested: isRequestedNow }) => useRail(isRequestedNow),
    { initialProps: { isRequested } },
  );
}

async function flushMicrotasks() {
  await act(() => Promise.resolve());
}

describe("useStudioRailPanelFold", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    const reset = renderRail();
    if (reset.result.current.isRailCollapsed) {
      act(() => reset.result.current.toggleRail());
    }
    reset.unmount();
    await flushMicrotasks();
    window.localStorage.clear();
  });

  afterEach(async () => {
    cleanup();
    await Promise.resolve();
    vi.restoreAllMocks();
  });

  it("folds while the panel asks and never writes the saved choice", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { result, rerender } = renderRail();
    expect(result.current.isRailCollapsed).toBe(false);
    rerender({ isRequested: true });
    expect(result.current.isRailCollapsed).toBe(true);
    expect(setItem).not.toHaveBeenCalledWith(RAIL_KEY, expect.anything());
    rerender({ isRequested: false });
    await flushMicrotasks();
    expect(result.current.isRailCollapsed).toBe(false);
  });

  it("keeps a rail the member folded folded after the panel closes", async () => {
    const { result, rerender } = renderRail();
    act(() => result.current.toggleRail());
    expect(result.current.isRailCollapsed).toBe(true);
    rerender({ isRequested: true });
    expect(result.current.isRailCollapsed).toBe(true);
    rerender({ isRequested: false });
    await flushMicrotasks();
    expect(result.current.isRailCollapsed).toBe(true);
    expect(window.localStorage.getItem(RAIL_KEY)).toBe("true");
  });

  it("stays unfolded when the member unfolds it by hand while the panel is open", () => {
    const { result, rerender } = renderRail();
    rerender({ isRequested: true });
    act(() => result.current.toggleRail());
    expect(result.current.isRailCollapsed).toBe(false);
    expect(window.localStorage.getItem(RAIL_KEY)).not.toBe("true");
  });

  it("writes the member's own fold while the panel is open", () => {
    const { result, rerender } = renderRail();
    rerender({ isRequested: true });
    act(() => result.current.toggleRail());
    act(() => result.current.toggleRail());
    expect(result.current.isRailCollapsed).toBe(true);
    expect(window.localStorage.getItem(RAIL_KEY)).toBe("true");
  });

  it("keeps the hand unfold across a shell remount in the same commit", async () => {
    const first = renderRail(true);
    const observer = renderRail();
    act(() => first.result.current.toggleRail());
    expect(observer.result.current.isRailCollapsed).toBe(false);
    act(() => {
      first.unmount();
      renderRail(true);
    });
    await flushMicrotasks();
    expect(observer.result.current.isRailCollapsed).toBe(false);
  });

  it("folds again for the next panel opening", async () => {
    const { result, rerender } = renderRail();
    rerender({ isRequested: true });
    act(() => result.current.toggleRail());
    expect(result.current.isRailCollapsed).toBe(false);
    rerender({ isRequested: false });
    await flushMicrotasks();
    rerender({ isRequested: true });
    expect(result.current.isRailCollapsed).toBe(true);
  });
});
