import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { isNearBottom } from "./useStickToBottom";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import type { MessageRow } from "./messageRows";
import {
  useJumpScrollBridge,
  useOlderPageAnchor,
  type ThreadHistory,
} from "./useOlderPageAnchor";
import { useScrollResizeFollow } from "./useScrollResizeFollow";
import { useUnreadLanding, type UnreadLandingInput } from "./useUnreadLanding";
// TEMPORARY — see scrollTrace.ts's revert instructions.
import { traceScrollEvent } from "./scrollTrace";

/** Minimum genuine overflow (`scrollHeight - clientHeight`) required before a
 *  near-top `scrollTop` is trusted as "the reader scrolled to the top" — see
 *  `handleAreaScroll`'s guard comment for why this exists. A few px, not 0:
 *  subpixel layout rounding can leave a hairline of "overflow" even when a
 *  thread visually fits the viewport exactly. */
const OVERFLOW_MARGIN_PX = 4;

/**
 * Owns the message-area scroll position for a conversation: sticks to the
 * bottom on new content only when the reader is already near it (else surfaces
 * a counted "new messages" pill), preserves the viewport when older history
 * prepends, keeps the reader pinned when a visible bubble *resizes* (a late
 * image, an added reaction, an expanded edit), and jumps to the latest message
 * on a thread switch. Extracted from `ConversationPanel` so that delicate logic
 * lives in one focused unit.
 *
 * All scroll-position WRITES go through the virtualizer's own scroll API
 * (`scrollToIndex`/`scrollToOffset`) rather than a raw `element.scrollTop =`
 * assignment. This isn't cosmetic: the
 * message list is virtualized (`useMessageRowVirtualizer`), and the virtualizer
 * tracks its own notion of the current scroll offset (updated synchronously by
 * its own scroll API, but only asynchronously — on the next native `scroll`
 * event — from a raw DOM write). If a row's real height is measured for the
 * first time in between (any row that has never been on screen before, which
 * is exactly what happens the moment a long thread first opens), the
 * virtualizer's own "keep the viewport stable when a row's size changes"
 * correction runs against its STALE internal offset and fights a raw write —
 * observed in practice as the reader landing back at the very TOP of a long
 * thread instead of the bottom. Routing every write through the virtualizer's
 * own API keeps its internal bookkeeping (and therefore that correction)
 * consistent with what's actually on screen.
 *
 * The content-mutating `useLayoutEffect`s MUST stay in this declaration order:
 * React flushes layout effects before paint in declaration order, so the
 * thread-switch effect runs first (resetting the growth baseline), the content
 * effect then sees no spurious growth, and `useUnreadLanding` runs last so it
 * can override the first-population pin before paint. The resize-follow
 * observer (`useScrollResizeFollow`) is set-up only (its work runs async, off
 * `atBottomRef`), so its position is immaterial.
 *
 * Every remembered position (prepend anchor, unread landing) lives in the
 * scroller's DOM scroll space; see `scrollAnchor.ts` for why that matters.
 */
// TEMPORARY — the `traceScrollEvent` call sites (see scrollTrace.ts) push this
// hook over the line budget; remove the disable alongside the calls.
// eslint-disable-next-line max-lines-per-function
export function useMessageScroll(
  messageCount: number,
  /** How many of the rendered messages are inbound (`from === "them"`). Drives
   *  the jump-pill count: only genuinely-inbound arrivals while scrolled up
   *  count as unread — the reader's own sends never do. */
  inboundCount: number,
  activeId: string,
  history: ThreadHistory,
  areaRef: RefObject<HTMLDivElement | null>,
  /** A single stable wrapper around the virtualized sizer + typing row (see
   *  `MessageArea`'s `.areaContent`). Its box grows with any descendant, so
   *  the resize-follow observer watches it (alongside `areaRef`, whose box
   *  changes when the layout around the log does), and its top edge is where
   *  the virtualizer's coordinate space begins (see `scrollAnchor.ts`). */
  contentRef: RefObject<HTMLDivElement | null>,
  /** The SAME `@tanstack/react-virtual` instance `MessageArea` renders from
   *  (built alongside `areaRef`/`contentRef` in `ConversationPanel`) — every
   *  scroll-position write in this hook goes through it (see above). */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  /** The same row list the virtualizer renders: picks a prepend-safe anchor
   *  row and finds the unread divider row. */
  rows: MessageRow[],
  /** The open thread's unread state, read when it opens (see
   *  `useUnreadLanding`). */
  landing: UnreadLandingInput,
) {
  const { hasMoreOlder, loadingOlder, onLoadOlder, isHistorySettled } = history;
  /** Inbound messages that arrived while the reader was scrolled up; 0 when
   *  they're at the bottom. Shown on the jump-to-latest pill. */
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const previousCountRef = useRef(0);
  const previousInboundCountRef = useRef(0);
  /** Whether the reader is currently anchored to the bottom — the single source
   *  of truth for stick-to-bottom. Read on resize (a growing bubble must not
   *  un-stick a reader who WAS at the bottom) and on new content; updated on
   *  every scroll and after every programmatic pin. Deliberately NOT a
   *  post-mutation re-measure of `isNearBottom`: freshly-added or freshly-grown
   *  content skews distance-from-bottom, so a reader who was pinned would read
   *  as "far from bottom" the instant a tall bubble lands. */
  const atBottomRef = useRef(true);
  /** True for a couple of frames right after the thread opens or its messages
   *  first populate — exactly the window in which a virtualized row's
   *  ESTIMATED height (see `estimateRowHeight`) gets corrected to its real,
   *  MEASURED one. On a thread shorter than the viewport that correction can
   *  shrink the total content height, and the browser's native scrollTop
   *  clamp (it can never exceed the new, smaller max) snaps `scrollTop` back
   *  to 0 on its own — satisfying the near-top "load older" threshold in
   *  `handleAreaScroll` with NO user action. While this ref is true, a
   *  near-top scroll event is never trusted as scroll intent. Armed by
   *  `armInitialSettleGuard`, cleared two animation frames later (this
   *  settling is a synchronous re-measure + re-render, not a network
   *  round-trip, so two rAFs is comfortably past it — the same window the
   *  prepend-anchor logic below already waits out for the same reason). */
  const initialSettleGuardRef = useRef(false);
  // The reader's place through an older-history prepend (see the hook).
  const {
    pendingAnchorRef,
    restoreAnchor,
    resetOlderPageAnchor,
    settleOlderPage,
    followReaderWhileArmed,
    armOlderPageAnchor,
    armHistoryPageAnchor,
    releaseSettlingAnchor,
  } = useOlderPageAnchor(
    areaRef,
    contentRef,
    rowVirtualizer,
    rows,
    atBottomRef,
  );

  const armInitialSettleGuard = useCallback(() => {
    initialSettleGuardRef.current = true;
    traceScrollEvent(
      "armInitialSettleGuard",
      areaRef.current,
      rowVirtualizer,
      atBottomRef,
    );
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initialSettleGuardRef.current = false;
        traceScrollEvent(
          "clearInitialSettleGuard",
          areaRef.current,
          rowVirtualizer,
          atBottomRef,
        );
      });
    });
  }, [areaRef, rowVirtualizer]);

  /** Pin to the bottom, through the virtualizer's own scroll API (see the file
   *  comment for why a raw `element.scrollTop =` isn't safe here). `animate`
   *  requests a smooth glide (honouring prefers-reduced-motion — reduced-motion
   *  readers always get an instant jump); every pin passes `false` (an instant
   *  WhatsApp-style snap) EXCEPT the explicit pill tap (`jumpToLatest`), which
   *  is a user-initiated jump across potentially many messages and reads
   *  better as a glide. Thread-switch, new-message, and resize-follow are all
   *  instant — the reader should never watch a growing thread glide into place.
   *
   *  Nothing wraps this in an animation: a transform on the log would hang
   *  below its layout box and hand the next pin scroll room that does not
   *  really exist. `.area`'s block padding is outside the virtualizer's
   *  coordinate space (no `scrollMargin`/`paddingStart` is passed), so
   *  `scrollToIndex(last, "end")` already targets ~40px past the true bottom
   *  and will consume any such room on sight. Measured: an animated log walked
   *  itself up 45px per frame and then snapped back. */
  const scrollToBottom = useCallback(
    (animate: boolean) => {
      const rowCount = rowVirtualizer.options.count;
      const behavior =
        animate && !prefersReducedMotionNow() ? "smooth" : "auto";
      traceScrollEvent(
        "scrollToBottom:before",
        areaRef.current,
        rowVirtualizer,
        atBottomRef,
        {
          rowCount,
          targetIndex: rowCount > 0 ? rowCount - 1 : null,
          behavior,
        },
      );
      if (rowCount > 0) {
        // `scrollToIndex` (not a raw offset) — it resolves iteratively across
        // frames if the target row's real height isn't known yet, which a
        // single `getTotalSize()`-based offset can't: on a long thread this is
        // exactly the row that's never been measured before, so a plain offset
        // computed from the CURRENT (partly-estimated) total consistently came
        // up short of the true bottom in practice.
        rowVirtualizer.scrollToIndex(rowCount - 1, { align: "end", behavior });
      } else {
        rowVirtualizer.scrollToOffset(0, { align: "start", behavior });
      }
      atBottomRef.current = true;
      traceScrollEvent(
        "scrollToBottom:after",
        areaRef.current,
        rowVirtualizer,
        atBottomRef,
        {
          rowCount,
          targetIndex: rowCount > 0 ? rowCount - 1 : null,
        },
      );
    },
    [rowVirtualizer, areaRef],
  );

  // Thread switch: jump to bottom, reset the pill count and growth baselines,
  // and (desktop only) focus the composer. Declared BEFORE the content effect.
  useLayoutEffect(() => {
    traceScrollEvent(
      "threadSwitch:entry",
      areaRef.current,
      rowVirtualizer,
      atBottomRef,
      {
        activeId,
        messageCount,
      },
    );
    scrollToBottom(false);
    // Resets the scroll pill on thread switch, alongside the DOM scroll pin.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewMessagesCount(0);
    previousCountRef.current = messageCount;
    previousInboundCountRef.current = inboundCount;
    resetOlderPageAnchor(loadingOlder);
    atBottomRef.current = true;
    // A freshly-opened thread is exactly when a row can be measured for the
    // first time — arm the false-load-older guard (see its declaration).
    armInitialSettleGuard();
    if (window.matchMedia?.("(pointer: fine)").matches) {
      document.getElementById("messages-composer")?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Single owner of scroll position on content change, in priority order:
  //  1. An older-history page request just settled with an anchor armed →
  //     restore the reader's viewport if rows landed, disarm if none did.
  //  2. New content at the bottom → stick if the reader is pinned there, else
  //     accrue the inbound arrivals onto the pill count.
  useLayoutEffect(() => {
    const previousCount = previousCountRef.current;
    const previousInbound = previousInboundCountRef.current;
    traceScrollEvent(
      "contentEffect:entry",
      areaRef.current,
      rowVirtualizer,
      atBottomRef,
      {
        previousCount,
        messageCount,
        previousInbound,
        inboundCount,
        loadingOlder,
      },
    );
    previousCountRef.current = messageCount;
    previousInboundCountRef.current = inboundCount;
    const grew = messageCount > previousCount;
    // Restores the reader's place (rows landed) or disarms the anchor (failed
    // or empty page) on the older-page settle edge.
    const { isOlderPageSettle, isConsumed } = settleOlderPage(
      loadingOlder,
      grew,
    );
    if (isConsumed) return;
    // First time this thread's messages populate — in live mode history arrives
    // on a LATER commit than the thread switch, when the container was still
    // empty (count 0). Land on the latest message, never surface the pill.
    const isFirstPopulation = previousCount === 0 && messageCount > 0;
    traceScrollEvent(
      "contentEffect:branch",
      areaRef.current,
      rowVirtualizer,
      atBottomRef,
      { isFirstPopulation, grew },
    );
    if (isFirstPopulation) {
      scrollToBottom(false);
      setNewMessagesCount(0);
      // Rows didn't exist yet when the thread-switch effect above ran (this is
      // live mode's history query resolving on a LATER commit) — this is the
      // real first opportunity for a row to be measured, so (re-)arm the
      // false-load-older guard here too.
      armInitialSettleGuard();
      return;
    }
    if (!grew) return;
    if (atBottomRef.current) {
      traceScrollEvent(
        "contentEffect:stick",
        areaRef.current,
        rowVirtualizer,
        atBottomRef,
      );
      scrollToBottom(false);
      setNewMessagesCount(0);
    } else if (!isOlderPageSettle) {
      // An older page that landed without an anchor (the unread landing's own
      // paging) is history, never an arrival, so it skips the pill.
      // Only inbound arrivals count as "new" on the pill; my own sends (which
      // also grow the list) never do.
      const inboundArrived = inboundCount - previousInbound;
      traceScrollEvent(
        "contentEffect:pill",
        areaRef.current,
        rowVirtualizer,
        atBottomRef,
        { inboundArrived },
      );
      if (inboundArrived > 0) {
        setNewMessagesCount((current) => current + inboundArrived);
      }
    }
  }, [
    messageCount,
    inboundCount,
    loadingOlder,
    scrollToBottom,
    settleOlderPage,
    armInitialSettleGuard,
  ]);

  // Opening a thread with unreads lands on the "New messages" divider. MUST
  // stay after the content effect (see the hook's own comment).
  const cancelUnreadLanding = useUnreadLanding(
    activeId,
    landing,
    rows,
    history,
    areaRef,
    atBottomRef,
    pendingAnchorRef,
    restoreAnchor,
    armHistoryPageAnchor,
  );
  // The scroll layer's side of a jump-to-message (see `JumpScrollBridge`).
  const jumpScroll = useJumpScrollBridge(
    areaRef,
    atBottomRef,
    releaseSettlingAnchor,
    cancelUnreadLanding,
    armHistoryPageAnchor,
  );

  // Stick-to-bottom across a resize of the content OR of the scroll container
  // itself (keyboard, auto-growing composer), and the anchor settle window.
  useScrollResizeFollow(
    activeId,
    areaRef,
    contentRef,
    rowVirtualizer,
    atBottomRef,
    pendingAnchorRef,
    restoreAnchor,
    scrollToBottom,
  );

  // Stabilized: `ConversationPanel` re-renders more often than this hook's own
  // logic changes (a receipt tick, a thread-unrelated state update), and this
  // callback is handed to `MessageArea` as `onScroll` — an unstable reference
  // there is harmless today (`MessageArea` isn't itself `React.memo`'d), but
  // keeping it stable costs nothing and matches the rest of this pane.
  const handleAreaScroll = useCallback(() => {
    const element = areaRef.current;
    if (!element) return;
    if (isNearBottom(element)) {
      atBottomRef.current = true;
      setNewMessagesCount(0);
      traceScrollEvent(
        "handleAreaScroll:nearBottom",
        element,
        rowVirtualizer,
        atBottomRef,
      );
    } else {
      atBottomRef.current = false;
      traceScrollEvent(
        "handleAreaScroll:notNearBottom",
        element,
        rowVirtualizer,
        atBottomRef,
      );
    }
    // Guard against a false "load older" trigger on a thread SHORTER than the
    // viewport (see `initialSettleGuardRef`'s and `OVERFLOW_MARGIN_PX`'s
    // declarations for the full mechanism): an estimate→measured row-height
    // correction can shrink the total content height below the viewport's,
    // and the browser's native scrollTop clamp then snaps `scrollTop` to 0 on
    // its own — with no user action — which would otherwise satisfy the
    // near-top threshold below. Two independent checks stop that:
    //  1. `initialSettleGuardRef.current` — true only for the couple of
    //     frames right after the thread opens/first populates, i.e. exactly
    //     the window in which that correction can happen.
    //  2. Genuine overflow — a thread that doesn't actually overflow the
    //     viewport (`scrollHeight` no taller than `clientHeight` past a small
    //     margin) has no real "top" to have scrolled to; resting at
    //     `scrollTop === 0` there is the steady state, not scroll intent.
    // A real long-thread scroll-to-top always clears both comfortably: it
    // happens long after the thread has settled, and the content genuinely
    // overflows.
    // An anchor armed for an in-flight page follows the reader's scrolling.
    followReaderWhileArmed(element);
    const hasGenuineOverflow =
      element.scrollHeight - element.clientHeight > OVERFLOW_MARGIN_PX;
    if (
      !initialSettleGuardRef.current &&
      hasGenuineOverflow &&
      element.scrollTop <= 48 &&
      hasMoreOlder &&
      !loadingOlder &&
      // The controller ignores the request while page 0 refetches; arming
      // then would leave an anchor waiting on a page that never comes.
      isHistorySettled &&
      // Preserve the viewport: remember a prepend-safe row's on-screen spot,
      // put it back once the older page lands (see `useOlderPageAnchor`).
      armOlderPageAnchor(element)
    ) {
      traceScrollEvent(
        "handleAreaScroll:loadOlderTriggered",
        element,
        rowVirtualizer,
        atBottomRef,
      );
      onLoadOlder();
    }
  }, [
    areaRef,
    hasMoreOlder,
    loadingOlder,
    isHistorySettled,
    onLoadOlder,
    rowVirtualizer,
    followReaderWhileArmed,
    armOlderPageAnchor,
  ]);

  const jumpToLatest = useCallback(() => {
    scrollToBottom(true);
    setNewMessagesCount(0);
  }, [scrollToBottom]);

  return {
    showJumpPill: newMessagesCount > 0,
    newMessagesCount,
    handleAreaScroll,
    jumpToLatest,
    jumpScroll,
  };
}
