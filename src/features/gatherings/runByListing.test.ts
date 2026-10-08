import { describe, expect, it } from "vitest";
import type { ManagedListingItem } from "../marketing/listBusiness/api/managedListings.api";
import {
  hoodValueForListingHood,
  meetingPointPrefill,
  runBySelectionOf,
} from "./runByListing";

const meetingPoint = {
  address: "Largo da Severa, 1100-588 Lisboa",
  hood: "Mouraria",
  latitude: 38.7153,
  longitude: -9.1352,
};

const tour: ManagedListingItem = {
  id: "listing-uuid-1",
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
  kind: "mobile",
  meetingPoint,
};

describe("runBySelectionOf", () => {
  it("carries the id to send and the view to show", () => {
    expect(runBySelectionOf(tour)).toEqual({
      listingId: "listing-uuid-1",
      listing: {
        ref: "QPL-2026-0101",
        slug: "lisboa-arco-iris-walks",
        name: "Lisboa Arco-Íris Walks",
      },
    });
  });

  it("reads no pick as a cleared link", () => {
    expect(runBySelectionOf(null)).toEqual({ listingId: null, listing: null });
  });
});

describe("hoodValueForListingHood", () => {
  it("keeps a neighbourhood the gathering form offers", () => {
    expect(hoodValueForListingHood("Mouraria")).toBe("Mouraria");
  });

  it("files any other neighbourhood under Other in Lisbon", () => {
    expect(hoodValueForListingHood("Baixa")).toBe("Other in Lisbon");
  });
});

describe("meetingPointPrefill", () => {
  it("fills an empty address and neighbourhood", () => {
    expect(
      meetingPointPrefill({ hood: "", address: "" }, meetingPoint),
    ).toEqual({
      hood: "Mouraria",
      address: "Largo da Severa, 1100-588 Lisboa",
    });
  });

  it("never overwrites what the host typed", () => {
    expect(
      meetingPointPrefill({ hood: "Alfama", address: "Rua A 1" }, meetingPoint),
    ).toEqual({});
    expect(
      meetingPointPrefill({ hood: "Alfama", address: "  " }, meetingPoint),
    ).toEqual({ address: "Largo da Severa, 1100-588 Lisboa" });
  });

  it("fills nothing for an online gathering or a listing with no meeting point", () => {
    expect(
      meetingPointPrefill({ hood: "Online", address: "" }, meetingPoint),
    ).toEqual({});
    expect(meetingPointPrefill({ hood: "", address: "" }, null)).toEqual({});
  });
});
