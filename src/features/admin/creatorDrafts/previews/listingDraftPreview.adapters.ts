import type {
  ListingDraft,
  PhotoKey,
} from "../../../marketing/listBusiness/listBusiness.data";
import { PHOTO_KEYS } from "../../../marketing/listBusiness/listBusiness.data";
import type { ListingShopItemPhoto } from "../../../marketing/listBusiness/listingShop.data";
import type { ListingDraftPreview } from "../../api/adminCreatorDrafts.api";

/** The draft fields a staff preview carries. `photos` holds only the slots
 *  the server sent, so the caller lays them over a blank draft's. */
export type ListingDraftPreviewFields = Omit<
  Partial<ListingDraft>,
  "photos"
> & {
  photos?: Partial<Record<PhotoKey, string>>;
};

function photosOf(
  photos: Partial<Record<PhotoKey, string | null>>,
): Partial<Record<PhotoKey, string>> {
  const filled: Partial<Record<PhotoKey, string>> = {};
  for (const photoKey of PHOTO_KEYS) {
    if (!(photoKey in photos)) continue;
    filled[photoKey] = photos[photoKey] ?? "";
  }
  return filled;
}

/** A photo the server could not resolve is the editor's "no photo". */
function shopItemPhotoOf(
  photo: { image: string | null; alt: string; caption: string } | null,
): ListingShopItemPhoto | null {
  if (!photo || photo.image === null) return null;
  return { image: photo.image, alt: photo.alt, caption: photo.caption };
}

/** Turns every null image of a staff preview back into the "" the wizard stores. */
export function listingDraftPreviewToDraft(
  preview: ListingDraftPreview,
): ListingDraftPreviewFields {
  const { photos, coverPhoto, shopItems, menu, ...rest } = preview;
  return {
    ...rest,
    ...(photos ? { photos: photosOf(photos) } : {}),
    ...(coverPhoto
      ? { coverPhoto: { image: coverPhoto.image ?? "", alt: coverPhoto.alt } }
      : {}),
    ...(shopItems
      ? {
          shopItems: shopItems.map((item) => ({
            ...item,
            photo: shopItemPhotoOf(item.photo),
          })),
        }
      : {}),
    ...(menu ? { menu } : {}),
  };
}
