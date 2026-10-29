import { describe, expect, it } from "vitest";
import { galleryShotsOf } from "./directoryGalleryShots";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import {
  galleryPhotosOf,
  placeWithPhotoFraming,
} from "./listingPhotoFramingCache";
import { DEFAULT_PHOTO_FRAMING } from "./photoFramingGeometry";

const framing = { focusX: 0.2, focusY: 0.7, zoom: 1.5 };
const basePlace: DirectoryPlace = DIRECTORY_PLACES[0]!;

const placeWithGallery = (
  galleryPhotos: NonNullable<DirectoryPlace["galleryPhotos"]>,
): DirectoryPlace => ({ ...basePlace, galleryPhotos });

describe("galleryPhotosOf", () => {
  it("materialises the legacy slots when galleryPhotos is absent", () => {
    const legacyPlace: DirectoryPlace = {
      ...basePlace,
      galleryPhotos: undefined,
      photos: { wide: "w", d1: null, d2: "d2", vibe: null },
      alt: { wide: "Wide", d1: "", d2: "Two", vibe: "" },
    };
    expect(galleryPhotosOf(legacyPlace)).toEqual(
      galleryShotsOf(legacyPlace).map(({ url, alt }) => ({ url, alt })),
    );
  });

  it("returns a present galleryPhotos as it is", () => {
    const place = placeWithGallery([{ url: "u1", alt: "One" }]);
    expect(galleryPhotosOf(place)).toBe(place.galleryPhotos);
  });
});

describe("placeWithPhotoFraming", () => {
  it("applies framing to every copy of a repeated image", () => {
    const place = placeWithGallery([
      { url: "u1", alt: "" },
      { url: "u2", alt: "" },
      { url: "u1", alt: "" },
    ]);
    const patched = placeWithPhotoFraming(place, [{ image: "u1", framing }]);
    expect(patched.galleryPhotos!.map((photo) => photo.framing)).toEqual([
      framing,
      undefined,
      framing,
    ]);
  });

  it("drops the framing key when the saved framing is the centred default", () => {
    const framedPlace = placeWithGallery([{ url: "u1", alt: "", framing }]);
    const patched = placeWithPhotoFraming(framedPlace, [
      { image: "u1", framing: DEFAULT_PHOTO_FRAMING },
    ]);
    expect("framing" in patched.galleryPhotos![0]!).toBe(false);
  });

  it("leaves photos the body leaves out untouched", () => {
    const place = placeWithGallery([
      { url: "u1", alt: "", framing },
      { url: "u2", alt: "Two" },
    ]);
    const patched = placeWithPhotoFraming(place, [
      { image: "u2", framing: { focusX: 0.1, focusY: 0.9, zoom: 2 } },
    ]);
    expect(patched.galleryPhotos![0]).toBe(place.galleryPhotos![0]);
  });

  it("keeps the crop of a photo it reframes", () => {
    const crop = {
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5,
      aspect: "free" as const,
    };
    const place = placeWithGallery([{ url: "u1", alt: "", crop }]);
    const patched = placeWithPhotoFraming(place, [{ image: "u1", framing }]);
    expect(patched.galleryPhotos![0]).toEqual({
      url: "u1",
      alt: "",
      crop,
      framing,
    });
  });
});
