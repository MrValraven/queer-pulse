import { describe, expect, it, vi } from "vitest";
import type { Virtualizer } from "@tanstack/react-virtual";
import {
  captureScrollAnchor,
  holdAnchorThroughSettle,
  resolveAnchorScrollTop,
  type PendingScrollAnchor,
  type ScrollAnchor,
} from "./scrollAnchor";
import type { MessageRow } from "./messageRows";

/**
 * `captureScrollAnchor`/`resolveAnchorScrollTop` are the fix for ENG-196, a
 * coordinate-space bug: the virtualizer's own offsets (`VirtualItem.start`,
 * `getTotalSize()`) begin at the sizer's origin, which sits below `.area`'s
 * own block padding, while `scrollTop` is measured in the scroller's DOM
 * scroll space. `sizerTopInScrollSpace` (not exported) is the translation
 * between the two; these tests give the sizer a non-zero, non-trivial origin
 * (40px, standing in for that padding) on BOTH sides of a simulated prepend,
 * so a version that dropped the translation and compared virtualizer offsets
 * against `scrollTop` directly would already read a different, wrong answer
 * here.
 */

type FakeVirtualItem = {
  index: number;
  start: number;
  end: number;
  key: string;
};

function fakeArea(props: {
  scrollTop: number;
  scrollHeight: number;
  top: number;
}): HTMLElement {
  const area = document.createElement("div");
  vi.spyOn(area, "getBoundingClientRect").mockReturnValue({
    top: props.top,
  } as DOMRect);
  Object.defineProperty(area, "scrollTop", {
    value: props.scrollTop,
    configurable: true,
  });
  Object.defineProperty(area, "scrollHeight", {
    value: props.scrollHeight,
    configurable: true,
  });
  Object.defineProperty(area, "clientTop", {
    value: 0,
    configurable: true,
  });
  return area;
}

function fakeContent(top: number): HTMLElement {
  const content = document.createElement("div");
  vi.spyOn(content, "getBoundingClientRect").mockReturnValue({
    top,
  } as DOMRect);
  return content;
}

function fakeVirtualizer(options: {
  count: number;
  getItemKey: (index: number) => string | undefined;
  measurementsCache: { start: number }[];
  virtualItems: FakeVirtualItem[];
}): Virtualizer<HTMLDivElement, Element> {
  return {
    options: { count: options.count, getItemKey: options.getItemKey },
    measurementsCache: options.measurementsCache,
    getVirtualItems: () => options.virtualItems,
  } as unknown as Virtualizer<HTMLDivElement, Element>;
}

function row(kind: MessageRow["kind"], key: string): MessageRow {
  return { kind, key } as MessageRow;
}

describe("captureScrollAnchor", () => {
  it("anchors to the first row past the first message block, skipping the block itself and the unread divider", () => {
    const rows: MessageRow[] = [
      row("system", "block-0"),
      row("unreadDivider", "divider-1"),
      row("run", "row-2"),
    ];
    // sizerTop = content.top - area.top - clientTop + area.scrollTop
    //          = -50 - 0 - 0 + 50 = 0, kept at 0 here for a simple capture
    // (the non-zero-sizerTop case is exercised in `resolveAnchorScrollTop`
    // below, where the translation actually has to cancel something out).
    const area = fakeArea({ scrollTop: 50, scrollHeight: 2000, top: 0 });
    const content = fakeContent(-50);
    const virtualizer = fakeVirtualizer({
      count: 3,
      getItemKey: (index) => rows[index]?.key,
      measurementsCache: [{ start: 0 }, { start: 100 }, { start: 120 }],
      virtualItems: [
        { index: 0, start: 0, end: 100, key: "block-0" },
        // Would qualify by position alone (its bottom is below the
        // viewport top), but must still be skipped because it's the divider.
        { index: 1, start: 100, end: 120, key: "divider-1" },
        { index: 2, start: 120, end: 620, key: "row-2" },
      ],
    });

    const anchor = captureScrollAnchor(area, content, virtualizer, rows);

    expect(anchor).toEqual({
      rowKey: "row-2",
      rowOffsetFromViewportTopPx: 70, // 0 + 120 - 50
      distanceFromBottomPx: 1950, // 2000 - 50
    });
  });

  it("falls back to a null rowKey when no row is mounted past the first block", () => {
    const rows: MessageRow[] = [row("run", "only-row")];
    const area = fakeArea({ scrollTop: 30, scrollHeight: 900, top: 0 });
    const content = fakeContent(-30);
    const virtualizer = fakeVirtualizer({
      count: 1,
      getItemKey: (index) => rows[index]?.key,
      measurementsCache: [{ start: 0 }],
      virtualItems: [{ index: 0, start: 0, end: 500, key: "only-row" }],
    });

    const anchor = captureScrollAnchor(area, content, virtualizer, rows);

    expect(anchor).toEqual({
      rowKey: null,
      rowOffsetFromViewportTopPx: 0,
      distanceFromBottomPx: 870, // 900 - 30
    });
  });
});

describe("resolveAnchorScrollTop", () => {
  it("restores the anchor row to the SAME viewport offset after older rows prepend above it (ENG-196)", () => {
    // Before: sizerTop = -110 - 0 - 0 + 150 = 40 (a 40px "sizer sits below
    // .area's padding" origin, kept identical on both sides below).
    const areaBefore = fakeArea({ scrollTop: 150, scrollHeight: 2000, top: 0 });
    const contentBefore = fakeContent(-110);
    const rowsBefore: MessageRow[] = [row("run", "row-0"), row("run", "row-1")];
    const virtualizerBefore = fakeVirtualizer({
      count: 2,
      getItemKey: (index) => rowsBefore[index]?.key,
      measurementsCache: [{ start: 0 }, { start: 200 }],
      virtualItems: [
        { index: 0, start: 0, end: 200, key: "row-0" },
        { index: 1, start: 200, end: 700, key: "row-1" },
      ],
    });
    const anchor = captureScrollAnchor(
      areaBefore,
      contentBefore,
      virtualizerBefore,
      rowsBefore,
    );
    expect(anchor).toEqual({
      rowKey: "row-1",
      rowOffsetFromViewportTopPx: 90, // 40 + 200 - 150
      distanceFromBottomPx: 1850, // 2000 - 150
    });

    // After: an older page prepended ~700px of content above "row-1", which
    // now sits at a new index behind two new rows, and the sizer's own
    // origin (the .area padding, structurally unaffected by the prepend)
    // reads the same 40px it did before: this is exactly the invariant the
    // fix relies on.
    const areaAfter = fakeArea({ scrollTop: 150, scrollHeight: 2700, top: 0 });
    const contentAfter = fakeContent(-110);
    const rowsAfter = ["row-older-a", "row-older-b", "row-0", "row-1"];
    const virtualizerAfter = fakeVirtualizer({
      count: rowsAfter.length,
      getItemKey: (index) => rowsAfter[index],
      measurementsCache: [
        { start: 0 },
        { start: 300 },
        { start: 600 },
        { start: 900 },
      ],
      virtualItems: [],
    });

    const targetScrollTop = resolveAnchorScrollTop(
      areaAfter,
      contentAfter,
      virtualizerAfter,
      anchor,
    );

    // The actual contract: applying this as the new scrollTop puts "row-1"
    // back at the SAME 90px offset from the viewport top it was captured at:
    // sizerTop(40) + rowStart(900) - targetScrollTop(850) === 90.
    expect(targetScrollTop).toBe(850); // 40 + 900 - 90

    // In this scenario (nothing besides the prepend changed anywhere in the
    // tree) 850 also equals the simpler "old scrollTop plus how much
    // scrollHeight grew" shape. That simpler shape is specific to this case;
    // the row-relative formula above is the general contract, and alone
    // survives content changing below the anchor too.
    expect(150 + (2700 - 2000)).toBe(targetScrollTop);
  });

  it("falls back to distanceFromBottomPx when the anchor row is gone by the time it resolves", () => {
    const anchor: ScrollAnchor = {
      rowKey: "row-1",
      rowOffsetFromViewportTopPx: 90,
      distanceFromBottomPx: 1850,
    };
    const area = fakeArea({ scrollTop: 150, scrollHeight: 2222, top: 0 });
    const content = fakeContent(-110);
    // "row-1" merged into a run during the prepend and no longer appears
    // under its old key at any index.
    const virtualizer = fakeVirtualizer({
      count: 2,
      getItemKey: (index) => ["row-older", "row-merged"][index],
      measurementsCache: [{ start: 0 }, { start: 400 }],
      virtualItems: [],
    });

    const targetScrollTop = resolveAnchorScrollTop(
      area,
      content,
      virtualizer,
      anchor,
    );

    expect(targetScrollTop).toBe(372); // 2222 - 1850
  });
});

describe("holdAnchorThroughSettle", () => {
  it("releases the anchor after two animation frames, but leaves a fresh one armed in between untouched", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    try {
      const pendingAnchorRef = { current: null } as {
        current: PendingScrollAnchor | null;
      };
      const anchorA: ScrollAnchor = {
        rowKey: "row-a",
        rowOffsetFromViewportTopPx: 10,
        distanceFromBottomPx: 20,
      };
      holdAnchorThroughSettle(pendingAnchorRef, anchorA);
      expect(pendingAnchorRef.current).toEqual({
        anchor: anchorA,
        isRestoring: true,
      });
      expect(frames).toHaveLength(1);

      // The first frame only schedules the second; the anchor is still held.
      // `requestAnimationFrame`'s callback takes the frame's own timestamp
      // (`DOMHighResTimeStamp`); `holdAnchorThroughSettle` never reads it, so
      // a plausible elapsed-ms value stands in for a real one.
      frames[0]!(16);
      expect(pendingAnchorRef.current?.anchor).toBe(anchorA);
      expect(frames).toHaveLength(2);

      // A fresh anchor arms in between (a new prepend request): the
      // ORIGINAL hold's second frame must not clear it out from under it.
      const anchorB: PendingScrollAnchor = {
        anchor: {
          rowKey: "row-b",
          rowOffsetFromViewportTopPx: 0,
          distanceFromBottomPx: 0,
        },
        isRestoring: false,
      };
      pendingAnchorRef.current = anchorB;
      frames[1]!(32);
      expect(pendingAnchorRef.current).toBe(anchorB);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("releases cleanly to null when nothing else armed in between", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    try {
      const pendingAnchorRef = { current: null } as {
        current: PendingScrollAnchor | null;
      };
      holdAnchorThroughSettle(pendingAnchorRef, {
        rowKey: "row-a",
        rowOffsetFromViewportTopPx: 0,
        distanceFromBottomPx: 0,
      });
      frames[0]!(16);
      frames[1]!(32);
      expect(pendingAnchorRef.current).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
