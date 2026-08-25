import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { type DirectoryPlace } from "./directoryPlaces";
import { type PhotoKey } from "./listBusiness/listBusiness.data";

export interface GalleryShot {
  url: string;
  alt: string;
}

/** Slot order for the four uploadable photo positions. */
const PHOTO_SLOTS: PhotoKey[] = ["wide", "d1", "d2", "vibe"];

/** Longest-edge budget for the hero, and for each thumbnail beside it. */
export const GALLERY_HERO_PX = 1400;
export const GALLERY_THUMB_PX = 500;

/**
 * The listing's uploaded photos in render order — hero first, then thumbnails.
 * Slots the owner never filled are dropped, so an empty result means "this
 * place has no photos" and the gallery falls back to its caption grid.
 */
export function galleryShotsOf(place: DirectoryPlace): GalleryShot[] {
  return PHOTO_SLOTS.map((key) => ({
    url: place.photos?.[key] ?? null,
    alt: place.alt?.[key] ?? "",
  })).flatMap((shot) => (shot.url ? [{ url: shot.url, alt: shot.alt }] : []));
}

/**
 * The exact `src` strings `DirectoryGallery`'s `<img>` tags will carry, in the
 * same order. This lives here, beside the shot list itself, so the detail
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
