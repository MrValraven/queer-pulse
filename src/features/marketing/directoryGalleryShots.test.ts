import { describe, expect, it } from "vitest";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import {
  GALLERY_HERO_PX,
  GALLERY_THUMB_PX,
  galleryImageSources,
  galleryShotsOf,
} from "./directoryGalleryShots";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";

const framing = { focusX: 0.2, focusY: 0.7, zoom: 1.5 };
const crop = { x: 0, y: 0, width: 0.5, height: 0.5, aspect: "free" as const };
const basePlace: DirectoryPlace = DIRECTORY_PLACES[0]!;

describe("galleryShotsOf", () => {
  it("reads the first four galleryPhotos in order with their framing and crop", () => {
    const place: DirectoryPlace = {
      ...basePlace,
      galleryPhotos: [
        { url: "u1", alt: "" },
        { url: "u2", alt: "Two", framing, crop },
        { url: "u3", alt: "" },
        { url: "u4", alt: "" },
        { url: "u5", alt: "" },
      ],
    };
    const shots = galleryShotsOf(place);
    expect(shots.map((shot) => shot.url)).toEqual(["u1", "u2", "u3", "u4"]);
    expect(shots[1]!.framing).toEqual(framing);
    expect(shots[1]!.crop).toEqual(crop);
    expect("framing" in shots[0]!).toBe(false);
  });

  it("falls back to the legacy photo slots when galleryPhotos is absent", () => {
    const place: DirectoryPlace = {
      ...basePlace,
      galleryPhotos: undefined,
      photos: { wide: "w", d1: null, d2: "d2", vibe: null },
      alt: { wide: "Wide", d1: "", d2: "", vibe: "" },
    };
    expect(galleryShotsOf(place)).toEqual([
      { url: "w", alt: "Wide" },
      { url: "d2", alt: "" },
    ]);
  });

  it("returns zero shots for an empty galleryPhotos even when legacy slots are filled", () => {
    const place: DirectoryPlace = {
      ...basePlace,
      photos: { wide: "w", d1: "d1", d2: null, vibe: null },
      galleryPhotos: [],
    };
    expect(galleryShotsOf(place)).toEqual([]);
  });

  it("keeps galleryImageSources in step with galleryPhotos at hero and thumb sizes", () => {
    const place: DirectoryPlace = {
      ...basePlace,
      galleryPhotos: [
        { url: "/files/a.jpg", alt: "" },
        { url: "/files/b.jpg", alt: "" },
      ],
    };
    expect(galleryImageSources(place)).toEqual(
      galleryShotsOf(place).map(
        (shot, index) =>
          resolveAvatarSrc(
            shot.url,
            index === 0 ? GALLERY_HERO_PX : GALLERY_THUMB_PX,
          ) ?? shot.url,
      ),
    );
  });
});
