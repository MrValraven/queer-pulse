import { useEffect, useRef } from "react";
import { useMarkReadActivity } from "./api/useMessageMutations";

/** Mirrors the socket layer's own delivered-ack coalescing
 *  (`DELIVERED_ACK_DEBOUNCE_MS` in `shared/api/realtime.ts`) so a burst of
 *  inbound messages collapses into one `POST /read` instead of one per message. */
const MARK_READ_DEBOUNCE_MS = 500;

/** Whether someone can actually be reading the thread right now: the tab is
 *  visible AND the window has focus. A visible window sitting beside the one
 *  that has focus shows the thread without anyone looking at it, and marking
 *  read there shows the counterpart "Seen" on messages nobody read. */
function isReaderAttending(): boolean {
  return document.visibilityState === "visible" && document.hasFocus();
}

/**
 * Marks the open thread read as new inbound messages arrive WHILE it's
 * already open — closing the gap where the only server read ack was the one
 * `markRead.mutate` call inside `openThread` (see `useMessageThreadNav.ts`).
 * Without this, a reader sitting in an open thread who receives several more
 * messages never advances the counterpart's "Seen" tick, and the server-side
 * unread count keeps climbing until the reader leaves and re-opens the thread.
 *
 * Fires (debounced) only when ALL hold:
 * - the thread's initial history has settled (`isHistorySettled`). The mark
 *   watermark is seeded then from `newestInboundAt`, so page 0 arriving never
 *   reads as "new inbound" and duplicates `openThread`'s own POST. A thread
 *   that was unread when this hook first saw it is left unseeded instead, and
 *   this hook is what acks whatever the server has not: it was selected
 *   without `openThread` (the controller's render-time default, or its
 *   fallback when the open row vanishes), its open-time POST failed, or that
 *   POST only covered the stale cached page of a reopened thread while page 0
 *   was still refetching. The unread flag is captured on that first run, since
 *   the open-time POST's success clears it before history settles.
 * - there is inbound history newer than the watermark. The watermark only
 *   advances on a SUCCESSFUL read POST from any caller (`useMarkReadActivity`),
 *   so a failed POST is retried. Paging older history in never counts, and
 *   returning to the tab with nothing new sends nothing.
 * - no read POST for this thread is already on the wire.
 * - the reader is attending (`isReaderAttending`) and caught up
 *   (`!showJumpPill`, the same signal `useMessageScroll` derives for "at the
 *   bottom"; a reader scrolled up into history hasn't seen the tail).
 *
 * Anything that arrives while one fails stays pending and is marked the
 * moment it passes again: on `visibilitychange` to visible, on window
 * `focus`, or when the reader scrolls back down. After this hook's own POST
 * fails, only a newer inbound message, `focus` or `visibilitychange` retries
 * it, so a persistent failure can't repeat once per debounce. Hiding the tab
 * or a real window blur cancels a mark still waiting out its debounce, and
 * the timer re-checks before it sends. A no-op while `conversationId` is null
 * (demo mode, or a just-picked placeholder thread, see `realConversationId`).
 */
/** Per-thread bookkeeping, reset whenever the open conversation changes. */
interface MarkReadProgress {
  conversationId: string | null;
  /** Set once initial history has settled; nothing is marked before that. */
  isSeeded: boolean;
  /** `isThreadUnread` on this hook's first run for the conversation. */
  wasUnreadAtOpen: boolean | undefined;
  /** Newest inbound timestamp known read on the server: the seed, then the
   *  watermark of every acknowledged read POST. */
  newestMarkedAt: string | undefined;
  /** `Date.now()` just before this hook's own POST, to tell its failure apart
   *  from another caller's (`submittedAt` is stamped synchronously after). */
  attemptStartedAt: number | undefined;
  /** The `newestInboundAt` that POST covered. */
  attemptedThrough: string | undefined;
  /** A failed watermark effect re-runs must not retry on their own. */
  blockedThrough: string | undefined;
}

function freshProgress(conversationId: string | null): MarkReadProgress {
  return {
    conversationId,
    isSeeded: false,
    wasUnreadAtOpen: undefined,
    newestMarkedAt: undefined,
    attemptStartedAt: undefined,
    attemptedThrough: undefined,
    blockedThrough: undefined,
  };
}

function laterOf(first: string | undefined, second: string | undefined) {
  if (first === undefined) return second;
  if (second === undefined) return first;
  return first > second ? first : second;
}

export function useMarkReadOnInbound(
  conversationId: string | null,
  newestInboundAt: string | undefined,
  showJumpPill: boolean,
  isHistorySettled: boolean,
  isThreadUnread: boolean,
  onMarkRead: (conversationId: string) => void,
): void {
  const { isInFlight, acknowledgedThrough, latestFailedAt } =
    useMarkReadActivity(conversationId);
  const progressRef = useRef(freshProgress(conversationId));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (progressRef.current.conversationId !== conversationId) {
      progressRef.current = freshProgress(conversationId);
    }
    const progress = progressRef.current;

    function cancelPendingMark() {
      if (timerRef.current === null) return;
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    cancelPendingMark();
    if (!conversationId) return;
    const threadId = conversationId;

    progress.newestMarkedAt = laterOf(
      progress.newestMarkedAt,
      acknowledgedThrough,
    );
    if (progress.attemptStartedAt !== undefined) {
      if (
        latestFailedAt !== undefined &&
        latestFailedAt >= progress.attemptStartedAt
      ) {
        progress.blockedThrough = progress.attemptedThrough;
        progress.attemptStartedAt = undefined;
      } else if (
        acknowledgedThrough !== undefined &&
        progress.attemptedThrough !== undefined &&
        acknowledgedThrough >= progress.attemptedThrough
      ) {
        progress.attemptStartedAt = undefined;
      }
    }
    progress.wasUnreadAtOpen ??= isThreadUnread;
    if (!progress.isSeeded && isHistorySettled) {
      progress.isSeeded = true;
      if (!progress.wasUnreadAtOpen) {
        progress.newestMarkedAt = laterOf(
          progress.newestMarkedAt,
          newestInboundAt,
        );
      }
    }

    function hasUnmarkedInbound() {
      if (!progress.isSeeded || newestInboundAt === undefined) return false;
      const { newestMarkedAt } = progress;
      return newestMarkedAt === undefined || newestInboundAt > newestMarkedAt;
    }

    /** `isFreshTrigger` marks a reader-driven return (focus, tab visible),
     *  the only thing besides newer inbound that lifts a failure block. */
    function tryMarkRead(isFreshTrigger: boolean) {
      if (isFreshTrigger) progress.blockedThrough = undefined;
      if (
        progress.blockedThrough !== undefined &&
        progress.blockedThrough === newestInboundAt
      ) {
        return;
      }
      if (showJumpPill || isInFlight || !hasUnmarkedInbound()) return;
      if (!isReaderAttending() || timerRef.current !== null) return;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (!hasUnmarkedInbound() || !isReaderAttending()) return;
        progress.attemptStartedAt = Date.now();
        progress.attemptedThrough = newestInboundAt;
        onMarkRead(threadId);
      }, MARK_READ_DEBOUNCE_MS);
    }

    function handleFocus() {
      tryMarkRead(true);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") tryMarkRead(true);
      else cancelPendingMark();
    }

    // Focus moving into an iframe on this page blurs the window while the
    // document keeps focus, so re-check a frame later before cancelling.
    let blurCheckFrame: number | null = null;
    function handleBlur() {
      if (blurCheckFrame !== null) return;
      blurCheckFrame = window.requestAnimationFrame(() => {
        blurCheckFrame = null;
        if (!document.hasFocus()) cancelPendingMark();
      });
    }

    tryMarkRead(false);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      if (blurCheckFrame !== null) window.cancelAnimationFrame(blurCheckFrame);
      cancelPendingMark();
    };
  }, [
    conversationId,
    newestInboundAt,
    showJumpPill,
    isHistorySettled,
    isThreadUnread,
    isInFlight,
    acknowledgedThrough,
    latestFailedAt,
    onMarkRead,
  ]);
}
