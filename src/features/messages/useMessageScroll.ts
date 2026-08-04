import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { isNearBottom } from "./useStickToBottom";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";

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
 * The two content-mutating `useLayoutEffect`s MUST stay in this declaration
 * order: React flushes layout effects before paint in declaration order, so the
 * thread-switch effect runs first (resetting the growth baseline) and the
 * content effect then sees no spurious growth. The ResizeObserver effect is
 * set-up only (its work runs async, off `atBottomRef`), so its position is
 * immaterial — it lives last.
 */
export function useMessageScroll(
  messageCount: number,
  /** How many of the rendered messages are inbound (`from === "them"`). Drives
   *  the jump-pill count: only genuinely-inbound arrivals while scrolled up
   *  count as unread — the reader's own sends never do. */
  inboundCount: number,
  activeId: string,
  hasMoreOlder: boolean,
  loadingOlder: boolean,
  onLoadOlder: () => void,
  areaRef: RefObject<HTMLDivElement | null>,
  /** A single stable wrapper around the virtualized sizer + typing row (see
   *  `MessageArea`'s `.areaContent`) — the ONE node the resize-follow effect
   *  below observes. `areaRef`'s own box is fixed (`overflow-y: auto`), so it
   *  never reports a growing bubble; a plain in-flow wrapper's box grows with
   *  any descendant, so observing just this one node (instead of re-observing
   *  every child on every new message) catches every resize for the whole
   *  life of the thread. */
  contentRef: RefObject<HTMLDivElement | null>,
  /** The SAME `@tanstack/react-virtual` instance `MessageArea` renders from
   *  (built alongside `areaRef`/`contentRef` in `ConversationPanel`) — every
   *  scroll-position write in this hook goes through it (see above). */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
) {
  /** Inbound messages that arrived while the reader was scrolled up; 0 when
   *  they're at the bottom. Shown on the jump-to-latest pill. */
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const previousCountRef = useRef(0);
  const previousInboundCountRef = useRef(0);
  /** Distance-from-bottom to restore after an older-history prepend, so the
   *  viewport doesn't jump; null when no restore is pending. */
  const pendingAnchorRef = useRef<number | null>(null);
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

  const armInitialSettleGuard = useCallback(() => {
    initialSettleGuardRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initialSettleGuardRef.current = false;
      });
    });
  }, []);

  /** Pin to the bottom, through the virtualizer's own scroll API (see the file
   *  comment for why a raw `element.scrollTop =` isn't safe here). `animate`
   *  requests a smooth glide (honouring prefers-reduced-motion — reduced-motion
   *  readers always get an instant jump); every pin passes `false` (an instant
   *  WhatsApp-style snap) EXCEPT the explicit pill tap (`jumpToLatest`), which
   *  is a user-initiated jump across potentially many messages and reads
   *  better as a glide. Thread-switch, new-message, and resize-follow are all
   *  instant — the reader should never watch a growing thread glide into place. */
  const scrollToBottom = useCallback(
    (animate: boolean) => {
      const rowCount = rowVirtualizer.options.count;
      const behavior = animate && !prefersReducedMotionNow() ? "smooth" : "auto";
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
    },
    [rowVirtualizer],
  );

  /** Restores the reader's remembered distance-from-bottom (see
   *  `pendingAnchorRef`) — the prepend-anchor and its resize-follow settle,
   *  both through the virtualizer's own offset API. */
  const restoreAnchor = useCallback(
    (distanceFromBottom: number) => {
      rowVirtualizer.scrollToOffset(
        rowVirtualizer.getTotalSize() - distanceFromBottom,
        { align: "start", behavior: "auto" },
      );
    },
    [rowVirtualizer],
  );

  // Thread switch: jump to bottom, reset the pill count and growth baselines,
  // and (desktop only) focus the composer. Declared BEFORE the content effect.
  useLayoutEffect(() => {
    scrollToBottom(false);
    // Resets the scroll pill on thread switch, alongside the DOM scroll pin.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewMessagesCount(0);
    previousCountRef.current = messageCount;
    previousInboundCountRef.current = inboundCount;
    pendingAnchorRef.current = null;
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
  //  1. An older-history page just prepended → restore the reader's viewport.
  //  2. New content at the bottom → stick if the reader is pinned there, else
  //     accrue the inbound arrivals onto the pill count.
  useLayoutEffect(() => {
    const previousCount = previousCountRef.current;
    const previousInbound = previousInboundCountRef.current;
    previousCountRef.current = messageCount;
    previousInboundCountRef.current = inboundCount;
    if (pendingAnchorRef.current !== null) {
      restoreAnchor(pendingAnchorRef.current);
      // Keep the anchor armed for two more frames instead of clearing it here:
      // a freshly-prepended row above the viewport may still be sized off its
      // ESTIMATE (not yet measured) at the exact moment this restore runs. If
      // `measureElement` corrects that estimate a frame later, the resize-follow
      // ResizeObserver below reapplies this SAME distance-from-bottom (see its
      // pendingAnchorRef branch) so that second, smaller correction never shows
      // as a jump either. Two rAFs is comfortably past when that correction
      // lands (it's a synchronous remeasure + re-render, not a network
      // round-trip); after that the anchor is released so an unrelated LATER
      // resize (a reaction landing on some other bubble, say) doesn't keep
      // re-snapping the reader to a now-stale distance.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pendingAnchorRef.current = null;
        });
      });
      return;
    }
    // First time this thread's messages populate — in live mode history arrives
    // on a LATER commit than the thread switch, when the container was still
    // empty (count 0). Land on the latest message, never surface the pill.
    const isFirstPopulation = previousCount === 0 && messageCount > 0;
    const grew = messageCount > previousCount;
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
      scrollToBottom(false);
      setNewMessagesCount(0);
    } else {
      // Only inbound arrivals count as "new" on the pill; my own sends (which
      // also grow the list) never do.
      const inboundArrived = inboundCount - previousInbound;
      if (inboundArrived > 0) {
        setNewMessagesCount((current) => current + inboundArrived);
      }
    }
  }, [messageCount, inboundCount, scrollToBottom, restoreAnchor, armInitialSettleGuard]);

  // Stick-to-bottom must survive a *resize* of already-rendered content — a
  // late-loading image, an added reaction chip, an expanding inline edit —
  // none of which change `messageCount`, so the effect above never fires for
  // them. A ResizeObserver re-pins a reader who WAS at the bottom (read off
  // `atBottomRef`, never a post-resize re-measure), and does it INSTANTLY —
  // WhatsApp-style, a pinned reader's viewport should snap as content grows,
  // not glide, and a smooth scroll here would otherwise compete with (and get
  // visibly interrupted by) the very next resize a moment later. It never
  // fights the two other paths: during an older-history load the reader is at
  // the TOP, so `atBottomRef` is false and this stays inert; and it only ever
  // pins toward the bottom, never toward a prepend.
  useLayoutEffect(() => {
    const area = areaRef.current;
    const content = contentRef.current;
    if (!area || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      // A prepend restore (above) is still settling — a virtualized row's
      // estimated height just got corrected to its measured size. Reapply the
      // SAME remembered distance-from-bottom rather than falling through to
      // the bottom-stick branch below, so an older-history load never visibly
      // jumps even across that second, measurement-driven correction.
      if (pendingAnchorRef.current !== null) {
        restoreAnchor(pendingAnchorRef.current);
        return;
      }
      if (!atBottomRef.current) return;
      if (isNearBottom(area, 1)) return; // already flush to the bottom
      scrollToBottom(false);
    });
    // ONE stable node for the whole panel's lifetime (see `contentRef`'s
    // comment) — no re-subscribing per message. `MessageArea` itself isn't
    // remounted per thread, so `content` doesn't actually change across a
    // switch either; re-running on `activeId` is a cheap, defensive refresh
    // rather than a requirement.
    observer.observe(content);
    return () => observer.disconnect();
  }, [activeId, areaRef, contentRef, restoreAnchor, scrollToBottom]);

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
    } else {
      atBottomRef.current = false;
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
    const hasGenuineOverflow =
      element.scrollHeight - element.clientHeight > OVERFLOW_MARGIN_PX;
    if (
      !initialSettleGuardRef.current &&
      hasGenuineOverflow &&
      element.scrollTop <= 48 &&
      hasMoreOlder &&
      !loadingOlder &&
      pendingAnchorRef.current === null
    ) {
      // Preserve the viewport: remember distance-from-bottom, restore after prepend.
      pendingAnchorRef.current = element.scrollHeight - element.scrollTop;
      onLoadOlder();
    }
  }, [areaRef, hasMoreOlder, loadingOlder, onLoadOlder]);

  const jumpToLatest = useCallback(() => {
    scrollToBottom(true);
    setNewMessagesCount(0);
  }, [scrollToBottom]);

  return {
    showJumpPill: newMessagesCount > 0,
    newMessagesCount,
    handleAreaScroll,
    jumpToLatest,
  };
}
