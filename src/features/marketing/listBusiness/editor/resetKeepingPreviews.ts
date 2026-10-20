import {
  coverPhotoOf,
  PHOTO_KEYS,
  type ListingDraft,
} from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";

/** The parts of the form a whole-draft replace reads and writes. */
export type PreviewKeepingForm = Pick<
  ListingForm,
  | "draft"
  | "photoPreviews"
  | "coverPreview"
  | "rejectedPhotoSlots"
  | "reset"
  | "setPhotoPreview"
  | "setCoverPreview"
  | "setRejectedPhotoSlots"
>;

/**
 * Puts a whole draft into the form and keeps what this session knows about
 * the photos the new draft still holds. `form.reset` clears every photo
 * preview and every server-rejected slot, and a photo picked this session is
 * shown from its preview (in live mode the slot holds a storage key that
 * cannot display). So a gallery slot or the cover whose photo stays the same
 * gets its preview and its rejected flag back.
 *
 * Shop item previews are keyed by client-only row ids, which differ between
 * tabs, so a draft from elsewhere never matches them and they stay cleared.
 */
export function resetKeepingPreviews(
  form: PreviewKeepingForm,
  nextDraft: ListingDraft,
): void {
  const { draft, photoPreviews, coverPreview, rejectedPhotoSlots } = form;
  const keptPhotoSlots = PHOTO_KEYS.filter(
    (slot) => nextDraft.photos[slot] === draft.photos[slot],
  );
  const isCoverKept =
    coverPhotoOf(nextDraft).image === coverPhotoOf(draft).image;
  form.reset(nextDraft);
  // Queued after the reset's own updates, so these land on top of it.
  for (const slot of keptPhotoSlots) {
    const preview = photoPreviews[slot];
    if (preview) form.setPhotoPreview(slot, preview);
  }
  if (isCoverKept && coverPreview) form.setCoverPreview(coverPreview);
  form.setRejectedPhotoSlots(
    rejectedPhotoSlots.filter((slot) =>
      slot === "cover" ? isCoverKept : keptPhotoSlots.includes(slot),
    ),
  );
}
