import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUnreadLanding, type UnreadLandingInput } from "./useUnreadLanding";
import type { ThreadHistory } from "./useOlderPageAnchor";
import type { MessageRow } from "./messageRows";

/**
 * The landing's own decision tree (`step()` in useUnreadLanding.ts): land on
 * the divider when it's already loaded, give up and stay on the newest
 * message (where the thread-switch effect already put the reader) when it
 * resolves to none, or page for more history in between. `holdAnchorThroughSettle`
 * schedules real animation frames on a land, so `requestAnimationFrame` is
 * stubbed to run synchronously rather than leaving a real one pending past
 * the test.
 */

function row(kind: MessageRow["kind"], key: string): MessageRow {
  return { kind, key } as MessageRow;
}

/** A "run" row with the minimal shape `oldestMessageKey` (messageJumpHunt.ts)
 *  actually reads (`row.run.items[0]`), needed only for the "requests a
 *  page" test below, the one path that calls it. */
function runRow(key: string): MessageRow {
  return {
    kind: "run",
    key,
    day: "Today",
    run: { items: [] },
  } as unknown as MessageRow;
}

function fakeArea(): HTMLDivElement {
  const area = document.createElement("div");
  Object.defineProperty(area, "scrollHeight", {
    value: 1000,
    configurable: true,
  });
  Object.defineProperty(area, "scrollTop", {
    value: 900,
    configurable: true,
  });
  Object.defineProperty(area, "clientHeight", {
    value: 500,
    configurable: true,
  });
  return area;
}

function baseHistory(overrides: Partial<ThreadHistory> = {}): ThreadHistory {
  return {
    hasMoreOlder: false,
    loadingOlder: false,
    onLoadOlder: vi.fn(),
    isHistorySettled: true,
    isHistoryError: false,
    hasLoadedThreadData: true,
    ...overrides,
  };
}

function baseLanding(
  overrides: Partial<UnreadLandingInput> = {},
): UnreadLandingInput {
  return {
    unreadCount: 5,
    isFlaggedUnread: false,
    isDividerResolved: true,
    hasPendingJump: false,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useUnreadLanding", () => {
  it("lands on the unread divider row when one is already loaded", () => {
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: FrameRequestCallback): number => {
        cb(0);
        return 0;
      },
    );
    const rows: MessageRow[] = [
      row("run", "row-a"),
      row("unreadDivider", "divider-1"),
      row("run", "row-b"),
    ];
    const restoreAnchor = vi.fn();
    const armHistoryPageAnchor = vi.fn();
    const area = fakeArea();

    renderHook(() =>
      useUnreadLanding(
        "thread-1",
        baseLanding(),
        rows,
        baseHistory(),
        { current: area },
        { current: true },
        { current: null },
        restoreAnchor,
        armHistoryPageAnchor,
      ),
    );

    expect(restoreAnchor).toHaveBeenCalledTimes(1);
    expect(restoreAnchor.mock.calls[0]![0]).toMatchObject({
      rowKey: "divider-1",
    });
    expect(armHistoryPageAnchor).not.toHaveBeenCalled();
  });

  it("gives up and stays on the newest message (does nothing) once the divider is known to not exist", () => {
    const rows: MessageRow[] = [row("run", "row-a")]; // non-empty, no divider
    const restoreAnchor = vi.fn();
    const armHistoryPageAnchor = vi.fn();
    const history = baseHistory({ hasMoreOlder: false });
    const landing = baseLanding({ isDividerResolved: true }); // resolved: none

    renderHook(() =>
      useUnreadLanding(
        "thread-1",
        landing,
        rows,
        history,
        { current: fakeArea() },
        { current: true },
        { current: null },
        restoreAnchor,
        armHistoryPageAnchor,
      ),
    );

    expect(restoreAnchor).not.toHaveBeenCalled();
    expect(armHistoryPageAnchor).not.toHaveBeenCalled();
    expect(history.onLoadOlder).not.toHaveBeenCalled();
  });

  it("requests a bounded older page, once the frame after mount runs, when the divider hasn't resolved yet", () => {
    // Queued rather than run synchronously, so the test can assert nothing
    // was requested on mount itself and the page only goes out once the
    // deferred frame is actually flushed.
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: FrameRequestCallback): number => {
        frames.push(cb);
        return frames.length;
      },
    );
    const rows: MessageRow[] = [runRow("row-a")]; // no divider loaded yet
    const armHistoryPageAnchor = vi.fn();
    const history = baseHistory({ hasMoreOlder: true });
    // Not yet resolved either way; worth paging for.
    const landing = baseLanding({ isDividerResolved: false });

    renderHook(() =>
      useUnreadLanding(
        "thread-1",
        landing,
        rows,
        history,
        { current: fakeArea() },
        { current: true },
        { current: null },
        vi.fn(),
        armHistoryPageAnchor,
      ),
    );

    expect(armHistoryPageAnchor).not.toHaveBeenCalled();
    expect(history.onLoadOlder).not.toHaveBeenCalled();

    act(() => {
      frames.forEach((frame) => frame(0));
    });

    expect(armHistoryPageAnchor).toHaveBeenCalledTimes(1);
    expect(history.onLoadOlder).toHaveBeenCalledTimes(1);
  });

  it("never lands or pages when the thread opened with no unreads", () => {
    const rows: MessageRow[] = [
      row("run", "row-a"),
      row("unreadDivider", "divider-1"),
    ];
    const restoreAnchor = vi.fn();
    const armHistoryPageAnchor = vi.fn();
    const landing = baseLanding({ unreadCount: 0, isFlaggedUnread: false });

    renderHook(() =>
      useUnreadLanding(
        "thread-1",
        landing,
        rows,
        baseHistory(),
        { current: fakeArea() },
        { current: true },
        { current: null },
        restoreAnchor,
        armHistoryPageAnchor,
      ),
    );

    expect(restoreAnchor).not.toHaveBeenCalled();
    expect(armHistoryPageAnchor).not.toHaveBeenCalled();
  });
});
