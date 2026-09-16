import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useMessageScroll } from "./useMessageScroll";
import type { ThreadHistory } from "./useOlderPageAnchor";
import type { UnreadLandingInput } from "./useUnreadLanding";
import type { MessageRow } from "./messageRows";

/**
 * Stick-to-bottom itself lives here. scrollIntent.ts's tracker feeds only the
 * floating day pill's reveal gate (see that file's own header comment). The
 * single source of truth is `atBottomRef`, written in
 * `useMessageScroll.ts` at `handleAreaScroll`'s near-bottom/not-near-bottom
 * branches and read by the content effect's `if (atBottomRef.current)`
 * branch to decide whether a newly arrived message auto-scrolls
 * (stick-to-bottom on) or surfaces the jump pill (stick-to-bottom off).
 * `atBottomRef` itself is internal, so these tests drive it the way the real
 * DOM does (mutate `.scrollTop`, call `handleAreaScroll()`) and read the
 * externally observable proxy: whether the next arriving message auto-scrolls
 * or piles onto the pill.
 */

function fakeArea(): HTMLDivElement {
  const area = document.createElement("div");
  Object.defineProperty(area, "scrollHeight", {
    value: 2000,
    configurable: true,
  });
  Object.defineProperty(area, "scrollTop", {
    value: 0,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(area, "clientHeight", {
    value: 500,
    configurable: true,
  });
  return area;
}

function fakeVirtualizer(): Virtualizer<HTMLDivElement, Element> {
  return {
    options: { count: 0 },
    scrollToIndex: vi.fn(),
    scrollToOffset: vi.fn(),
    getVirtualItems: () => [],
    measurementsCache: [],
    getTotalSize: () => 0,
  } as unknown as Virtualizer<HTMLDivElement, Element>;
}

function setup() {
  const area = fakeArea();
  const content = document.createElement("div");
  const areaRef = { current: area };
  const contentRef = { current: content };
  const rowVirtualizer = fakeVirtualizer();
  const rows: MessageRow[] = [];
  const history: ThreadHistory = {
    hasMoreOlder: false,
    loadingOlder: false,
    onLoadOlder: vi.fn(),
    isHistorySettled: true,
    isHistoryError: false,
    hasLoadedThreadData: true,
  };
  // Inert: this suite is only about `atBottomRef`. The unread landing has
  // its own dedicated coverage in useUnreadLanding.test.ts.
  const landing: UnreadLandingInput = {
    unreadCount: 0,
    isFlaggedUnread: false,
    isDividerResolved: true,
    hasPendingJump: false,
  };

  const { result, rerender } = renderHook(
    (props: { messageCount: number; inboundCount: number }) =>
      useMessageScroll(
        props.messageCount,
        props.inboundCount,
        "thread-1",
        history,
        areaRef,
        contentRef,
        rowVirtualizer,
        rows,
        landing,
      ),
    { initialProps: { messageCount: 3, inboundCount: 1 } },
  );

  return { result, rerender, area };
}

describe("useMessageScroll stick-to-bottom", () => {
  it("a scroll away from the bottom clears stick-to-bottom, and reaching the bottom sets it again", () => {
    const { result, rerender, area } = setup();
    // On mount the thread-switch effect already pins to the bottom and the
    // content effect sees no growth (previousCountRef caught up to the
    // initial messageCount in the same layout flush), so there is nothing to
    // assert yet: a fresh thread starts pinned.
    expect(result.current.showJumpPill).toBe(false);

    // The member scrolls up to read history: scrollHeight(2000) - 200 -
    // clientHeight(500) = 1300px short of flush, well past the near-bottom
    // threshold.
    act(() => {
      area.scrollTop = 200;
      result.current.handleAreaScroll();
    });

    // A new inbound message arrives while scrolled up: stick-to-bottom is
    // off, so it surfaces the pill instead of auto-scrolling the reader away
    // from what they're reading.
    act(() => {
      rerender({ messageCount: 4, inboundCount: 2 });
    });
    expect(result.current.showJumpPill).toBe(true);
    expect(result.current.newMessagesCount).toBe(1);

    // The member scrolls back down to the bottom: scrollHeight(2000) - 1950
    // - clientHeight(500) is comfortably within the near-bottom threshold.
    act(() => {
      area.scrollTop = 1950;
      result.current.handleAreaScroll();
    });
    expect(result.current.showJumpPill).toBe(false);
    expect(result.current.newMessagesCount).toBe(0);

    // Stick-to-bottom is armed again for good: a further arrival auto-scrolls
    // instead of piling back onto the pill.
    act(() => {
      rerender({ messageCount: 5, inboundCount: 3 });
    });
    expect(result.current.showJumpPill).toBe(false);
    expect(result.current.newMessagesCount).toBe(0);
  });
});
