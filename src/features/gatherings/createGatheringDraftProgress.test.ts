import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EVENT_DRAFT_CHAPTER_IDS,
  eventDraftProgress,
  isEventDraftMadeFor,
} from "./createGatheringDraftProgress";
import { useGatheringForm, type GatheringForm } from "./useGatheringForm";

/** A real empty wizard form with a few fields laid over it. */
function formWith(overrides: Partial<GatheringForm>): GatheringForm {
  const { result } = renderHook(() => useGatheringForm());
  return { ...result.current, ...overrides };
}

describe("event draft progress", () => {
  it("counts the five asking chapters and names the ones whose checks fail", () => {
    const form = formWith({ title: "", isFormatChosen: false });
    const { progress, missing } = eventDraftProgress(form);
    expect(progress.total).toBe(5);
    expect(missing).toContain("what");
    expect(progress.done).toBe(5 - missing.length);
    expect(missing).not.toContain("review");
  });

  it("drops the what chapter once it has a format and a name", () => {
    const form = formWith({ title: "Sunday picnic", isFormatChosen: true });
    expect(eventDraftProgress(form).missing).not.toContain("what");
  });

  it("lists the asking chapters in wizard order", () => {
    expect(EVENT_DRAFT_CHAPTER_IDS).toEqual([
      "what",
      "whenWhere",
      "who",
      "access",
      "care",
    ]);
  });

  it("treats an event as made for something when it names a community, a run-by or a venue listing", () => {
    expect(
      isEventDraftMadeFor({
        communitySlug: "",
        runByListingId: null,
        venueListingId: null,
      }),
    ).toBe(false);
    expect(
      isEventDraftMadeFor({
        communitySlug: "rainbow-runners",
        runByListingId: null,
        venueListingId: null,
      }),
    ).toBe(true);
    expect(
      isEventDraftMadeFor({
        communitySlug: "",
        runByListingId: "listing-1",
        venueListingId: null,
      }),
    ).toBe(true);
    expect(
      isEventDraftMadeFor({
        communitySlug: "",
        runByListingId: undefined,
        venueListingId: "listing-2",
      }),
    ).toBe(true);
  });
});
