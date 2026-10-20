import { describe, expect, it } from "vitest";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import {
  hasNewItemImages,
  isItemPhotoBlurred,
  itemCoverUrl,
  itemImageUrls,
  needsConsentNudge,
} from "./tattooItemImages";

type Structured = NonNullable<SubprofileItemView["structured"]>;

function carrier(imageUrl: string, structured: Structured | null = null) {
  return { imageUrl, structured };
}

function bodyItem(
  section: SubprofileItemView["section"],
  imageUrl: string,
  structured: Structured | null,
) {
  return { section, imageUrl, structured };
}

describe("tattooItemImages", () => {
  it("lists imageUrl, the before photo and every session photo in stored order", () => {
    const item = carrier("work-image/u1/after.jpg", {
      coverUp: { type: "cover_up", beforeImageUrl: "work-image/u1/before.jpg" },
      sessions: [
        { imageUrl: "work-image/u1/s1.jpg" },
        { imageUrl: "" },
        { imageUrl: "work-image/u1/s1.jpg" },
      ],
    });
    expect(itemImageUrls(item)).toEqual([
      "work-image/u1/after.jpg",
      "work-image/u1/before.jpg",
      "work-image/u1/s1.jpg",
      "work-image/u1/s1.jpg",
    ]);
  });

  it("reads an empty nested ref as no image", () => {
    expect(
      itemImageUrls(
        carrier("", {
          coverUp: { type: "cover_up", beforeImageUrl: "" },
          sessions: [{ imageUrl: "" }],
        }),
      ),
    ).toEqual([]);
    expect(itemImageUrls(carrier("", null))).toEqual([]);
  });

  it("blurs scar work by default and the other body photos only when asked", () => {
    expect(isItemPhotoBlurred({ section: "scar_work", structured: null })).toBe(
      true,
    );
    expect(
      isItemPhotoBlurred({
        section: "scar_work",
        structured: { photo: { isBlurred: false } },
      }),
    ).toBe(false);
    expect(isItemPhotoBlurred({ section: "healed", structured: null })).toBe(
      false,
    );
    expect(
      isItemPhotoBlurred({
        section: "healed",
        structured: { photo: { isBlurred: true } },
      }),
    ).toBe(true);
    for (const section of ["wanna_dos", "gallery"] as const) {
      expect(
        isItemPhotoBlurred({
          section,
          structured: { photo: { isBlurred: true } },
        }),
      ).toBe(false);
    }
  });

  it("asks consent for a new item with a photo and for a changed photo", () => {
    const withPhoto = carrier("work-image/u1/a.jpg");
    const empty = carrier("");
    expect(hasNewItemImages(withPhoto, empty, true)).toBe(true);
    expect(hasNewItemImages(empty, empty, true)).toBe(false);
    expect(hasNewItemImages(withPhoto, withPhoto, false)).toBe(false);

    const original = carrier("work-image/u1/a.jpg", {
      sessions: [{ imageUrl: "work-image/u1/s1.jpg" }],
    });
    const replaced = carrier("work-image/u1/a.jpg", {
      sessions: [{ imageUrl: "work-image/u1/s2.jpg" }],
    });
    expect(hasNewItemImages(replaced, original, false)).toBe(true);
    const removed = carrier("work-image/u1/a.jpg", { sessions: [] });
    expect(hasNewItemImages(removed, original, false)).toBe(false);
  });

  it("nudges a legacy healed photo without consent", () => {
    expect(
      needsConsentNudge(bodyItem("healed", "work-image/u1/a.jpg", null)),
    ).toBe(true);
    expect(
      needsConsentNudge(
        bodyItem("healed", "work-image/u1/a.jpg", {
          photo: { hasClientConsent: true },
        }),
      ),
    ).toBe(false);
    expect(
      needsConsentNudge(bodyItem("wanna_dos", "work-image/u1/a.jpg", null)),
    ).toBe(false);
    expect(needsConsentNudge(bodyItem("healed", "", null))).toBe(false);
  });

  it("covers a project with its latest session photo", () => {
    const item = carrier("", {
      sessions: [
        { imageUrl: "work-image/u1/s1.jpg" },
        { imageUrl: "work-image/u1/s2.jpg" },
        { imageUrl: "" },
      ],
    });
    expect(itemCoverUrl(item)).toBe("work-image/u1/s2.jpg");
  });
});
