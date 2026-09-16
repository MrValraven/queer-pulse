import { useEffect } from "react";

/**
 * Starts the jump to a message once its thread is open, after a cross-inbox
 * search result (or starred-message) pick, then calls `onJumpHandled` exactly
 * once so the parent clears the pending id and it can't re-fire.
 *
 * No retry loop here: the jump mechanism itself waits for a freshly-opened
 * thread's first page, pages back for an older message, and reports an
 * outcome. Handing off after one frame keeps a StrictMode double-invoked
 * effect (mount, cleanup, mount) from starting the jump twice.
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
    const frameId = requestAnimationFrame(() => {
      jumpToMessage(jumpToMessageId);
      onJumpHandled?.();
    });
    return () => cancelAnimationFrame(frameId);
  }, [jumpToMessageId, jumpToMessage, onJumpHandled]);
}
