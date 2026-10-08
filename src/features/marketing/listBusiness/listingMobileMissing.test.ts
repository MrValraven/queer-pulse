import { describe, expect, it } from "vitest";
import { ANCHOR, emptyHours, type ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { emptyMobileDetails } from "./listingMobile.data";
import { mobileMissingFields } from "./listingMobileMissing";

const KEY = "marketing:listBusiness.missing";

function mobileDraft(fields: Partial<ListingDraft> = {}): ListingDraft {
  return { ...blankDraft(), path: "claim", mobile: true, ...fields };
}
const labelsOf = (fields: { labelKey: string }[]) =>
  fields.map((field) => field.labelKey);

describe("mobileMissingFields", () => {
  it("asks nothing of a place or an online listing", () => {
    expect(mobileMissingFields(blankDraft())).toEqual({ step1: [], step3: [] });
    expect(mobileMissingFields({ ...blankDraft(), online: true })).toEqual({
      step1: [],
      step3: [],
    });
  });

  it("needs a parish once Some parishes is picked", () => {
    const missing = mobileMissingFields(
      mobileDraft({
        mobileDetails: { ...emptyMobileDetails(), allOfCity: false },
      }),
    );
    expect(missing.step1).toEqual([
      { labelKey: `${KEY}.parishes`, anchor: ANCHOR.whereYouWork },
    ]);
  });

  it("needs nothing about the area for All of Lisbon", () => {
    expect(mobileMissingFields(mobileDraft()).step1).toEqual([]);
  });

  it("asks a ticked meeting point for its neighbourhood, address and pin", () => {
    const missing = mobileMissingFields(mobileDraft({ hasMeetingPoint: true }));
    expect(missing.step3).toEqual(
      expect.arrayContaining([
        { labelKey: `${KEY}.hood`, anchor: ANCHOR.meetingPoint },
        { labelKey: `${KEY}.address`, anchor: ANCHOR.address },
        { labelKey: `${KEY}.pin`, anchor: ANCHOR.address },
      ]),
    );
  });

  it("asks nothing about a location while the meeting point is unticked", () => {
    const labels = labelsOf(mobileMissingFields(mobileDraft()).step3);
    expect(labels).not.toContain(`${KEY}.address`);
    expect(labels).not.toContain(`${KEY}.hood`);
  });

  it("holds a claim back until it has an open day or By appointment only", () => {
    expect(labelsOf(mobileMissingFields(mobileDraft()).step3)).toContain(
      `${KEY}.hoursOrAppointment`,
    );
    const hours = emptyHours();
    hours.Wed = { open: true, intervals: [{ from: "10:00", to: "18:00" }] };
    expect(
      labelsOf(mobileMissingFields(mobileDraft({ hours })).step3),
    ).not.toContain(`${KEY}.hoursOrAppointment`);
    const byAppointment = mobileDraft({
      mobileDetails: { ...emptyMobileDetails(), byAppointment: true },
    });
    expect(labelsOf(mobileMissingFields(byAppointment).step3)).not.toContain(
      `${KEY}.hoursOrAppointment`,
    );
  });

  it("never holds a suggestion back on hours", () => {
    expect(
      labelsOf(mobileMissingFields(mobileDraft({ path: "suggest" })).step3),
    ).not.toContain(`${KEY}.hoursOrAppointment`);
  });

  it("skips the hours checks by appointment, where no hours are sent", () => {
    const hours = emptyHours();
    hours.Mon = { open: true, intervals: [{ from: "", to: "" }] };
    const draft = mobileDraft({
      hours,
      mobileDetails: { ...emptyMobileDetails(), byAppointment: true },
    });
    expect(labelsOf(mobileMissingFields(draft).step3)).not.toContain(
      `${KEY}.hoursInvalid`,
    );
  });
});
