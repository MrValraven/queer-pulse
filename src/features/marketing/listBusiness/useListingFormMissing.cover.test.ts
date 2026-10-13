import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ANCHOR, type ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { useListingFormMissing } from "./useListingFormMissing";

const ALT_LABEL_KEY = "marketing:listBusiness.missing.alt";
const PHOTOS_STEP = 4;

function photoStepMissing(draft: ListingDraft) {
  const { result } = renderHook(() => useListingFormMissing(draft));
  return result.current[PHOTOS_STEP] ?? [];
}

function claimDraft(fields: Partial<ListingDraft> = {}): ListingDraft {
  return {
    ...blankDraft(),
    path: "claim",
    isWhereFoundAnswered: true,
    ...fields,
  };
}

describe("useListingFormMissing cover alt text", () => {
  it("asks for cover alt text and points at the cover", () => {
    const missing = photoStepMissing(
      claimDraft({
        coverPhoto: { image: "listing-covers/u/k.webp", alt: " " },
      }),
    );
    const altChip = missing.find((field) => field.labelKey === ALT_LABEL_KEY);
    expect(altChip?.anchor).toBe(ANCHOR.cover);
  });

  it("points at the cover even when every gallery photo has alt text", () => {
    const draft = claimDraft({
      coverPhoto: { image: "listing-covers/u/k.webp", alt: "" },
    });
    const missing = photoStepMissing({
      ...draft,
      photos: { ...draft.photos, wide: "listing-photos/u/w.webp" },
      alt: { ...draft.alt, wide: "Front of the shop" },
    });
    const altChips = missing.filter(
      (field) => field.labelKey === ALT_LABEL_KEY,
    );
    expect(altChips).toEqual([
      { labelKey: ALT_LABEL_KEY, anchor: ANCHOR.cover },
    ]);
  });

  it("points the alt chip at the gallery when only a gallery photo lacks alt", () => {
    const draft = claimDraft();
    const missing = photoStepMissing({
      ...draft,
      photos: { ...draft.photos, wide: "listing-photos/u/w.webp" },
      alt: { ...draft.alt, wide: "" },
    });
    const altChip = missing.find((field) => field.labelKey === ALT_LABEL_KEY);
    expect(altChip?.anchor).toBe(ANCHOR.photos);
  });

  it("asks nothing of an empty cover or one with alt text", () => {
    for (const coverPhoto of [
      undefined,
      { image: "", alt: "" },
      { image: "listing-covers/u/k.webp", alt: "Front door" },
    ]) {
      const missing = photoStepMissing(claimDraft({ coverPhoto }));
      expect(missing.some((field) => field.labelKey === ALT_LABEL_KEY)).toBe(
        false,
      );
    }
  });
});
