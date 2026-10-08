import { describe, expect, it } from "vitest";
import { gatheringDetails } from "../gatherings/data";
import { DEMO_MANAGED_LISTINGS } from "./listBusiness/api/managedListings.data";
import {
  hasMeetingPoint,
  isByAppointmentListing,
  listingKindOf,
  normalizeMobileDetails,
} from "./listBusiness/listingMobile.data";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { MOBILE_DIRECTORY_PLACES } from "./directoryMobilePlaces.data";
import { businessToLocal } from "./localPlaces";

const placeBySlug = (slug: string) =>
  MOBILE_DIRECTORY_PLACES.find((place) => place.slug === slug)!;

describe("the out-and-about demo fixtures", () => {
  it("join the directory and are all out and about", () => {
    for (const place of MOBILE_DIRECTORY_PLACES) {
      expect(DIRECTORY_PLACES).toContain(place);
      expect(listingKindOf(place)).toBe("mobile");
    }
  });

  it("pins the walking tour's meeting point in Santa Maria Maior", () => {
    const tour = placeBySlug("lisboa-arco-iris-walks");
    expect(hasMeetingPoint(tour)).toBe(true);
    expect(businessToLocal(tour, true).freguesia).toBe("Santa Maria Maior");
  });

  it("matches the managed-listings fixture's meeting point", () => {
    const tour = placeBySlug("lisboa-arco-iris-walks");
    const managed = DEMO_MANAGED_LISTINGS.find(
      (item) => item.slug === "lisboa-arco-iris-walks",
    );
    expect(managed?.meetingPoint).toMatchObject({
      latitude: tour.latitude,
      longitude: tour.longitude,
      address: tour.address,
      hood: tour.hood,
    });
  });

  it("covers every area case: all of Lisbon, narrowed, by appointment, selling online", () => {
    const hairdresser = normalizeMobileDetails(
      placeBySlug("corte-movel").mobileDetails,
    );
    expect(hairdresser.allOfCity).toBe(false);
    expect(hairdresser.parishes).toEqual([
      "Arroios",
      "Estrela",
      "Penha de França",
    ]);
    const movers = placeBySlug("muda-comigo");
    expect(isByAppointmentListing(movers)).toBe(true);
    expect(normalizeMobileDetails(movers.mobileDetails).alsoTravelsTo).toEqual([
      "Almada",
      "Oeiras",
    ]);
    expect(
      MOBILE_DIRECTORY_PLACES.filter((place) => place.hasOnlineShop),
    ).toHaveLength(1);
  });

  it("gives the come-to-you fixtures no location at all", () => {
    for (const slug of ["corte-movel", "muda-comigo"]) {
      const place = placeBySlug(slug);
      expect(place).toMatchObject({
        address: "",
        hood: "",
        latitude: null,
        longitude: null,
      });
      expect(businessToLocal(place, true).coords).toBeNull();
    }
  });

  it("links the tour's run-by gathering both ways", () => {
    const tour = placeBySlug("lisboa-arco-iris-walks");
    expect(tour.upcoming?.[0]).toMatchObject({
      slug: "queer-history-walk",
      role: "runBy",
    });
    expect(gatheringDetails["queer-history-walk"]?.runByListing?.slug).toBe(
      tour.slug,
    );
  });
});
