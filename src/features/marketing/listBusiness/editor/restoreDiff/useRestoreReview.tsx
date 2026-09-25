import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { PHOTO_KEYS } from "../../listBusiness.data";
import type { ListingForm } from "../../useListingForm";
import { jumpToEditorSection } from "../jumpToEditorSection";
import type { ListingEditorSectionDefinition } from "../listingEditor.data";
import type { ListingEditorAutosave } from "../useListingEditorAutosave";
import { ListingRestoreReviewModal } from "./ListingRestoreReviewModal";
import { buildRestoreDiff, mergeRestoredAreas } from "./restoreDiff.data";
import type { RestoreAreaKey } from "./restoreDiff.types";

/**
 * The restore banner's "Bring them back", as a review before anything moves.
 *
 * Its own hook so `ListingEditor` stays about the form and the save: the
 * editor gets `open` for the banner and `modal` to render, and nothing else.
 *
 * The diff is computed only while the review is open. It reads the whole
 * draft twice over, and there is no reason to pay for that on every keystroke
 * of an editor session that never opens it.
 *
 * Confirming lands the owner on the first area that came back. The banner
 * and its button unmount the moment the offer is dismissed, so the dialog's
 * own focus return would find nothing and drop the keyboard on `<body>`. The
 * jump waits until the dialog has gone, because the dialog's scroll lock
 * pins the page and restores its old offset on release, which would undo a
 * scroll made while it was still up.
 *
 * `form.reset` also clears every photo preview and every server-rejected
 * slot, which is right for a whole-draft replace and wrong for a partial
 * one: a slot the merge left alone still holds this session's upload as a
 * storage key, which only its preview can display. Those slots get their
 * preview and rejected flag back straight after the reset.
 */
export function useRestoreReview({
  form,
  autosave,
  sections,
  prefersReducedMotion,
}: {
  form: ListingForm;
  autosave: ListingEditorAutosave;
  /** The editor's own role- and menu-aware section list. */
  sections: ListingEditorSectionDefinition[];
  prefersReducedMotion: boolean;
}): { open: () => void; modal: ReactNode } {
  const { t } = useTranslation();
  const { restorable } = autosave;
  const { draft } = form;
  const [isOpen, setIsOpen] = useState(false);
  const pendingJumpSectionIdRef = useRef<string | null>(null);

  // The offer can vanish while the review is up (the member scope changed).
  // Close with it, so a later offer never reopens the review unasked.
  if (isOpen && !restorable) setIsOpen(false);

  const areas = useMemo(
    () =>
      isOpen && restorable
        ? buildRestoreDiff({
            current: draft,
            saved: restorable.draft,
            sections,
            t,
            photoPreviews: form.photoPreviews,
          })
        : [],
    [isOpen, restorable, draft, sections, t, form.photoPreviews],
  );

  useEffect(() => {
    if (isOpen) return;
    const sectionId = pendingJumpSectionIdRef.current;
    if (!sectionId) return;
    pendingJumpSectionIdRef.current = null;
    jumpToEditorSection(sectionId, prefersReducedMotion);
  }, [isOpen, prefersReducedMotion]);

  const open = () => {
    if (restorable) setIsOpen(true);
  };

  const confirm = (areaKeys: ReadonlySet<RestoreAreaKey>) => {
    if (!restorable) return;
    const merged = mergeRestoredAreas({
      current: draft,
      saved: restorable.draft,
      areaKeys,
    });
    const keptPhotoSlots = PHOTO_KEYS.filter(
      (slot) => merged.photos[slot] === draft.photos[slot],
    );
    const { photoPreviews, rejectedPhotoSlots } = form;
    form.reset(merged);
    // Queued after the reset's own updates, so these land on top of it.
    for (const slot of keptPhotoSlots) {
      const preview = photoPreviews[slot];
      if (preview) form.setPhotoPreview(slot, preview);
    }
    form.setRejectedPhotoSlots(
      rejectedPhotoSlots.filter((slot) => keptPhotoSlots.includes(slot)),
    );
    autosave.dismissRestorable();
    const firstRestoredArea = areas.find((area) => areaKeys.has(area.key));
    const firstRestoredSection = sections.find(
      (section) => section.key === firstRestoredArea?.key,
    );
    pendingJumpSectionIdRef.current = firstRestoredSection?.id ?? null;
    setIsOpen(false);
  };

  // The banner goes with the discarded copy, so focus has the same nowhere to
  // return to as after a confirm: land it on the first section instead.
  const discard = () => {
    autosave.discardRestorable();
    pendingJumpSectionIdRef.current = sections[0]?.id ?? null;
    setIsOpen(false);
  };

  const modal =
    isOpen && restorable ? (
      <ListingRestoreReviewModal
        areas={areas}
        restorable={restorable}
        onConfirm={confirm}
        onDiscard={discard}
        onClose={() => setIsOpen(false)}
      />
    ) : null;

  return { open, modal };
}
