// src/features/messages/useMessageRowJump.ts
import { useCallback, useRef } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { findRowIndexForMessage, type MessageRow } from "./messageRows";
import { useJumpToMessage } from "./useJumpToMessage";
import { useSearchJump } from "./useSearchJump";

/** How many times to retry the DOM-based highlight after asking the
 *  virtualizer to scroll a not-yet-mounted row into view, and the delay
 *  between attempts — short enough to feel instant, long enough to span the
 *  couple of frames `scrollToIndex` needs to settle on an unmeasured row (see
 *  `useMessageScroll`'s own two-rAF settle window for the same reason). */
const HIGHLIGHT_RETRY_ATTEMPTS = 6;
const HIGHLIGHT_RETRY_DELAY_MS = 80;

/**
 * The ONE scroll-to-a-message entry point for a virtualized log: reply-quote
 * clicks, the pinned-message banner, and a cross-inbox search/starred pick all
 * resolve through the function this returns.
 *
 * A message that isn't currently mounted (virtualized off-screen, however far
 * away, not just "on an unloaded older page") can't be found by
 * `document.getElementById` alone anymore, so this first asks the virtualizer
 * to scroll the target's ROW into view (a no-op if it's already mounted).
 * `scrollToIndex` on a row whose real height isn't known yet resolves
 * iteratively across several frames rather than synchronously, so the very
 * first `document.getElementById` lookup can still miss even though the row
 * IS on its way onto screen. `useSearchJump`'s own effect-driven retry loop
 * only covers jumps that go through the `jumpToMessageId` prop (a cross-inbox
 * search/starred pick); a direct call from a reply-quote tap or the pinned
 * banner is a single, synchronous invocation with no external retry. Without
 * one, virtualizing the log would silently regress "tap a reply-quote to a
 * message several screens away" from always-highlights (every message used to
 * be mounted) to a coin flip. So this hook retries its OWN highlight
 * internally, for every caller alike, whenever a target row exists in the
 * flattened list but the first lookup came up empty — `useSearchJump` still
 * layers its own retry on top for the thread-still-mounting case (the rows
 * list itself hasn't populated yet), which this internal loop can't cover
 * since `findRowIndexForMessage` would return -1 for it too.
 */
export function useMessageRowJump(
  rows: MessageRow[],
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  jumpToMessageId: string | null | undefined,
  onJumpHandled: (() => void) | undefined,
): (messageId: string) => boolean {
  const jumpToMessage = useJumpToMessage();
  // Guards against a stale retry chain still ticking for a PREVIOUS target
  // (or a previous conversation) re-highlighting once it finally mounts —
  // bumped on every fresh call, checked before each retry fires.
  const retryTokenRef = useRef(0);

  const jumpToMessageVirtualized = useCallback(
    (messageId: string): boolean => {
      const rowIndex = findRowIndexForMessage(rows, messageId);
      if (rowIndex !== -1) {
        rowVirtualizer.scrollToIndex(rowIndex, { align: "center" });
      }
      const found = jumpToMessage(messageId);
      if (!found && rowIndex !== -1) {
        const token = ++retryTokenRef.current;
        let attempts = 0;
        const retry = () => {
          if (retryTokenRef.current !== token) return; // superseded by a newer jump
          if (jumpToMessage(messageId) || attempts >= HIGHLIGHT_RETRY_ATTEMPTS) return;
          attempts += 1;
          window.setTimeout(retry, HIGHLIGHT_RETRY_DELAY_MS);
        };
        window.setTimeout(retry, HIGHLIGHT_RETRY_DELAY_MS);
      }
      return found;
    },
    [rows, rowVirtualizer, jumpToMessage],
  );

  useSearchJump(jumpToMessageId, jumpToMessageVirtualized, onJumpHandled);

  return jumpToMessageVirtualized;
}
