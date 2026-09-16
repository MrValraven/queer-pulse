import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useScrollResizeFollow } from "./useScrollResizeFollow";
import type { PendingScrollAnchor } from "./scrollAnchor";

/**
 * The ResizeObserver callback's own branching (restore an in-progress anchor,
 * re-pin to bottom, or do nothing): `src/test/setup.ts` globally stubs
 * `window.ResizeObserver` with a no-op `MockObserver` that DISCARDS whatever
 * callback it's constructed with, so real observation never fires in tests.
 * A local fake that actually keeps the callback replaces it here so the fired
 * callback under test is exactly the one this hook registered.
 */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function fakeArea(
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
): HTMLDivElement {
  const area = document.createElement("div");
  Object.defineProperty(area, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(area, "scrollTop", {
    value: scrollTop,
    configurable: true,
  });
  Object.defineProperty(area, "clientHeight", {
    value: clientHeight,
    configurable: true,
  });
  return area;
}

function setup(options: {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
  isAtBottom: boolean;
  pendingAnchor?: PendingScrollAnchor | null;
}) {
  FakeResizeObserver.instances = [];
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);

  const area = fakeArea(
    options.scrollHeight,
    options.scrollTop,
    options.clientHeight,
  );
  const content = document.createElement("div");
  const areaRef = { current: area };
  const contentRef = { current: content };
  const atBottomRef = { current: options.isAtBottom };
  const pendingAnchorRef = { current: options.pendingAnchor ?? null };
  const restoreAnchor = vi.fn();
  const scrollToBottom = vi.fn();

  renderHook(() =>
    useScrollResizeFollow(
      "thread-1",
      areaRef,
      contentRef,
      {} as Virtualizer<HTMLDivElement, Element>,
      atBottomRef,
      pendingAnchorRef,
      restoreAnchor,
      scrollToBottom,
    ),
  );

  const observerInstance = FakeResizeObserver.instances[0];
  if (!observerInstance) {
    throw new Error("useScrollResizeFollow never constructed a ResizeObserver");
  }
  return {
    area,
    content,
    observerInstance,
    restoreAnchor,
    scrollToBottom,
    fireResize: () => act(() => observerInstance.callback()),
  };
}

describe("useScrollResizeFollow", () => {
  it("observes both the content wrapper and the scroller itself, so either one resizing can trigger the check", () => {
    // A stick-to-bottom resize can come from either side (see the hook's own
    // file comment): the content wrapper growing, or `.area` itself
    // shrinking (the on-screen keyboard, an auto-growing composer). Losing
    // either `observer.observe(...)` call would silently drop one of those
    // triggers with no other test noticing.
    const { area, content, observerInstance } = setup({
      scrollHeight: 1000,
      scrollTop: 400,
      clientHeight: 300,
      isAtBottom: true,
    });

    expect(observerInstance.observe).toHaveBeenCalledWith(content);
    expect(observerInstance.observe).toHaveBeenCalledWith(area);
    expect(observerInstance.observe).toHaveBeenCalledTimes(2);
  });

  it("re-pins to the bottom on a container shrink (e.g. the keyboard opening) when the reader was at the bottom", () => {
    const { fireResize, scrollToBottom, restoreAnchor } = setup({
      scrollHeight: 1000,
      scrollTop: 400,
      clientHeight: 300, // 1000 - 400 - 300 = 300px short of flush
      isAtBottom: true,
    });

    fireResize();

    expect(scrollToBottom).toHaveBeenCalledWith(false);
    expect(restoreAnchor).not.toHaveBeenCalled();
  });

  it("does nothing on a resize while the reader is reading history (scrolled up)", () => {
    const { fireResize, scrollToBottom, restoreAnchor } = setup({
      scrollHeight: 1000,
      scrollTop: 100,
      clientHeight: 300,
      isAtBottom: false,
    });

    fireResize();

    expect(scrollToBottom).not.toHaveBeenCalled();
    expect(restoreAnchor).not.toHaveBeenCalled();
  });

  it("does nothing when the log is already flush with the bottom", () => {
    const { fireResize, scrollToBottom } = setup({
      scrollHeight: 700,
      scrollTop: 400,
      clientHeight: 300, // 700 - 400 - 300 = 0, already flush
      isAtBottom: true,
    });

    fireResize();

    expect(scrollToBottom).not.toHaveBeenCalled();
  });

  it("restores a settling anchor instead of re-pinning, even when the reader was at the bottom", () => {
    const anchor = {
      rowKey: "row-1",
      rowOffsetFromViewportTopPx: 10,
      distanceFromBottomPx: 20,
    };
    const { fireResize, restoreAnchor, scrollToBottom } = setup({
      scrollHeight: 1000,
      scrollTop: 400,
      clientHeight: 300,
      isAtBottom: true,
      pendingAnchor: { anchor, isRestoring: true },
    });

    fireResize();

    expect(restoreAnchor).toHaveBeenCalledWith(anchor);
    expect(scrollToBottom).not.toHaveBeenCalled();
  });

  it("leaves an armed (not-yet-restoring) anchor alone and falls through to the normal bottom-stick check", () => {
    const anchor = {
      rowKey: "row-1",
      rowOffsetFromViewportTopPx: 10,
      distanceFromBottomPx: 20,
    };
    const { fireResize, restoreAnchor, scrollToBottom } = setup({
      scrollHeight: 1000,
      scrollTop: 400,
      clientHeight: 300,
      isAtBottom: true,
      pendingAnchor: { anchor, isRestoring: false },
    });

    fireResize();

    expect(restoreAnchor).not.toHaveBeenCalled();
    expect(scrollToBottom).toHaveBeenCalledWith(false);
  });
});
