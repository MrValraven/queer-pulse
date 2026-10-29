import { describe, expect, it } from "vitest";
import type { Formatters } from "../../../shared/i18n/format";
import type {
  DirectoryDetailDTO,
  ListingGalleryPhotoView,
} from "./directory.api";
import { detailDtoToPlace } from "./directory.adapters";

const fmt = {
  date: () => "Sat 17 Oct",
  time: () => "10:00",
} as unknown as Formatters;

function placeWithGallery(photoGallery?: ListingGalleryPhotoView[]) {
  const detail = {
    slug: "bar-aurora",
    upcoming: [],
    reviews: [],
    ...(photoGallery ? { photoGallery } : {}),
  } as unknown as DirectoryDetailDTO;
  return detailDtoToPlace(detail, fmt);
}

describe("detailDtoToPlace gallery photos", () => {
  it("maps photoGallery to galleryPhotos in order and drops entries without an image", () => {
    const place = placeWithGallery([
      { image: "/files/a.jpg", alt: "Bar", caption: "" },
      { image: null, alt: "", caption: "" },
      { image: "https://x/b.jpg", alt: "", caption: "Hi" },
    ]);
    expect(place.galleryPhotos).toEqual([
      { url: "/files/a.jpg", alt: "Bar" },
      { url: "https://x/b.jpg", alt: "" },
    ]);
    expect("framing" in place.galleryPhotos![0]!).toBe(false);
    expect("crop" in place.galleryPhotos![0]!).toBe(false);
  });

  it("carries framing and crop through when the view has them", () => {
    const framing = { focusX: 0.2, focusY: 0.7, zoom: 1.5 };
    const crop = {
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5,
      aspect: "free" as const,
    };
    const place = placeWithGallery([
      { image: "/files/a.jpg", alt: "Bar", caption: "", framing, crop },
    ]);
    expect(place.galleryPhotos?.[0]).toEqual({
      url: "/files/a.jpg",
      alt: "Bar",
      framing,
      crop,
    });
  });

  it("leaves galleryPhotos undefined when the payload has no photoGallery", () => {
    const place = placeWithGallery();
    expect(place.galleryPhotos).toBeUndefined();
    expect("galleryPhotos" in place).toBe(false);
  });
});
