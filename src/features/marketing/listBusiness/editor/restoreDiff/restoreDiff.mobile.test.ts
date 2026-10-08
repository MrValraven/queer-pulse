import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../../../shared/i18n/types";
import type { ListingDraft } from "../../listBusiness.data";
import { blankDraft } from "../../listingFormDraft";
import { emptyMobileDetails } from "../../listingMobile.data";
import { LISTING_EDITOR_SECTIONS } from "../listingEditor.data";
import { isSameListingContent } from "./listingDraftComparable";
import { healListingDraft } from "./healListingDraft";
import { buildRestoreDiff, RESTORE_FIELD_AREAS } from "./restoreDiff.data";

const t: TFunction = (key) => key;

function walkDraft(fields: Partial<ListingDraft> = {}): ListingDraft {
  return {
    ...blankDraft(),
    name: "Lisboa Arco-Íris Walks",
    cats: ["tours"],
    mobile: true,
    mobileDetails: emptyMobileDetails(),
    ...fields,
  };
}

function changedKeys(current: ListingDraft, saved: ListingDraft): string[] {
  return buildRestoreDiff({
    current,
    saved,
    sections: LISTING_EDITOR_SECTIONS,
    t,
  })
    .flatMap((area) => area.fields)
    .map((field) => field.key);
}

describe("the restore review for an out-and-about listing", () => {
  it("reads a draft from before the feature as the same listing as a place with the empty block", () => {
    const {
      mobile: _mobile,
      mobileDetails: _mobileDetails,
      hasMeetingPoint: _hasMeetingPoint,
      ...older
    } = blankDraft();
    expect(isSameListingContent(older as ListingDraft, blankDraft())).toBe(
      true,
    );
  });

  it("ignores parishes kept in the draft while All of Lisbon is on", () => {
    const withLeftovers = walkDraft({
      mobileDetails: { ...emptyMobileDetails(), parishes: ["Arroios"] },
    });
    expect(isSameListingContent(withLeftovers, walkDraft())).toBe(true);
  });

  it("names each changed answer under its own label", () => {
    const saved = walkDraft({
      mobileDetails: {
        allOfCity: false,
        parishes: ["Arroios", "Estrela"],
        alsoTravelsTo: ["Almada"],
        byAppointment: true,
      },
    });
    expect(changedKeys(walkDraft(), saved)).toEqual(
      expect.arrayContaining([
        "mobileDetails.whereYouWork",
        "mobileDetails.alsoTravelsTo",
        "mobileDetails.byAppointment",
      ]),
    );
  });

  it("lists the kind switch and the meeting point box", () => {
    const keys = changedKeys(
      { ...walkDraft(), mobile: false },
      walkDraft({ hasMeetingPoint: true }),
    );
    expect(keys).toEqual(expect.arrayContaining(["mobile", "hasMeetingPoint"]));
  });

  it("restores the meeting point box with the address it governs", () => {
    expect(RESTORE_FIELD_AREAS.hasMeetingPoint).toBe(
      RESTORE_FIELD_AREAS.address,
    );
    expect(RESTORE_FIELD_AREAS.mobile).toBe(RESTORE_FIELD_AREAS.cats);
  });

  it("heals a mangled block to its own shape", () => {
    const healed = healListingDraft({
      ...walkDraft(),
      mobile: "yes" as unknown as boolean,
      mobileDetails: "broken" as unknown as ListingDraft["mobileDetails"],
    });
    expect(healed.mobile).toBe(false);
    expect(healed.mobileDetails).toEqual(emptyMobileDetails());
  });
});
