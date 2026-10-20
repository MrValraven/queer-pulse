import { describe, expect, it, vi } from "vitest";
import type { ListingDraft, RejectedPhotoSlot } from "../listBusiness.data";
import { blankDraft } from "../listingFormDraft";
import {
  resetKeepingPreviews,
  type PreviewKeepingForm,
} from "./resetKeepingPreviews";

const WIDE_PREVIEW = "blob:wide-uploaded-this-session";
const D1_PREVIEW = "blob:d1-uploaded-this-session";
const COVER_PREVIEW = "blob:cover-uploaded-this-session";

/** On screen: wide and d1 uploaded this session, a cover too, all flagged. */
function fakeForm(): PreviewKeepingForm {
  const draft: ListingDraft = {
    ...blankDraft(),
    name: "Casa Bica",
    photos: {
      wide: "uploads/wide-key",
      d1: "uploads/d1-key",
      d2: "",
      vibe: "",
    },
    coverPhoto: { image: "listing-covers/cover-key", alt: "The door" },
  };
  const rejectedPhotoSlots: RejectedPhotoSlot[] = ["wide", "d1", "cover"];
  return {
    draft,
    photoPreviews: { wide: WIDE_PREVIEW, d1: D1_PREVIEW, d2: "", vibe: "" },
    coverPreview: COVER_PREVIEW,
    rejectedPhotoSlots,
    reset: vi.fn(),
    setPhotoPreview: vi.fn(),
    setCoverPreview: vi.fn(),
    setRejectedPhotoSlots: vi.fn(),
  };
}

describe("resetKeepingPreviews", () => {
  it("puts the draft in and gives back previews for the photos it keeps", () => {
    const form = fakeForm();
    const nextDraft: ListingDraft = {
      ...form.draft,
      name: "Casa Rosa",
      photos: { ...form.draft.photos, d1: "https://example.org/other.jpg" },
    };
    resetKeepingPreviews(form, nextDraft);
    expect(form.reset).toHaveBeenCalledWith(nextDraft);
    expect(form.setPhotoPreview).toHaveBeenCalledTimes(1);
    expect(form.setPhotoPreview).toHaveBeenCalledWith("wide", WIDE_PREVIEW);
    expect(form.setCoverPreview).toHaveBeenCalledWith(COVER_PREVIEW);
    expect(form.setRejectedPhotoSlots).toHaveBeenCalledWith(["wide", "cover"]);
  });

  it("leaves the cover preview and flag cleared when the cover changes", () => {
    const form = fakeForm();
    const nextDraft: ListingDraft = {
      ...form.draft,
      coverPhoto: { image: "https://example.org/new-cover.jpg", alt: "" },
    };
    resetKeepingPreviews(form, nextDraft);
    expect(form.setCoverPreview).not.toHaveBeenCalled();
    expect(form.setRejectedPhotoSlots).toHaveBeenCalledWith(["wide", "d1"]);
  });
});
