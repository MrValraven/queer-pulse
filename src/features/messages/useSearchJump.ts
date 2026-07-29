import { useEffect } from "react";

/**
 * Scrolls to + highlights a message once its thread is open, after a cross-inbox
 * search result (or starred-message) pick. Retries briefly because the history
 * renders on a later commit than the thread switch; if the target is older than
 * the loaded page it won't be found (documented limitation — no
 * history-paging-to-message yet) and we give up rather than spin. Either way
 * `onJumpHandled` clears the pending id so it can't re-fire.
 *
 * Extracted from `ConversationPanel` so that component stays under the line cap.
 */
export function useSearchJump(
  jumpToMessageId: string | null | undefined,
  jumpToMessage: (messageId: string) => boolean,
  onJumpHandled?: () => void,
): void {
  useEffect(() => {
    if (!jumpToMessageId) return;
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;
    const tryJump = () => {
      if (cancelled) return;
      if (jumpToMessage(jumpToMessageId) || attempts >= 8) {
        onJumpHandled?.();
        return;
      }
      attempts += 1;
      timer = window.setTimeout(tryJump, 120);
    };
    const raf = requestAnimationFrame(tryJump);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
    };
  }, [jumpToMessageId, jumpToMessage, onJumpHandled]);
}
