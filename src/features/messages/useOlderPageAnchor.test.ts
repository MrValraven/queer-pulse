import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useJumpScrollBridge, useOlderPageAnchor } from "./useOlderPageAnchor";
import type { MessageRow } from "./messageRows";
import type { PendingScrollAnchor, ScrollAnchor } from "./scrollAnchor";

/**
 * `captureScrollAnchor`/`resolveAnchorScrollTop`'s own arithmetic is covered
 * directly in scrollAnchor.test.ts; mocked here so these tests exercise ONLY
 * this hook's own orchestration: when it arms, blocks a re-arm, re-captures
 * while armed, and restores or disarms on settle. `holdAnchorThroughSettle`
 * keeps its real FIRST effect (marking the anchor `isRestoring`) so
 * `followReaderWhileArmed`/`releaseSettlingAnchor`'s own restoring-vs-armed
 * branches are exercised for real; its two-rAF release is scrollAnchor.ts's
 * own concern and is covered there instead.
 */
vi.mock("./scrollAnchor", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./scrollAnchor")>();
  return {
    ...actual,
    captureScrollAnchor: vi.fn(() => ({
      rowKey: "captured-row",
      rowOffsetFromViewportTopPx: 42,
      distanceFromBottomPx: 100,
    })),
    resolveAnchorScrollTop: vi.fn(() => 777),
    holdAnchorThroughSettle: vi.fn(
      (
        pendingAnchorRef: { current: PendingScrollAnchor | null },
        anchor: ScrollAnchor,
      ) => {
        pendingAnchorRef.current = { anchor, isRestoring: true };
      },
    ),
  };
});

import { captureScrollAnchor, holdAnchorThroughSettle } from "./scrollAnchor";

let now = 0;

beforeEach(() => {
  now = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.mocked(captureScrollAnchor).mockClear();
  vi.mocked(holdAnchorThroughSettle).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setup() {
  const area = document.createElement("div");
  Object.defineProperty(area, "scrollHeight", {
    value: 1000,
    configurable: true,
  });
  const content = document.createElement("div");
  const areaRef = { current: area };
  const contentRef = { current: content };
  const atBottomRef = { current: true };
  const rowVirtualizer = {
    scrollToOffset: vi.fn(),
  } as unknown as Virtualizer<HTMLDivElement, Element>;
  const rows: MessageRow[] = [];

  const { result } = renderHook(() =>
    useOlderPageAnchor(areaRef, contentRef, rowVirtualizer, rows, atBottomRef),
  );
  return { result, area, rowVirtualizer, atBottomRef };
}

describe("useOlderPageAnchor", () => {
  it("arms an anchor on request and blocks a second arm while one is pending", () => {
    const { result, area } = setup();

    let armed: boolean | undefined;
    act(() => {
      armed = result.current.armOlderPageAnchor(area);
    });
    expect(armed).toBe(true);
    expect(captureScrollAnchor).toHaveBeenCalledTimes(1);
    expect(result.current.pendingAnchorRef.current).toMatchObject({
      isRestoring: false,
    });

    let armedAgain: boolean | undefined;
    act(() => {
      armedAgain = result.current.armOlderPageAnchor(area);
    });
    expect(armedAgain).toBe(false);
    expect(captureScrollAnchor).toHaveBeenCalledTimes(1);
  });

  it("restores through the virtualizer and holds the anchor when the settled page grew", () => {
    const { result, area, rowVirtualizer } = setup();
    act(() => {
      result.current.armOlderPageAnchor(area);
    });
    // Establishes `wasLoadingOlderRef` at true so the NEXT call reads a
    // settle edge (true -> false).
    act(() => {
      result.current.settleOlderPage(true, false);
    });

    let outcome: ReturnType<typeof result.current.settleOlderPage> | undefined;
    act(() => {
      outcome = result.current.settleOlderPage(false, true);
    });

    expect(outcome).toEqual({ isOlderPageSettle: true, isConsumed: true });
    expect(rowVirtualizer.scrollToOffset).toHaveBeenCalledWith(777, {
      align: "start",
      behavior: "auto",
    });
    expect(holdAnchorThroughSettle).toHaveBeenCalledTimes(1);
    expect(result.current.pendingAnchorRef.current).toMatchObject({
      isRestoring: true,
    });
  });

  it("disarms without restoring when the settled page came back with no growth (empty or failed)", () => {
    const { result, area, rowVirtualizer } = setup();
    act(() => {
      result.current.armOlderPageAnchor(area);
    });
    act(() => {
      result.current.settleOlderPage(true, false);
    });

    let outcome: ReturnType<typeof result.current.settleOlderPage> | undefined;
    act(() => {
      outcome = result.current.settleOlderPage(false, false);
    });

    expect(outcome).toEqual({ isOlderPageSettle: true, isConsumed: true });
    expect(rowVirtualizer.scrollToOffset).not.toHaveBeenCalled();
    expect(holdAnchorThroughSettle).not.toHaveBeenCalled();
    expect(result.current.pendingAnchorRef.current).toBeNull();
  });

  it("re-captures the armed anchor on every scroll while its page is in flight, but stops once it's restoring", () => {
    const { result, area } = setup();
    act(() => {
      result.current.armOlderPageAnchor(area);
    });
    expect(captureScrollAnchor).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.followReaderWhileArmed(area);
    });
    expect(captureScrollAnchor).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.settleOlderPage(true, false);
      result.current.settleOlderPage(false, true); // grew -> now restoring
    });

    act(() => {
      result.current.followReaderWhileArmed(area);
    });
    // No further capture: a restoring anchor is being actively applied
    // instead of followed.
    expect(captureScrollAnchor).toHaveBeenCalledTimes(2);
  });

  it("allows a fresh arm once the previous one was abandoned (its page never started loading)", () => {
    const { result, area } = setup();
    act(() => {
      result.current.armOlderPageAnchor(area);
    });
    expect(captureScrollAnchor).toHaveBeenCalledTimes(1);

    let blockedWhileFresh: boolean | undefined;
    act(() => {
      blockedWhileFresh = result.current.armOlderPageAnchor(area);
    });
    expect(blockedWhileFresh).toBe(false);

    now += 1501; // past ARMED_ANCHOR_PICKUP_GRACE_MS, loadingOlder never went true

    let armedAfterGrace: boolean | undefined;
    act(() => {
      armedAfterGrace = result.current.armOlderPageAnchor(area);
    });
    expect(armedAfterGrace).toBe(true);
    expect(captureScrollAnchor).toHaveBeenCalledTimes(2);
  });

  it("releaseSettlingAnchor clears a restoring anchor but leaves an armed one alone", () => {
    const { result, area } = setup();
    act(() => {
      result.current.armOlderPageAnchor(area);
    });
    act(() => {
      result.current.releaseSettlingAnchor();
    });
    // Only armed so far: left untouched.
    expect(result.current.pendingAnchorRef.current).not.toBeNull();

    act(() => {
      result.current.settleOlderPage(true, false);
      result.current.settleOlderPage(false, true); // now restoring
    });
    act(() => {
      result.current.releaseSettlingAnchor();
    });
    expect(result.current.pendingAnchorRef.current).toBeNull();
  });
});

describe("useJumpScrollBridge", () => {
  it("begins a programmatic jump by un-pinning, releasing a settling anchor and cancelling the unread landing, then re-reads pinned on end", () => {
    const area = document.createElement("div");
    Object.defineProperty(area, "scrollHeight", {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(area, "scrollTop", {
      value: 0,
      configurable: true,
    });
    Object.defineProperty(area, "clientHeight", {
      value: 500,
      configurable: true,
    });
    const areaRef = { current: area };
    const atBottomRef = { current: true };
    const releaseSettlingAnchor = vi.fn();
    const cancelUnreadLanding = vi.fn();
    const armHistoryPageAnchor = vi.fn();

    const { result } = renderHook(() =>
      useJumpScrollBridge(
        areaRef,
        atBottomRef,
        releaseSettlingAnchor,
        cancelUnreadLanding,
        armHistoryPageAnchor,
      ),
    );

    act(() => {
      result.current.beginProgrammaticJump();
    });
    expect(atBottomRef.current).toBe(false);
    expect(releaseSettlingAnchor).toHaveBeenCalledTimes(1);
    expect(cancelUnreadLanding).toHaveBeenCalledTimes(1);

    // The reveal lands within the last screen (near-bottom, per
    // `isNearBottom`'s default 80px threshold): re-reads pinned as true,
    // since a clamped scroll into the last screen fires no scroll event to
    // do it on its own.
    Object.defineProperty(area, "scrollTop", {
      value: 450,
      configurable: true,
    });
    act(() => {
      result.current.endProgrammaticJump();
    });
    expect(atBottomRef.current).toBe(true);
  });
});
