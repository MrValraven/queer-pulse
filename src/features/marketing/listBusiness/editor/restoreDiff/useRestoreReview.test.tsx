import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import type { ListingDraft, PhotoKey } from "../../listBusiness.data";
import { blankDraft } from "../../listingFormDraft";
import type { ListingForm } from "../../useListingForm";
import { LISTING_EDITOR_SECTIONS } from "../listingEditor.data";
import type { ListingEditorAutosave } from "../useListingEditorAutosave";
import { mergeRestoredAreas } from "./restoreDiff.data";
import type { RestoreAreaKey } from "./restoreDiff.types";
import { useRestoreReview } from "./useRestoreReview";

/**
 * The hook's confirm path, driven through the real modal: what it hands the
 * form and the autosave, and that a partial restore gives back the photo
 * preview and rejected flag of a slot it left alone (`form.reset` clears
 * both, and in live mode the slot then holds an undisplayable storage key).
 * The form and autosave are fakes, so each call can be read back.
 */

const PREVIEW_URL = "blob:uploaded-this-session";
const OPEN_LABEL = "Open review";

/** On screen: a photo uploaded this session (a storage key plus its blob
 *  preview, and flagged by the server). Saved: a different name and a
 *  different photo, so both Basics and Photos differ. */
function drafts(): { current: ListingDraft; saved: ListingDraft } {
  const current: ListingDraft = {
    ...blankDraft(),
    name: "Casa Bica",
    photos: { wide: "uploads/new-key", d1: "", d2: "", vibe: "" },
  };
  const saved: ListingDraft = {
    ...blankDraft(),
    name: "Casa Rosa",
    photos: { wide: "https://example.org/old.jpg", d1: "", d2: "", vibe: "" },
  };
  return { current, saved };
}

function fakes() {
  const { current, saved } = drafts();
  const form = {
    draft: current,
    photoPreviews: { wide: PREVIEW_URL, d1: "", d2: "", vibe: "" },
    rejectedPhotoSlots: ["wide"] as PhotoKey[],
    reset: vi.fn<(next?: ListingDraft) => void>(),
    setPhotoPreview: vi.fn(),
    setRejectedPhotoSlots: vi.fn(),
  };
  const autosave: ListingEditorAutosave = {
    restorable: { draft: saved, savedAt: Date.now(), hasServerChanged: false },
    dismissRestorable: vi.fn(),
    discardRestorable: vi.fn(),
    clearAutosave: vi.fn(),
  };
  return { form, autosave, current, saved };
}

function Harness({
  form,
  autosave,
}: {
  form: ReturnType<typeof fakes>["form"];
  autosave: ListingEditorAutosave;
}) {
  const review = useRestoreReview({
    form: form as unknown as ListingForm,
    autosave,
    sections: LISTING_EDITOR_SECTIONS,
    prefersReducedMotion: true,
  });
  // Stands in for the banner's "Bring them back".
  return (
    <>
      <button type="button" onClick={review.open}>
        {OPEN_LABEL}
      </button>
      {review.modal}
    </>
  );
}

function renderHarness() {
  const setup = fakes();
  render(
    <TestProviders>
      <Harness form={setup.form} autosave={setup.autosave} />
    </TestProviders>,
  );
  fireEvent.click(screen.getByRole("button", { name: OPEN_LABEL }));
  return setup;
}

describe("useRestoreReview", () => {
  it("resets to the merged draft and dismisses the offer on confirm", async () => {
    const { form, autosave, current, saved } = renderHarness();
    fireEvent.click(
      await screen.findByRole("button", { name: "Bring them all back" }),
    );

    const everyArea = new Set<RestoreAreaKey>(["basics", "photos"]);
    expect(form.reset).toHaveBeenCalledTimes(1);
    expect(form.reset).toHaveBeenCalledWith(
      mergeRestoredAreas({ current, saved, areaKeys: everyArea }),
    );
    expect(autosave.dismissRestorable).toHaveBeenCalledTimes(1);
    // The restored slot takes the saved photo, so its preview stays cleared.
    expect(form.setPhotoPreview).not.toHaveBeenCalled();
    expect(form.setRejectedPhotoSlots).toHaveBeenCalledWith([]);
  });

  it("keeps a left-out slot's preview and rejected flag", async () => {
    const { form, autosave } = renderHarness();
    fireEvent.click(await screen.findByRole("checkbox", { name: /^Photos/ }));
    fireEvent.click(screen.getByRole("button", { name: "Bring back 1 area" }));

    const merged = form.reset.mock.calls[0]?.[0];
    expect(merged?.name).toBe("Casa Rosa");
    expect(merged?.photos.wide).toBe("uploads/new-key");
    expect(form.setPhotoPreview).toHaveBeenCalledWith("wide", PREVIEW_URL);
    expect(form.setRejectedPhotoSlots).toHaveBeenCalledWith(["wide"]);
    // Both land after the reset, so the reset cannot wipe them again.
    const resetOrder = form.reset.mock.invocationCallOrder[0] ?? 0;
    const previewOrder = form.setPhotoPreview.mock.invocationCallOrder[0] ?? -1;
    expect(previewOrder).toBeGreaterThan(resetOrder);
    expect(autosave.dismissRestorable).toHaveBeenCalledTimes(1);
  });
});
