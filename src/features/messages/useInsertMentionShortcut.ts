// src/features/messages/useInsertMentionShortcut.ts
import { useCallback, type RefObject } from "react";
import { saveDraft } from "./drafts";

/**
 * Drops a mention sigil (from the `MentionHintButton` popover) into the
 * composer's draft — split out of `Composer` to keep it under the line cap.
 *
 * Adds a leading space when needed so the sigil sits at a word boundary
 * (where `MentionTextarea`'s own `detectTrigger` fires), persists the result
 * through the same local + server-synced draft paths a keystroke would
 * (`saveDraft` / `scheduleSync`), closes the popover so the screen stays
 * uncluttered, then focuses the input with the caret at the end so typeahead
 * opens as the member keeps typing.
 */
export function useInsertMentionShortcut(
  conversationId: string,
  draft: string,
  setDraft: (value: string) => void,
  scheduleSync: (value: string) => void,
  closePopover: () => void,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
): (sigil: string) => void {
  return useCallback(
    (sigil: string) => {
      const needsSpace = draft.length > 0 && !/\s$/.test(draft);
      const next = `${draft}${needsSpace ? " " : ""}${sigil}`;
      setDraft(next);
      saveDraft(conversationId, next);
      scheduleSync(next);
      closePopover();
      requestAnimationFrame(() => {
        const node = textareaRef.current;
        if (!node) return;
        node.focus();
        node.setSelectionRange(node.value.length, node.value.length);
      });
    },
    [conversationId, draft, setDraft, scheduleSync, closePopover, textareaRef],
  );
}
