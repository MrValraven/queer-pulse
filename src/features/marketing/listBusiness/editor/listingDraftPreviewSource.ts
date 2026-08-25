import type { ListingPreviewSource } from "../../../admin/api/listingPreviewPlace";
import {
  PHOTO_KEYS,
  slugify,
  type ListingDraft,
  type PhotoKey,
} from "../listBusiness.data";

/**
 * Dress an UNSAVED editor draft as the shape `listingDtoToPreviewPlace` maps,
 * so the owner previews the real detail page built from what is on screen
 * right now, edits included, before committing any of it.
 *
 * `photoPreviews` (the just-uploaded blob URL) wins over the persisted
 * `draft.photos` value, mirroring the display convention every other preview
 * in this flow uses. An empty slot becomes `null`, which is what the backend
 * response emits and what the gallery treats as "no photo here".
 */
export function listingDraftToPreviewSource(
  draft: ListingDraft,
  slug: string,
  photoPreviews: Record<PhotoKey, string>,
): ListingPreviewSource {
  const photos = PHOTO_KEYS.reduce(
    (accumulator, photoKey) => {
      accumulator[photoKey] =
        photoPreviews[photoKey] || draft.photos[photoKey] || null;
      return accumulator;
    },
    {} as Record<PhotoKey, string | null>,
  );

  return {
    ...draft,
    slug: slug || slugify(draft.name),
    photos,
  };
}
