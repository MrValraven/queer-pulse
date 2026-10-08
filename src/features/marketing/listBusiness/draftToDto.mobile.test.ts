import { describe, expect, it } from "vitest";
import { emptyHours, type ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { emptyMobileDetails } from "./listingMobile.data";
import { withKind } from "./listingKind";
import { draftToDto, draftToUpdateDto } from "./draftToDto";

function mobileDraft(fields: Partial<ListingDraft> = {}): ListingDraft {
  const hours = emptyHours();
  hours.Tue = { open: true, intervals: [{ from: "10:00", to: "19:00" }] };
  return {
    ...blankDraft(),
    path: "claim",
    name: "Corte Móvel",
    cats: ["grooming"],
    mobile: true,
    mobileDetails: {
      ...emptyMobileDetails(),
      allOfCity: false,
      parishes: ["Arroios", "Estrela"],
    },
    hood: "Arroios",
    address: "Rua do Benformoso 12",
    latitude: 38.72,
    longitude: -9.13,
    geocoded: true,
    hours,
    hoursNote: "Saturdays book up fast",
    hoursExceptions: [
      { date: "2026-12-24", open: false, intervals: [], note: "Closed" },
    ],
    ...fields,
  };
}

describe("draftToDto for an out-and-about listing", () => {
  it("sends no address, neighbourhood or pin without a meeting point", () => {
    const dto = draftToDto(mobileDraft({ hasMeetingPoint: false }));
    expect(dto).toMatchObject({
      mobile: true,
      online: false,
      address: "",
      hood: "",
      latitude: null,
      longitude: null,
      geocoded: false,
    });
  });

  it("keeps the meeting point when the box is ticked", () => {
    const dto = draftToDto(mobileDraft({ hasMeetingPoint: true }));
    expect(dto).toMatchObject({
      address: "Rua do Benformoso 12",
      hood: "Arroios",
      latitude: 38.72,
      longitude: -9.13,
    });
  });

  it("sends a closed week, no note and no special dates by appointment", () => {
    const dto = draftToDto(
      mobileDraft({
        mobileDetails: { ...emptyMobileDetails(), byAppointment: true },
      }),
    );
    expect(Object.values(dto.hours ?? {}).every((day) => !day.open)).toBe(true);
    expect(dto.hoursNote).toBe("");
    expect(dto.hoursExceptions).toEqual([]);
    expect(dto.mobileDetails?.byAppointment).toBe(true);
  });

  it("keeps the hours of a mobile listing that has them", () => {
    const dto = draftToDto(mobileDraft());
    expect(dto.hours?.Tue?.open).toBe(true);
    expect(dto.hoursNote).toBe("Saturdays book up fast");
  });

  it("empties the parishes when All of Lisbon is on", () => {
    const dto = draftToDto(
      mobileDraft({
        mobileDetails: {
          ...emptyMobileDetails(),
          allOfCity: true,
          parishes: ["Arroios"],
        },
      }),
    );
    expect(dto.mobileDetails?.parishes).toEqual([]);
  });

  it("never sends mobile with online", () => {
    const dto = draftToDto(mobileDraft({ online: true }));
    expect(dto.online).toBe(true);
    expect(dto.mobile).toBe(false);
    expect(dto.mobileDetails).toEqual(emptyMobileDetails());
  });

  it("sends the empty block for a place", () => {
    const dto = draftToDto({ ...mobileDraft(), mobile: false });
    expect(dto.mobile).toBe(false);
    expect(dto.mobileDetails).toEqual(emptyMobileDetails());
    expect(dto.address).toBe("Rua do Benformoso 12");
  });

  it("never sends the draft-only meeting point flag", () => {
    expect(
      "hasMeetingPoint" in draftToDto(mobileDraft({ hasMeetingPoint: true })),
    ).toBe(false);
    expect(
      "hasMeetingPoint" in
        draftToUpdateDto(mobileDraft({ hasMeetingPoint: true })),
    ).toBe(false);
  });

  // Backend deltas 9 and 10: the server checks the row as the PATCH leaves
  // it, so a kind switch carries both flags and the coordinates.
  it("sends mobile false with online true on a switch to online", () => {
    const patch = draftToUpdateDto(withKind(mobileDraft(), "online"));
    expect(patch).toMatchObject({
      online: true,
      mobile: false,
      latitude: null,
      longitude: null,
    });
  });

  it("sends both flags and null coordinates when a place becomes out and about", () => {
    const place = { ...mobileDraft(), mobile: false };
    const patch = draftToUpdateDto(withKind(place, "mobile"));
    expect(patch).toMatchObject({
      online: false,
      mobile: true,
      latitude: null,
      longitude: null,
      address: "",
    });
  });
});
