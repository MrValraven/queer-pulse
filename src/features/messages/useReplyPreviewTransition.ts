// src/features/messages/useReplyPreviewTransition.ts
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import type { ChatMessage } from "./data";

/** Mirrors the CSS exit transition (`--dur-base`, see `.replyPreviewWrap` in
 *  MessagesPage.module.css) so the banner's content is removed from the DOM
 *  exactly when its collapse/fade-out finishes — never cut short, never left
 *  sitting around invisible-but-present. */
const EXIT_ANIMATION_MS = 250;

export interface ReplyPreviewTransition {
  /** The reply target to render, or null once nothing has ever been armed (or
   *  the exit animation has finished). Lags one exit animation behind
   *  `replyDraft` clearing so the banner's content stays mounted while it
   *  collapses; swapping to a different target while already open updates
   *  instantly (no re-animation — matches WhatsApp/Telegram). */
  previewMessage: ChatMessage | null;
  /** Drives the open/closed CSS state on the (always-mounted) wrapper. */
  open: boolean;
}

/**
 * Keeps the reply-preview banner mounted through its exit animation instead of
 * having it vanish the instant `replyDraft` clears (dismissed via ✕, or
 * cleared after send). The wrapper it renders into is unconditionally present
 * in the DOM (see `.replyPreviewWrap`), so toggling `open` always animates a
 * real closed→open (or open→closed) transition — no mount-timing tricks
 * needed. Under `prefers-reduced-motion: reduce`, the exit is instant (0ms).
 */
export function useReplyPreviewTransition(
  replyDraft: ChatMessage | null | undefined,
): ReplyPreviewTransition {
  const reducedMotion = usePrefersReducedMotion();
  const [previewMessage, setPreviewMessage] = useState<ChatMessage | null>(
    replyDraft ?? null,
  );

  useEffect(() => {
    if (replyDraft) {
      // Arming a reply (or swapping targets while already open) is instant —
      // only clearing to nothing animates out.
      setPreviewMessage(replyDraft);
      return;
    }
    const delay = reducedMotion ? 0 : EXIT_ANIMATION_MS;
    const timer = window.setTimeout(() => setPreviewMessage(null), delay);
    return () => window.clearTimeout(timer);
  }, [replyDraft, reducedMotion]);

  return { previewMessage, open: !!replyDraft };
}
