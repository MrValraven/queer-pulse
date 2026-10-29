import type { ListingPhotoFramingEntry } from "./api/directory.api";
import { galleryShotsOf } from "./directoryGalleryShots";
import type { DirectoryGalleryPhoto, DirectoryPlace } from "./directoryPlaces";
import { isDefaultPhotoFraming } from "./photoFramingGeometry";

/**
 * The place's gallery as a photo list. A present `galleryPhotos` is returned
 * as is; a place without it (demo fixtures, older payloads) materialises its
 * legacy slots, which yields at most the four photos the page shows.
 */
export function galleryPhotosOf(
  place: DirectoryPlace,
): DirectoryGalleryPhoto[] {
  return (
    place.galleryPhotos ??
    galleryShotsOf(place).map(({ url, alt }) => ({ url, alt }))
  );
}

/**
 * The place with the saved framings applied. Every photo whose `url` equals a
 * body `image` takes that framing (a repeated image keeps its copies in
 * step), and a framing equal to the centred default drops the `framing` key,
 * the same rule the server applies. Photos the body leaves out stay as they
 * are.
 */
export function placeWithPhotoFraming(
  place: DirectoryPlace,
  photos: ListingPhotoFramingEntry[],
): DirectoryPlace {
  const framingByImage = new Map(
    photos.map((entry) => [entry.image, entry.framing]),
  );
  const galleryPhotos = galleryPhotosOf(place).map((photo) => {
    const framing = framingByImage.get(photo.url);
    if (!framing) return photo;
    const unframed: DirectoryGalleryPhoto = {
      url: photo.url,
      alt: photo.alt,
      ...(photo.crop ? { crop: photo.crop } : {}),
    };
    return isDefaultPhotoFraming(framing) ? unframed : { ...unframed, framing };
  });
  return { ...place, galleryPhotos };
}
