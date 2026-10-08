import { describe, expect, it } from "vitest";
import { ANCHOR, type ListingDraft } from "../listBusiness.data";
import { blankDraft } from "../listingFormDraft";
import { emptyMobileDetails } from "../listingMobile.data";
import {
  highlightedRegionsFor,
  placementForAnchor,
} from "./listingPreviewRegions.data";

const CAPTION = "marketing:listBusiness.livePreview.caption.";

function mobileDraft(fields: Partial<ListingDraft> = {}): ListingDraft {
  return { ...blankDraft(), name: "Corte Móvel", mobile: true, ...fields };
}

describe("placements for an out-and-about listing", () => {
  it("gives every new anchor a placement, mobile or not", () => {
    for (const draft of [
      blankDraft(),
      mobileDraft(),
      mobileDraft({ hasMeetingPoint: true }),
    ]) {
      for (const anchor of [
        ANCHOR.whereYouWork,
        ANCHOR.meetingPoint,
        ANCHOR.byAppointment,
      ]) {
        expect(placementForAnchor(anchor, draft), anchor).not.toBeNull();
      }
    }
  });

  it("says no map and no address while the meeting point is unticked", () => {
    const draft = mobileDraft();
    for (const anchor of [ANCHOR.meetingPoint, ANCHOR.address, ANCHOR.hood]) {
      expect(placementForAnchor(anchor, draft)).toEqual({
        kind: "setting",
        captionKey: `${CAPTION}meetingPointOff`,
      });
    }
  });

  it("outlines the card's location line for the area without a meeting point", () => {
    const draft = mobileDraft();
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.whereYouWork, draft),
        draft,
      ),
    ).toEqual(["meta"]);
  });

  it("moves the area to the full page once the card names the meeting point", () => {
    const draft = mobileDraft({ hasMeetingPoint: true, hood: "Mouraria" });
    expect(placementForAnchor(ANCHOR.whereYouWork, draft)).toEqual({
      kind: "fullPage",
      captionKey: `${CAPTION}whereYouWorkPage`,
    });
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.meetingPoint, draft),
        draft,
      ),
    ).toEqual(["meta"]);
    expect(placementForAnchor(ANCHOR.address, draft)?.kind).toBe("fullPage");
  });

  it("puts By appointment on the status line and the hours block", () => {
    const draft = mobileDraft({
      mobileDetails: { ...emptyMobileDetails(), byAppointment: true },
    });
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.byAppointment, draft),
        draft,
      ),
    ).toEqual(["status", "hours"]);
    for (const anchor of [
      ANCHOR.hours,
      ANCHOR.hoursTools,
      ANCHOR.hoursNote,
      ANCHOR.hoursExceptions,
    ]) {
      expect(placementForAnchor(anchor, draft)).toEqual({
        kind: "notShown",
        captionKey: `${CAPTION}hoursByAppointment`,
      });
    }
  });

  it("keeps a place's placements as they were", () => {
    const place = { ...blankDraft(), name: "Livraria Rosa" };
    expect(placementForAnchor(ANCHOR.address, place)?.kind).toBe("fullPage");
    expect(placementForAnchor(ANCHOR.hood, place)).toMatchObject({
      kind: "preview",
      regions: ["meta"],
    });
  });
});
