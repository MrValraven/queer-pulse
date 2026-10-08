import { describe, expect, it } from "vitest";
import { FREGUESIAS } from "../../../shared/components/map/freguesias.data";
import {
  coveredParishes,
  emptyMobileDetails,
  hasMeetingPoint,
  isByAppointmentListing,
  isMobileWithoutMeetingPoint,
  joinedPlaceNames,
  LISBON_PARISH_NAMES,
  listingKindOf,
  mobileCardAreaLine,
  mobileDetailsForPayload,
  NEARBY_MUNICIPALITIES,
  normalizeMobileDetails,
} from "./listingMobile.data";

describe("listingKindOf", () => {
  it("reads a place, an online listing and a mobile one", () => {
    expect(listingKindOf({})).toBe("place");
    expect(listingKindOf({ online: false, mobile: false })).toBe("place");
    expect(listingKindOf({ online: true })).toBe("online");
    expect(listingKindOf({ mobile: true })).toBe("mobile");
  });

  it("reads a row carrying both flags as online, the way the server refuses it", () => {
    expect(listingKindOf({ online: true, mobile: true })).toBe("online");
  });

  it("reads null flags from an older payload as a place", () => {
    expect(listingKindOf({ online: null, mobile: null })).toBe("place");
  });
});

describe("the vocabularies", () => {
  it("spells the 24 parishes exactly as the map's parish polygons", () => {
    const polygonNames = FREGUESIAS.features.map(
      (feature) => feature.properties.name,
    );
    expect([...LISBON_PARISH_NAMES].sort()).toEqual([...polygonNames].sort());
    expect(LISBON_PARISH_NAMES).toHaveLength(24);
  });

  it("lists the eight nearby municipalities in contract order", () => {
    expect([...NEARBY_MUNICIPALITIES]).toEqual([
      "Almada",
      "Amadora",
      "Cascais",
      "Loures",
      "Odivelas",
      "Oeiras",
      "Seixal",
      "Sintra",
    ]);
  });
});

describe("normalizeMobileDetails", () => {
  it("heals a missing block to all of Lisbon", () => {
    expect(normalizeMobileDetails(undefined)).toEqual(emptyMobileDetails());
    expect(normalizeMobileDetails(null)).toEqual({
      allOfCity: true,
      parishes: [],
      alsoTravelsTo: [],
      byAppointment: false,
    });
  });

  it("drops unknown names and repeats, and keeps canonical order", () => {
    const details = normalizeMobileDetails({
      allOfCity: false,
      parishes: ["Penha de França", "Arroios", "Atlantis", "Arroios", 7],
      alsoTravelsTo: ["Oeiras", "Porto", "Almada"],
      byAppointment: true,
    });
    expect(details).toEqual({
      allOfCity: false,
      parishes: ["Arroios", "Penha de França"],
      alsoTravelsTo: ["Almada", "Oeiras"],
      byAppointment: true,
    });
  });

  it("keeps the picked parishes while All of Lisbon is on, so switching back restores them", () => {
    expect(
      normalizeMobileDetails({ allOfCity: true, parishes: ["Estrela"] })
        .parishes,
    ).toEqual(["Estrela"]);
  });
});

describe("mobileDetailsForPayload", () => {
  it("sends the empty block for a place and for an online listing", () => {
    const details = { allOfCity: false, parishes: ["Estrela"] };
    expect(mobileDetailsForPayload({ mobileDetails: details })).toEqual(
      emptyMobileDetails(),
    );
    expect(
      mobileDetailsForPayload({
        online: true,
        mobile: true,
        mobileDetails: details,
      }),
    ).toEqual(emptyMobileDetails());
  });

  it("empties the parishes while All of Lisbon is on", () => {
    expect(
      mobileDetailsForPayload({
        mobile: true,
        mobileDetails: { allOfCity: true, parishes: ["Estrela"] },
      }).parishes,
    ).toEqual([]);
  });

  it("keeps the parishes of a narrowed listing", () => {
    expect(
      mobileDetailsForPayload({
        mobile: true,
        mobileDetails: { allOfCity: false, parishes: ["Estrela", "Arroios"] },
      }).parishes,
    ).toEqual(["Arroios", "Estrela"]);
  });
});

describe("meeting point and appointment tests", () => {
  it("has a meeting point only when mobile with both coordinates", () => {
    expect(
      hasMeetingPoint({ mobile: true, latitude: 38.7, longitude: -9.1 }),
    ).toBe(true);
    expect(
      hasMeetingPoint({ mobile: true, latitude: 38.7, longitude: null }),
    ).toBe(false);
    expect(hasMeetingPoint({ latitude: 38.7, longitude: -9.1 })).toBe(false);
  });

  it("reads an unticked or absent box on a mobile draft as no meeting point", () => {
    expect(isMobileWithoutMeetingPoint({ mobile: true })).toBe(true);
    expect(
      isMobileWithoutMeetingPoint({ mobile: true, hasMeetingPoint: false }),
    ).toBe(true);
    expect(
      isMobileWithoutMeetingPoint({ mobile: true, hasMeetingPoint: true }),
    ).toBe(false);
    expect(isMobileWithoutMeetingPoint({ mobile: false })).toBe(false);
  });

  it("counts by appointment only on a mobile listing", () => {
    const details = { byAppointment: true };
    expect(
      isByAppointmentListing({ mobile: true, mobileDetails: details }),
    ).toBe(true);
    expect(isByAppointmentListing({ mobileDetails: details })).toBe(false);
  });
});

describe("coveredParishes", () => {
  it("covers all 24 for All of Lisbon and the picks otherwise", () => {
    expect(coveredParishes(emptyMobileDetails())).toHaveLength(24);
    expect(
      coveredParishes({
        ...emptyMobileDetails(),
        allOfCity: false,
        parishes: ["Arroios"],
      }),
    ).toEqual(["Arroios"]);
  });
});

describe("mobileCardAreaLine", () => {
  const narrowed = (parishes: string[]) => ({
    ...emptyMobileDetails(),
    allOfCity: false,
    parishes,
  });

  it("names the meeting point's neighbourhood first", () => {
    expect(
      mobileCardAreaLine({
        hood: "Mouraria",
        isAtMeetingPoint: true,
        details: emptyMobileDetails(),
      }),
    ).toEqual({
      key: "marketing:directory.card.meetsIn",
      values: { hood: "Mouraria" },
    });
  });

  it("says Works across Lisbon for All of Lisbon", () => {
    expect(
      mobileCardAreaLine({
        hood: "",
        isAtMeetingPoint: false,
        details: emptyMobileDetails(),
      }).key,
    ).toBe("marketing:directory.card.worksAcrossLisbon");
  });

  it("names one, two, or two and a count", () => {
    expect(
      mobileCardAreaLine({
        hood: "",
        isAtMeetingPoint: false,
        details: narrowed(["Arroios"]),
      }),
    ).toEqual({
      key: "marketing:directory.card.worksInOne",
      values: { first: "Arroios" },
    });
    expect(
      mobileCardAreaLine({
        hood: "",
        isAtMeetingPoint: false,
        details: narrowed(["Arroios", "Estrela"]),
      }),
    ).toEqual({
      key: "marketing:directory.card.worksInTwo",
      values: { first: "Arroios", second: "Estrela" },
    });
    expect(
      mobileCardAreaLine({
        hood: "",
        isAtMeetingPoint: false,
        details: narrowed(["Arroios", "Beato", "Estrela", "Penha de França"]),
      }),
    ).toEqual({
      key: "marketing:directory.card.worksInMore",
      values: { first: "Arroios", second: "Beato", count: 2 },
    });
  });

  it("falls back to the area when a meeting point has no neighbourhood", () => {
    expect(
      mobileCardAreaLine({
        hood: " ",
        isAtMeetingPoint: true,
        details: emptyMobileDetails(),
      }).key,
    ).toBe("marketing:directory.card.worksAcrossLisbon");
  });
});

describe("joinedPlaceNames", () => {
  it("joins in the reader's language", () => {
    expect(joinedPlaceNames(["Almada", "Oeiras"], "en")).toBe(
      "Almada and Oeiras",
    );
    expect(joinedPlaceNames(["Almada", "Oeiras"], "pt-PT")).toBe(
      "Almada e Oeiras",
    );
    expect(joinedPlaceNames(["Almada"], "en")).toBe("Almada");
  });
});
