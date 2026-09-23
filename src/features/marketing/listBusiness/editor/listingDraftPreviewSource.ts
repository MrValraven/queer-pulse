import type { ListingPreviewSource } from "../../../admin/api/listingPreviewPlace";
import { API_BASE_URL } from "../../../../shared/api/config";
import {
  PHOTO_KEYS,
  slugify,
  type ListingDraft,
  type PhotoKey,
} from "../listBusiness.data";

/**
 * A menu file uploaded THIS session holds a bare storage key (e.g.
 * `listing-menus/…`), the same shape a live-mode upload always resolves to
 * (see `useUploadListingMenuFile`): not a fetchable URL on its own, only
 * `GET /files/<key>` resolves it. Left alone otherwise: a demo-mode upload's
 * `blob:` object URL, and an already-saved listing's served `http(s):` URL,
 * are both already renderable as-is.
 */
function resolveMenuFileUrl(url: string): string {
  return /^(blob:|https?:\/\/)/.test(url)
    ? url
    : `${API_BASE_URL}/files/${url}`;
}

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

  const menu = draft.menu
    ? {
        ...draft.menu,
        file: draft.menu.file
          ? { ...draft.menu.file, url: resolveMenuFileUrl(draft.menu.file.url) }
          : null,
      }
    : draft.menu;

  return {
    ...draft,
    slug: slug || slugify(draft.name),
    photos,
    menu,
  };
}
