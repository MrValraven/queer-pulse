import { describe, expect, it } from "vitest";
import type { ListingDTO } from "./api/listings.api";
import { listingDtoToPending } from "./api/listings.adapters";
import { dtoToDraft } from "./dtoToDraft";
import { emptyMobileDetails } from "./listingMobile.data";

/** A saved owner listing, with only the fields the mappers read. */
function makeDto(overrides: Partial<ListingDTO> = {}): ListingDTO {
  return {
    ref: "QPL-2026-0102",
    slug: "corte-movel",
    status: "live",
    submittedBy: { slug: "alex", firstName: "Alex", lastName: "" },
    createdAt: "2026-10-01T00:00:00.000Z",
    operatingState: {
      state: "open",
      note: null,
      setAt: null,
      movedToAddress: null,
    },
    movedToListingId: null,
    detailsConfirmedAt: null,
    path: "claim",
    name: "Corte Móvel",
    cats: ["grooming"],
    hood: "",
    badge: "owned",
    evidence: "",
    price: "",
    blurb: "Haircuts at home",
    tagline: "",
    whatItIs: [],
    langs: [],
    online: false,
    address: "",
    geocoded: false,
    latitude: null,
    longitude: null,
    hours: {},
    hoursNote: "",
    social: { instagram: "", website: "", email: "", phone: "" },
    photos: { wide: null, d1: null, d2: null, vibe: null },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    rel: "own",
    ownerName: "Alex",
    ownerRole: "Hairdresser",
    ownerBio: "",
    visibility: "public",
    linkToProfile: true,
    consentOuting: true,
    consentGuide: true,
    queerOwnedVerified: false,
    ...overrides,
  };
}

describe("dtoToDraft for an out-and-about listing", () => {
  it("ticks the meeting point when the listing stores both coordinates", () => {
    const draft = dtoToDraft(
      makeDto({
        mobile: true,
        hood: "Mouraria",
        address: "Largo da Severa",
        latitude: 38.7153,
        longitude: -9.1352,
        mobileDetails: { ...emptyMobileDetails(), byAppointment: true },
      }),
    );
    expect(draft.mobile).toBe(true);
    expect(draft.hasMeetingPoint).toBe(true);
    expect(draft.mobileDetails?.byAppointment).toBe(true);
  });

  it("opens with the two appointment answers in step", () => {
    const toggledOn = dtoToDraft(
      makeDto({
        mobile: true,
        mobileDetails: { ...emptyMobileDetails(), byAppointment: true },
        entryMode: null,
      }),
    );
    expect(toggledOn.entryMode).toBe("appointmentOnly");
    const byWayIn = dtoToDraft(
      makeDto({ mobile: true, entryMode: "appointmentOnly" }),
    );
    expect(byWayIn.mobileDetails?.byAppointment).toBe(true);
  });

  it("leaves the toggle off for By appointment only when the listing stores hours", () => {
    const withHours = dtoToDraft(
      makeDto({
        mobile: true,
        entryMode: "appointmentOnly",
        hours: {
          Tue: { open: true, intervals: [{ from: "10:00", to: "19:00" }] },
        },
      }),
    );
    expect(withHours.entryMode).toBe("appointmentOnly");
    expect(withHours.mobileDetails?.byAppointment).toBe(false);
    expect(withHours.hours.Tue?.open).toBe(true);
    const withNote = dtoToDraft(
      makeDto({
        mobile: true,
        entryMode: "appointmentOnly",
        hoursNote: "Saturdays book up fast",
      }),
    );
    expect(withNote.mobileDetails?.byAppointment).toBe(false);
  });

  it("leaves it unticked without coordinates", () => {
    const draft = dtoToDraft(makeDto({ mobile: true }));
    expect(draft.hasMeetingPoint).toBe(false);
  });

  it("reads a payload from before the feature as a place with the empty block", () => {
    const draft = dtoToDraft(makeDto());
    expect(draft.mobile).toBe(false);
    expect(draft.mobileDetails).toEqual(emptyMobileDetails());
    expect(draft.hasMeetingPoint).toBe(false);
  });

  it("gives the pending view model the same reading", () => {
    const pending = listingDtoToPending(
      makeDto({ mobile: true, latitude: 38.7153, longitude: -9.1352 }),
    );
    expect(pending.hasMeetingPoint).toBe(true);
    expect(pending.mobileDetails).toEqual(emptyMobileDetails());
  });

  it("gives the pending view model the draft's empty fact text for the wire's null", () => {
    const pending = listingDtoToPending(
      makeDto({ coverFreeBefore: null, saferSpacePolicyUrl: null }),
    );
    expect(pending.coverFreeBefore).toBe("");
    expect(pending.saferSpacePolicyUrl).toBe("");
    const filled = listingDtoToPending(
      makeDto({
        coverPolicy: "freeBefore",
        coverFreeBefore: "23:00",
        saferSpacePolicyUrl: "https://clube.pt/politica",
      }),
    );
    expect(filled.coverFreeBefore).toBe("23:00");
    expect(filled.saferSpacePolicyUrl).toBe("https://clube.pt/politica");
  });
});
