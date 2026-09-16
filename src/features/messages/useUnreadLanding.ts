// src/features/messages/useUnreadLanding.ts
import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import type { MessageRow } from "./messageRows";
import { isNearBottom } from "./useStickToBottom";
import { oldestMessageKey } from "./messageJumpHunt";
import type { ThreadHistory } from "./useOlderPageAnchor";
import {
  holdAnchorThroughSettle,
  type PendingScrollAnchor,
  type ScrollAnchor,
} from "./scrollAnchor";

/** How many older pages the landing may pull in while looking for the
 *  divider (a thread with more unread than one page). Past this the reader
 *  lands on the newest message, as before. */
const MAX_UNREAD_LANDING_PAGES = 5;
/** A requested page that has not started loading after this long was dropped
 *  by the fetch layer: the landing stops waiting for it. */
const PAGE_PICKUP_GRACE_MS = 1500;
/** Past this long after the thread's history first settles the reader is
 *  reading, so a landing that has not happened yet never happens: moving the
 *  viewport then would yank them out of the conversation. Counted from the
 *  settle, never from a reopened thread's stale cached page. */
const LANDING_DEADLINE_MS = 5000;

/** Context left above the divider on landing: a sliver of the last read
 *  message, so the reader sees where they left off. Never less than the
 *  floating day pill's band at the top of the log, so the divider is never
 *  landed underneath it on a short viewport. */
const LANDING_CONTEXT_MAX_PX = 96;
const LANDING_CONTEXT_MIN_PX = 48;
const LANDING_CONTEXT_VIEWPORT_SHARE = 0.2;

/** What the landing reads about the open thread's unread state. */
export interface UnreadLandingInput {
  /** The thread's unread count as rendered when it opened. */
  unreadCount: number;
  /** Marked unread by hand (possibly with no count). */
  isFlaggedUnread: boolean;
  /** The divider has latched (see `useUnreadDivider`). */
  isDividerResolved: boolean;
  /** A search or starred pick is about to jump somewhere in this thread. */
  hasPendingJump: boolean;
}

interface UnreadLandingState {
  threadId: string;
  /** True until the landing has happened or been given up on. */
  isPending: boolean;
  pagesRequested: number;
  /** An older page was requested and has not settled yet. */
  isAwaitingPage: boolean;
  /** The request above was seen in flight, so its end is meaningful. */
  hasSeenLoading: boolean;
  requestedAtMs: number;
  /** Oldest loaded message when the page was requested: unchanged after it
   *  settles means the page failed or came back empty. */
  oldestKeyAtRequest: string | undefined;
  /** When this thread's history first settled; the deadline counts from it. */
  firstSettledAtMs: number | null;
}

/**
 * Opening a thread with unread messages lands on the "New messages" divider
 * row, WhatsApp-style, instead of the newest message.
 *
 * Runs once per thread open. The landing target is ONLY the row of kind
 * `unreadDivider`; this hook never decides where that row goes. Nothing is
 * decided before the thread's history has settled (a reopened thread first
 * renders its stale cached page). When the thread has unreads but the row is
 * not in the loaded rows yet (more unread than one page), it asks for older
 * pages, a bounded number of them, each anchored so the reader stays put,
 * then lands once the row appears. If the row never appears (the divider
 * resolved to none, no more pages, the page cap, a failed or dropped page, the
 * deadline) the reader simply stays on the newest message. It also gives up
 * as soon as the reader has scrolled away from the bottom during that wait, or
 * a jump-to-message is starting: taking over their viewport then would be a
 * betrayal. A thread opened with no unreads never lands anywhere new, and live
 * messages after the open keep the usual stick-to-bottom behaviour.
 *
 * The landing is always an instant jump, reduced motion or not: this is where
 * a thread OPENS, so there is nothing for the reader to track.
 *
 * Must be called AFTER `useMessageScroll`'s content effect so, within one
 * layout flush, the first-population pin runs first and the landing overrides
 * it before paint. Returns a stable cancel for a jump to call.
 */
export function useUnreadLanding(
  activeId: string,
  landing: UnreadLandingInput,
  rows: MessageRow[],
  history: ThreadHistory,
  areaRef: RefObject<HTMLDivElement | null>,
  atBottomRef: RefObject<boolean>,
  pendingAnchorRef: RefObject<PendingScrollAnchor | null>,
  restoreAnchor: (anchor: ScrollAnchor) => void,
  armHistoryPageAnchor: () => void,
): () => void {
  const stateRef = useRef<UnreadLandingState | null>(null);
  const { unreadCount, isFlaggedUnread, isDividerResolved, hasPendingJump } =
    landing;
  const { hasMoreOlder, loadingOlder, onLoadOlder } = history;
  const { isHistorySettled, isHistoryError } = history;

  /** Puts the row with `rowKey` near the viewport top with a little context
   *  above it, then holds it there while the rows around it measure for the
   *  first time (the same settle window a prepend restore uses). */
  const landOnRow = useCallback(
    (rowKey: string) => {
      const area = areaRef.current;
      if (!area) return;
      const contextPx = Math.max(
        LANDING_CONTEXT_MIN_PX,
        Math.round(
          Math.min(
            area.clientHeight * LANDING_CONTEXT_VIEWPORT_SHARE,
            LANDING_CONTEXT_MAX_PX,
          ),
        ),
      );
      const anchor: ScrollAnchor = {
        rowKey,
        rowOffsetFromViewportTopPx: contextPx,
        distanceFromBottomPx: area.scrollHeight - area.scrollTop,
      };
      restoreAnchor(anchor);
      // An instant scroll writes `scrollTop` synchronously, so these now
      // describe the landed spot: the fallback distance (used if the row
      // vanishes mid-settle) and the pinned flag. A stale `true` would let the
      // next resize yank the reader back down to the newest message.
      anchor.distanceFromBottomPx = area.scrollHeight - area.scrollTop;
      atBottomRef.current = isNearBottom(area);
      holdAnchorThroughSettle(pendingAnchorRef, anchor);
    },
    [areaRef, atBottomRef, pendingAnchorRef, restoreAnchor],
  );

  useLayoutEffect(() => {
    const isThreadSwitch = stateRef.current?.threadId !== activeId;
    const state: UnreadLandingState =
      isThreadSwitch || !stateRef.current
        ? {
            threadId: activeId,
            isPending: unreadCount > 0 || isFlaggedUnread,
            pagesRequested: 0,
            isAwaitingPage: false,
            hasSeenLoading: false,
            requestedAtMs: 0,
            oldestKeyAtRequest: undefined,
            firstSettledAtMs: null,
          }
        : stateRef.current;
    stateRef.current = state;

    const step = (canRequestPage: boolean) => {
      if (!state.isPending) return;
      // The reader moved (scrolled up), or a jump is about to take them:
      // their viewport is theirs now.
      if (hasPendingJump || !atBottomRef.current) {
        state.isPending = false;
        return;
      }
      if (rows.length === 0) return;
      // Page 0 failed: what is loaded is stale, and nothing will page.
      if (isHistoryError) {
        state.isPending = false;
        return;
      }
      // Page 0 is still (re)loading: wait before deciding or paging.
      if (!isHistorySettled) return;
      const nowMs = performance.now();
      state.firstSettledAtMs ??= nowMs;
      const dividerRow = rows.find((row) => row.kind === "unreadDivider");
      if (
        nowMs - state.firstSettledAtMs > LANDING_DEADLINE_MS ||
        (!dividerRow && isDividerResolved)
      ) {
        state.isPending = false;
        return;
      }
      if (dividerRow) {
        state.isPending = false;
        landOnRow(dividerRow.key);
        return;
      }
      if (loadingOlder) {
        if (state.isAwaitingPage) state.hasSeenLoading = true;
        return;
      }
      if (state.isAwaitingPage) {
        if (!state.hasSeenLoading) {
          // Requested, not yet picked up: wait, but not forever.
          if (nowMs - state.requestedAtMs < PAGE_PICKUP_GRACE_MS) return;
          state.isPending = false;
          return;
        }
        state.isAwaitingPage = false;
        state.hasSeenLoading = false;
        if (oldestMessageKey(rows) === state.oldestKeyAtRequest) {
          state.isPending = false;
          return;
        }
      }
      if (!hasMoreOlder || state.pagesRequested >= MAX_UNREAD_LANDING_PAGES) {
        state.isPending = false;
        return;
      }
      if (!canRequestPage) return;
      state.pagesRequested += 1;
      state.isAwaitingPage = true;
      state.requestedAtMs = nowMs;
      state.oldestKeyAtRequest = oldestMessageKey(rows);
      armHistoryPageAnchor();
      onLoadOlder();
    };

    // On the thread-switch commit the query observer still holds the previous
    // thread's options (react-query applies new ones in a passive effect, after
    // this layout effect), so a page requested now would load the previous
    // thread's history. Decide now, request from a later frame.
    step(!isThreadSwitch);
    if (!isThreadSwitch || !state.isPending) return;
    const frameId = requestAnimationFrame(() => step(true));
    return () => cancelAnimationFrame(frameId);
  }, [
    activeId,
    unreadCount,
    isFlaggedUnread,
    isDividerResolved,
    hasPendingJump,
    rows,
    hasMoreOlder,
    loadingOlder,
    isHistorySettled,
    isHistoryError,
    onLoadOlder,
    atBottomRef,
    landOnRow,
    armHistoryPageAnchor,
  ]);

  return useCallback(() => {
    if (stateRef.current) stateRef.current.isPending = false;
  }, []);
}
