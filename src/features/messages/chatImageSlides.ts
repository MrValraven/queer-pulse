import type { ViewerPhoto } from "./useThreadImageGallery";

/**
 * Which slides the viewer's swipe track holds. Pure, so the wrap-around and
 * the two-photo case can be reasoned about (and tested) without a DOM.
 */

/** Where a slide sits on the track relative to the screen. */
export type SlideRole = "prev" | "current" | "next";

export interface SlideSpec {
  /** React key. Stays with the PHOTO and ignores the position, which is the
   *  whole point: when the gallery moves one photo along, the slide that sat beside
   *  the screen is the same DOM node as the one that is now in the middle, so
   *  its `<img>` is already loaded and decoded and nothing flashes. */
  key: string;
  role: SlideRole;
  photo: ViewerPhoto;
}

/**
 * The photos beside the one on screen, following the same wrap-around as
 * `useViewerPhotoCursor.move` (modulo, so the last photo's next is the first).
 * A single-photo gallery has no neighbours. With two photos both neighbours
 * are the other photo, which is correct: a swipe either way lands on it.
 */
export function neighbourPhotos(
  photos: ViewerPhoto[],
  index: number,
): { prevPhoto: ViewerPhoto | null; nextPhoto: ViewerPhoto | null } {
  const count = photos.length;
  if (count < 2 || index < 0) return { prevPhoto: null, nextPhoto: null };
  return {
    prevPhoto: photos[(index - 1 + count) % count] ?? null,
    nextPhoto: photos[(index + 1) % count] ?? null,
  };
}

/** The slides in track order: previous, current, next, each keyed by its
 *  photo. In a two-photo gallery the previous and next slides show the same
 *  photo, so the previous one takes a prefixed key to keep keys unique. */
export function slidesFor(
  prevPhoto: ViewerPhoto | null,
  photo: ViewerPhoto,
  nextPhoto: ViewerPhoto | null,
): SlideSpec[] {
  const slides: SlideSpec[] = [];
  if (prevPhoto) {
    const isDuplicate =
      prevPhoto.key === photo.key || prevPhoto.key === nextPhoto?.key;
    slides.push({
      key: isDuplicate ? `prev:${prevPhoto.key}` : prevPhoto.key,
      role: "prev",
      photo: prevPhoto,
    });
  }
  slides.push({ key: photo.key, role: "current", photo });
  if (nextPhoto) {
    slides.push({
      key:
        nextPhoto.key === photo.key ? `next:${nextPhoto.key}` : nextPhoto.key,
      role: "next",
      photo: nextPhoto,
    });
  }
  return slides;
}
