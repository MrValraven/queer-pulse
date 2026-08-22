import { useEffect, useRef } from "react";

/** Mirrors the socket layer's own delivered-ack coalescing
 *  (`DELIVERED_ACK_DEBOUNCE_MS` in `shared/api/realtime.ts`) so a burst of
 *  inbound messages collapses into one `POST /read` instead of one per message. */
const MARK_READ_DEBOUNCE_MS = 500;

/**
 * Marks the open thread read as new inbound messages arrive WHILE it's
 * already open — closing the gap where the only server read ack was the one
 * `markRead.mutate` call inside `openThread` (see `useMessageThreadNav.ts`).
 * Without this, a reader sitting in an open thread who receives several more
 * messages never advances the counterpart's "Seen" tick, and the server-side
 * unread count keeps climbing until the reader leaves and re-opens the thread.
 *
 * Fires (debounced) when the thread's inbound message count grows while the
 * document is visible and the reader is caught up (`!showJumpPill` — the same
 * signal `useMessageScroll` derives for "at the bottom"; a reader scrolled up
 * into history hasn't actually seen the tail, so this deliberately does not
 * fire for them). Also re-checks on `visibilitychange`, so messages that
 * arrived while the tab was backgrounded are marked read the moment the
 * reader returns to it. A no-op while `conversationId` is null (demo mode, or
 * a just-picked placeholder thread — see `realConversationId`), and does not
 * fire on the initial mount/thread-switch, since `openThread` already marks
 * that thread read.
 */
export function useMarkReadOnInbound(
  conversationId: string | null,
  inboundCount: number,
  showJumpPill: boolean,
  onMarkRead: (conversationId: string) => void,
): void {
  const previousRef = useRef({ conversationId, inboundCount });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const previous = previousRef.current;
    const isSameThread = previous.conversationId === conversationId;
    const grew = isSameThread && inboundCount > previous.inboundCount;
    previousRef.current = { conversationId, inboundCount };

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!conversationId) return;

    function tryMarkRead() {
      if (!conversationId) return;
      if (document.visibilityState !== "visible" || showJumpPill) return;
      if (timerRef.current !== null) return;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        onMarkRead(conversationId);
      }, MARK_READ_DEBOUNCE_MS);
    }

    // Only auto-fire for genuinely NEW inbound messages on the thread that was
    // already open — the initial open of a thread is already covered by
    // `openThread`'s own `markRead.mutate`, so this doesn't double-fire on
    // every thread switch.
    if (grew) tryMarkRead();

    document.addEventListener("visibilitychange", tryMarkRead);
    return () => {
      document.removeEventListener("visibilitychange", tryMarkRead);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [conversationId, inboundCount, showJumpPill, onMarkRead]);
}
