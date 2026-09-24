import { useEffect, useRef, type RefObject } from "react";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Guards the profile editor against losing unsaved changes:
 *  - in-app navigation and hard unload (tab close / refresh) come from the
 *    shared `useUnsavedChangesGuard`, which prompts through the app's leave
 *    dialog,
 *  - restores focus to the Edit CTA when leaving edit mode.
 */
export function useProfileEditGuard({
  isEditing,
  isDirty,
  cancelEditing,
  scrollBeforeEdit,
}: {
  isEditing: boolean;
  isDirty: boolean;
  cancelEditing: () => void;
  /**
   * Window offset captured the moment the member opened the editor (null until
   * they have opened it once in this mount). Leaving edit mode returns them to
   * it, so the page they get back is the page they left.
   */
  scrollBeforeEdit: RefObject<number | null>;
}) {
  const { t } = useTranslation();

  // In-app push/replace while dirty asks through the app's leave dialog and
  // runs `cancelEditing` before navigating on Leave; tab close / refresh gets
  // the browser's own warning. The Back button stays unguarded here.
  useUnsavedChangesGuard({
    active: isEditing && isDirty,
    confirmMessage: t("members:profileEdit.discardConfirm"),
    onConfirmLeave: cancelEditing,
  });

  // Leaving edit mode (save, discard, "Go back") puts the member back exactly
  // where they were standing when they opened the editor, and restores focus to
  // the Edit CTA, which the editable hero unmounting would otherwise drop to
  // <body>.
  //
  // Both halves have to opt out of scrolling on their own terms. A bare
  // `focus()` scrolls the CTA into view itself, and the global
  // `html { scroll-behavior: smooth }` (base.css) animates that as a long glide
  // up the page, so focus is taken with `preventScroll` and the offset is
  // restored explicitly. `behavior: "instant"` rather than "auto", which would
  // defer to that same CSS: the landing has to be immediate.
  //
  // Scrolling the CTA into view instead of restoring the offset is not the same
  // thing and reads worse: it lands with the button jammed against the top of
  // the viewport, half of it under the floating AppNav, on a stretch of the page
  // the member never chose to be looking at.
  const wasEditing = useRef(false);
  useEffect(() => {
    if (wasEditing.current && !isEditing) {
      document.getElementById("profileEditCta")?.focus({ preventScroll: true });
      const offset = scrollBeforeEdit.current;
      if (offset !== null)
        window.scrollTo({ top: offset, behavior: "instant" });
    }
    wasEditing.current = isEditing;
  }, [isEditing, scrollBeforeEdit]);
}
