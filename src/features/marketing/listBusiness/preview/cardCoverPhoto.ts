import type { DirectoryPlace } from "../../directoryPlaces";
import {
  coverPhotoOf,
  PHOTO_KEYS,
  type ListingDraft,
  type PhotoKey,
} from "../listBusiness.data";

/** The listing fields the card's photo is chosen from. */
type CardPhotoSource = Pick<ListingDraft, "coverPhoto" | "photos" | "alt">;

/** An empty string per slot: no previews, or no alt text. */
const EMPTY_SLOT_STRINGS: Record<PhotoKey, string> = {
  wide: "",
  d1: "",
  d2: "",
  vibe: "",
};

const NO_PLACE_PHOTOS: Record<PhotoKey, string | null> = {
  wide: null,
  d1: null,
  d2: null,
  vibe: null,
};

/**
 * The image the directory card shows for this draft, with its alt text: the
 * owner's cover (this session's preview first), else the first gallery photo
 * in slot order (wide, d1, d2, vibe), each slot's preview ahead of its stored
 * value. The backend's `toCoverPhoto` falls back the same way to
 * `photoGallery[0]`. Empty `image` when the listing has no photo at all.
 */
export function cardCoverImage(
  draft: CardPhotoSource,
  coverPreview: string,
  photoPreviews: Record<PhotoKey, string>,
): { image: string; alt: string; isOwnCover: boolean } {
  const coverPhoto = coverPhotoOf(draft);
  const ownCoverImage = coverPreview || coverPhoto.image;
  if (ownCoverImage) {
    return { image: ownCoverImage, alt: coverPhoto.alt, isOwnCover: true };
  }
  for (const photoKey of PHOTO_KEYS) {
    const galleryImage = photoPreviews[photoKey] || draft.photos[photoKey];
    if (galleryImage) {
      return {
        image: galleryImage,
        alt: draft.alt[photoKey],
        isOwnCover: false,
      };
    }
  }
  return { image: "", alt: "", isOwnCover: false };
}

/**
 * The place with the photo its directory card shows put in the `wide` slot
 * the card body reads, chosen by `cardCoverImage`. A listing with no photo at
 * all comes back unchanged, so the card keeps its placeholder. Only the card
 * reads this: the listing's own page keeps `submittedToPlace`'s wide shot.
 *
 * The cover's crop does not reach here. The draft holds the cover as image
 * and alt only, so `photoFocus` stays as the place had it.
 */
export function withCardCover(
  place: DirectoryPlace,
  listing: CardPhotoSource,
  coverPreview = "",
  photoPreviews: Record<PhotoKey, string> = EMPTY_SLOT_STRINGS,
): DirectoryPlace {
  const cardCover = cardCoverImage(listing, coverPreview, photoPreviews);
  if (!cardCover.image) return place;
  return {
    ...place,
    photos: { ...(place.photos ?? NO_PLACE_PHOTOS), wide: cardCover.image },
    alt: { ...(place.alt ?? EMPTY_SLOT_STRINGS), wide: cardCover.alt },
  };
}
