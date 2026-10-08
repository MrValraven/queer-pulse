import { afterEach, describe, expect, it, vi } from "vitest";
import { MOBILE_DIRECTORY_PLACES } from "./directoryMobilePlaces.data";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import { emptyHours } from "./listBusiness/listBusiness.data";
import {
  businessToLocal,
  coveredParishesOfPlace,
  filterLocalPlaces,
  isAcrossLisbonPlace,
  isMobilePlace,
  mergeLocalPlaces,
  isPlaceOpenNow,
  sortLocalPlaces,
} from "./localPlaces";

const fixture = (slug: string) =>
  MOBILE_DIRECTORY_PLACES.find((place) => place.slug === slug)!;
const NO_FILTERS = { categories: [], query: "", vibes: [] };

afterEach(() => vi.useRealTimers());

describe("businessToLocal for an out-and-about listing", () => {
  it("pins a meeting point under its parish", () => {
    const local = businessToLocal(fixture("lisboa-arco-iris-walks"), true);
    expect(local.coords).not.toBeNull();
    expect(local.freguesia).toBe("Santa Maria Maior");
    expect(isAcrossLisbonPlace(local)).toBe(false);
  });

  it("never pins one without a meeting point, even when the demo table knows its slug", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const borrowed: DirectoryPlace = {
      ...fixture("corte-movel"),
      slug: "atelier-pulso",
    };
    const local = businessToLocal(borrowed, true);
    expect(local.coords).toBeNull();
    expect(local.freguesia).toBe("");
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("puts a listing with no pin in Across Lisbon with the parishes it covers", () => {
    const hairdresser = businessToLocal(fixture("corte-movel"), true);
    expect(isAcrossLisbonPlace(hairdresser)).toBe(true);
    expect(coveredParishesOfPlace(hairdresser)).toEqual([
      "Arroios",
      "Estrela",
      "Penha de França",
    ]);
    expect(
      coveredParishesOfPlace(businessToLocal(fixture("muda-comigo"), true)),
    ).toHaveLength(24);
  });

  it("covers nothing for a place", () => {
    const place = businessToLocal(DIRECTORY_PLACES[0]!, true);
    expect(isMobilePlace(place)).toBe(false);
    expect(coveredParishesOfPlace(place)).toEqual([]);
  });
});

describe("Open now and Out and about", () => {
  it("never counts a by-appointment listing as open now", () => {
    const hours = emptyHours();
    for (const day of Object.keys(hours)) {
      hours[day] = { open: true, intervals: [{ from: "00:00", to: "23:59" }] };
    }
    const movers = businessToLocal({ ...fixture("muda-comigo"), hours }, true);
    expect(isPlaceOpenNow(movers)).toBe(false);
  });

  it("checks a mobile listing with hours like a place", () => {
    const hours = emptyHours();
    for (const day of Object.keys(hours)) {
      hours[day] = { open: true, intervals: [{ from: "00:00", to: "23:59" }] };
    }
    const hairdresser = businessToLocal(
      { ...fixture("corte-movel"), hours },
      true,
    );
    expect(isPlaceOpenNow(hairdresser)).toBe(true);
  });

  it("keeps only out-and-about listings with the chip on", () => {
    const places = DIRECTORY_PLACES.map((place) =>
      businessToLocal(place, true),
    );
    const kept = filterLocalPlaces(places, {
      ...NO_FILTERS,
      isOutAndAboutOnly: true,
    });
    expect(kept.map((place) => place.id).sort()).toEqual(
      MOBILE_DIRECTORY_PLACES.map((place) => `business:${place.slug}`).sort(),
    );
  });

  it("sorts a listing with no neighbourhood after the rest", () => {
    const places = [
      businessToLocal(fixture("corte-movel"), true),
      businessToLocal(DIRECTORY_PLACES[0]!, true),
    ];
    expect(sortLocalPlaces(places, "hood")[1]?.id).toBe("business:corte-movel");
  });
});

describe("mergeLocalPlaces for an out-and-about listing", () => {
  it("keeps a listing with no pin unpinned when a venue shares its name", () => {
    const hairdresser = businessToLocal(fixture("corte-movel"), true);
    const venue = {
      ...businessToLocal(DIRECTORY_PLACES[0]!, true),
      name: hairdresser.name,
    };
    expect(venue.coords).not.toBeNull();
    const merged = mergeLocalPlaces([hairdresser], [venue]);
    const kept = merged.find((place) => place.id === hairdresser.id);
    expect(kept?.coords).toBeNull();
    expect(isAcrossLisbonPlace(kept!)).toBe(true);
  });
});
