import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { type ListingPhotoFraming } from "./api/directory.api";
import { type DirectoryPlace } from "./directoryPlaces";
import { type PhotoKey } from "./listBusiness/listBusiness.data";

export interface GalleryShot {
  url: string;
  alt: string;
  framing?: ListingPhotoFraming;
  crop?: CropRect;
}

/** Slot order for the four uploadable photo positions. */
const PHOTO_SLOTS: PhotoKey[] = ["wide", "d1", "d2", "vibe"];

/** Longest-edge budget for the hero, and for each thumbnail beside it. */
export const GALLERY_HERO_PX = 1400;
export const GALLERY_THUMB_PX = 500;

/** The gallery shows a hero and three thumbnails. */
const GALLERY_SHOT_LIMIT = 4;

/**
 * The listing's uploaded photos in render order: hero first, then thumbnails.
 * A present `galleryPhotos` (even an empty one) supplies the first four with
 * their framing and crop; a place without it (demo fixtures, older payloads)
 * reads the four legacy slots, dropping the ones the owner never filled. An
 * empty result means "this place has no photos" and the gallery falls back to
 * its caption grid.
 */
export function galleryShotsOf(place: DirectoryPlace): GalleryShot[] {
  if (place.galleryPhotos) {
    return place.galleryPhotos.slice(0, GALLERY_SHOT_LIMIT).map((photo) => ({
      url: photo.url,
      alt: photo.alt,
      ...(photo.framing ? { framing: photo.framing } : {}),
      ...(photo.crop ? { crop: photo.crop } : {}),
    }));
  }
  return PHOTO_SLOTS.map((key) => ({
    url: place.photos?.[key] ?? null,
    alt: place.alt?.[key] ?? "",
  })).flatMap((shot) => (shot.url ? [{ url: shot.url, alt: shot.alt }] : []));
}

/**
 * The exact `src` strings `DirectoryGallery`'s `<img>` tags will carry, in the
 * same order, taken from the same shot list (`galleryPhotos` when present). This lives here, beside the shot list itself, so the detail
 * page's preload gate and the gallery can never drift apart: `resolveAvatarSrc`
 * rewrites the host's size directive, so preloading the raw URL would warm a
 * request nothing on the page ever makes and the gate would measure nothing.
 */
export function galleryImageSources(place: DirectoryPlace): string[] {
  return galleryShotsOf(place).map(
    (shot, index) =>
      resolveAvatarSrc(
        shot.url,
        index === 0 ? GALLERY_HERO_PX : GALLERY_THUMB_PX,
      ) ?? shot.url,
  );
}
