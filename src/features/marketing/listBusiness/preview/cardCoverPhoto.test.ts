import { describe, expect, it } from "vitest";
import type { DirectoryPlace } from "../../directoryPlaces";
import { cardCoverImage, withCardCover } from "./cardCoverPhoto";

const emptySlots = { wide: "", d1: "", d2: "", vibe: "" };
const galleryAlt = {
  wide: "Bar front",
  d1: "Back room",
  d2: "Terrace",
  vibe: "Dance floor",
};

describe("cardCoverImage", () => {
  it("uses the cover preview, then the stored cover", () => {
    const draft = {
      coverPhoto: { image: "listing-covers/u/k.webp", alt: "Door" },
      photos: { ...emptySlots, wide: "w" },
      alt: galleryAlt,
    };
    expect(cardCoverImage(draft, "blob:cover", emptySlots)).toEqual({
      image: "blob:cover",
      alt: "Door",
      isOwnCover: true,
    });
    expect(cardCoverImage(draft, "", emptySlots).image).toBe(
      "listing-covers/u/k.webp",
    );
  });

  it("falls back to the wide shot once the cover is removed", () => {
    const draft = {
      coverPhoto: { image: "", alt: "" },
      photos: { ...emptySlots, wide: "w" },
      alt: galleryAlt,
    };
    expect(
      cardCoverImage(draft, "", { ...emptySlots, wide: "blob:wide" }),
    ).toEqual({
      image: "blob:wide",
      alt: "Bar front",
      isOwnCover: false,
    });
  });

  it("falls back to d1 with its alt when the wide slot is empty", () => {
    const draft = {
      photos: { ...emptySlots, d1: "d1-stored", d2: "d2-stored" },
      alt: galleryAlt,
    };
    expect(cardCoverImage(draft, "", emptySlots)).toEqual({
      image: "d1-stored",
      alt: "Back room",
      isOwnCover: false,
    });
    expect(
      cardCoverImage(draft, "", { ...emptySlots, d1: "blob:d1" }).image,
    ).toBe("blob:d1");
  });

  it("is empty with neither", () => {
    expect(
      cardCoverImage({ photos: emptySlots, alt: emptySlots }, "", emptySlots),
    ).toEqual({ image: "", alt: "", isOwnCover: false });
  });
});

describe("withCardCover", () => {
  const place = {
    name: "Spot",
    photos: { wide: "wide-stored", d1: "d1-stored", d2: null, vibe: null },
    alt: galleryAlt,
  } as DirectoryPlace;

  it("puts the stored cover and its alt in the wide slot", () => {
    const listing = {
      coverPhoto: { image: "cover-stored", alt: "Door" },
      photos: { ...emptySlots, wide: "wide-stored", d1: "d1-stored" },
      alt: galleryAlt,
    };
    const cardPlace = withCardCover(place, listing);
    expect(cardPlace.photos).toEqual({
      wide: "cover-stored",
      d1: "d1-stored",
      d2: null,
      vibe: null,
    });
    expect(cardPlace.alt?.wide).toBe("Door");
    expect(cardPlace.alt?.d1).toBe("Back room");
  });

  it("uses this session's cover upload ahead of the stored cover", () => {
    const listing = {
      coverPhoto: { image: "cover-stored", alt: "Door" },
      photos: emptySlots,
      alt: galleryAlt,
    };
    expect(withCardCover(place, listing, "blob:cover").photos?.wide).toBe(
      "blob:cover",
    );
  });

  it("fills the wide slot from d1 when the listing has no cover or wide shot", () => {
    const placeWithoutWide = {
      name: "Spot",
      photos: { wide: null, d1: "d1-stored", d2: null, vibe: null },
      alt: galleryAlt,
    } as DirectoryPlace;
    const listing = {
      coverPhoto: { image: "", alt: "" },
      photos: { ...emptySlots, d1: "d1-stored" },
      alt: galleryAlt,
    };
    const cardPlace = withCardCover(placeWithoutWide, listing);
    expect(cardPlace.photos?.wide).toBe("d1-stored");
    expect(cardPlace.alt?.wide).toBe("Back room");
  });

  it("returns the same place when the listing has no photo at all", () => {
    const photolessPlace = {
      name: "Spot",
      photos: { wide: null, d1: null, d2: null, vibe: null },
      alt: emptySlots,
    } as DirectoryPlace;
    expect(
      withCardCover(photolessPlace, { photos: emptySlots, alt: emptySlots }),
    ).toBe(photolessPlace);
  });

  it("fills the photo records when the place carries none", () => {
    const listing = {
      coverPhoto: { image: "cover-stored", alt: "Door" },
      photos: emptySlots,
      alt: emptySlots,
    };
    const cardPlace = withCardCover(
      { name: "Spot" } as DirectoryPlace,
      listing,
    );
    expect(cardPlace.photos).toEqual({
      wide: "cover-stored",
      d1: null,
      d2: null,
      vibe: null,
    });
    expect(cardPlace.alt).toEqual({ ...emptySlots, wide: "Door" });
  });
});
