// src/features/messages/useComposerReplyFocus.ts
import { useEffect, useRef, type RefObject } from "react";

/**
 * DES-207: arming a reply (the overlay's Reply action, or a swipe-to-reply
 * gesture) moves focus into the message field so typing the reply can start
 * immediately, WhatsApp-style. Keyed on the id alone, so replying to the
 * SAME message twice in a row (already armed) doesn't re-focus and steal a
 * caret position mid-edit; arming a reply to a DIFFERENT message while one
 * is already armed still re-fires. Guarded to skip the id going back to
 * null/undefined, so dismissing the reply preview never yanks focus into
 * the field the member didn't ask for.
 *
 * M4: `Composer` remounts per thread (`key={active.id}`), so a thread that
 * opens with a reply already armed skips this very first run too, rather
 * than stealing focus the instant the thread opens; only arming a reply
 * AFTER mount moves focus. On iOS Safari a programmatic `focus()` call from
 * inside an effect (as opposed to a direct user gesture) does not raise the
 * on-screen keyboard, so this call still places the caret there for a
 * connected hardware keyboard even though the software one won't follow.
 */
export function useComposerReplyFocus(
  replyDraftId: string | undefined,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
): void {
  const initialReplyDraftIdRef = useRef(replyDraftId);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      if (replyDraftId === initialReplyDraftIdRef.current) return;
    }
    if (!replyDraftId) return;
    textareaRef.current?.focus();
  }, [replyDraftId, textareaRef]);
}
