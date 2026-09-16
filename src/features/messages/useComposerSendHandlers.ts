// src/features/messages/useComposerSendHandlers.ts
import { useCallback, type KeyboardEvent } from "react";
import { hapticTap } from "../../shared/lib/haptics";
import { clearDraft, saveDraft } from "./drafts";

interface UseComposerSendHandlersArgs {
  conversationId: string;
  draft: string;
  setDraft: (nextValue: string) => void;
  isOverLimit: boolean;
  onSend: (body: string) => void;
  notifyTyping: () => void;
  stopTyping: (didSend: boolean) => void;
  scheduleSync: (nextValue: string) => void;
  syncNow: (nextValue: string) => void;
}

/**
 * `Composer.tsx`'s own send/change/blur/Enter-to-send handlers, split out to
 * keep that component under the line cap. Pure event wiring: every piece of
 * state (the draft, typing frames, draft sync) still lives in `Composer`
 * and is threaded through as plain arguments, so there is exactly one source
 * of truth for the draft text.
 */
export function useComposerSendHandlers({
  conversationId,
  draft,
  setDraft,
  isOverLimit,
  onSend,
  notifyTyping,
  stopTyping,
  scheduleSync,
  syncNow,
}: UseComposerSendHandlersArgs) {
  /** Enter-to-send and the send button both funnel through here so a send
   *  always clears the idle timer and tells the counterpart we've stopped.
   *  Clears the composer's own text (and its persisted + synced draft) in
   *  the same frame the message is handed up, so the input empties instantly. */
  const handleSend = useCallback(() => {
    const body = draft.trim();
    if (!body || isOverLimit) return;
    // Always inside a real user gesture (a click or an Enter keydown), which
    // is what `hapticTap`'s Vibration API call requires.
    hapticTap();
    stopTyping(true);
    onSend(body);
    setDraft("");
    clearDraft(conversationId);
    // Immediate rather than debounced: sending is a deliberate action, so
    // the server draft should clear right away rather than sit stale until
    // the debounce window would have fired.
    syncNow("");
  }, [
    conversationId,
    draft,
    isOverLimit,
    onSend,
    setDraft,
    stopTyping,
    syncNow,
  ]);

  const handleBlur = useCallback(() => {
    stopTyping(false);
  }, [stopTyping]);

  const handleChange = useCallback(
    (nextValue: string) => {
      setDraft(nextValue);
      saveDraft(conversationId, nextValue);
      scheduleSync(nextValue);
      notifyTyping();
    },
    [conversationId, notifyTyping, scheduleSync, setDraft],
  );

  /** Enter-to-send (desktop, non-touch): passed through to `MentionTextarea`,
   *  which invokes this only when the mention suggestion popup is closed, so
   *  Enter with the popup open still inserts the highlighted mention instead. */
  const handleComposerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter during CJK composition belongs to the IME; mirrors
      // `InlineEditField.tsx`'s own guard.
      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
      const isCoarsePointer =
        typeof window !== "undefined" &&
        window.matchMedia?.("(pointer: coarse)").matches;
      if (event.key === "Enter" && !event.shiftKey && !isCoarsePointer) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return { handleSend, handleBlur, handleChange, handleComposerKeyDown };
}
