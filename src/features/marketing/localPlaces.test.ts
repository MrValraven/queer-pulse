import { describe, expect, it } from "vitest";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { VENUES } from "./map.data";
import {
  businessToLocal,
  filterLocalPlaces,
  mergeLocalPlaces,
  normalizeName,
  venueToLocal,
} from "./localPlaces";

describe("normalizeName", () => {
  it("lowercases, trims, and folds diacritics for cross-dataset matching", () => {
    expect(normalizeName("  Salão Mouraria ")).toBe("salao mouraria");
    expect(normalizeName("Navalha")).toBe("navalha");
    expect(normalizeName("Café Central")).toBe("cafe central");
  });
});

describe("businessToLocal", () => {
  it("maps a street-addressed business to a coords-having LocalPlace", () => {
    const atelier = DIRECTORY_PLACES.find(
      (place) => place.slug === "atelier-pulso",
    )!;
    const local = businessToLocal(atelier, true);
    expect(local.id).toBe("business:atelier-pulso");
    expect(local.kind).toBe("business");
    expect(local.category).toBe("design");
    expect(local.freguesia).toBe("Misericórdia");
    expect(local.coords).toEqual({ latitude: 38.7167, longitude: -9.149 });
    expect(local.detailPath).toBe("/local/directory/atelier-pulso");
  });

  it("gives a location-less business null coords (list-only)", () => {
    const supper = DIRECTORY_PLACES.find(
      (place) => place.slug === "queer-supper-club",
    )!;
    expect(businessToLocal(supper, true).coords).toBeNull();
  });
});

describe("venueToLocal", () => {
  it("maps a venue, folding its type into the unified category", () => {
    const finalmente = VENUES.find((venue) => venue.id === "v1")!;
    const local = venueToLocal(finalmente);
    expect(local.id).toBe("venue:v1");
    expect(local.kind).toBe("venue");
    expect(local.category).toBe("nightlife");
    expect(local.coords).toEqual({ latitude: 38.7168, longitude: -9.1489 });
    expect(local.vibe).toEqual(["mixed", "masc-leaning"]);
    expect(local.beenHere).toBe(247);
    expect(local.detailPath).toBe("/local/venue/v1");
  });
});

describe("mergeLocalPlaces", () => {
  it("folds a name-matched venue's geo/vibe/been-here into the business and drops the venue", () => {
    const businesses = DIRECTORY_PLACES.map((place) => businessToLocal(place, true));
    const venues = VENUES.map(venueToLocal);
    const merged = mergeLocalPlaces(businesses, venues);

    const navalhaEntries = merged.filter(
      (place) => place.name.toLowerCase() === "navalha",
    );
    expect(navalhaEntries).toHaveLength(1);
    const navalha = navalhaEntries[0]!;
    expect(navalha.kind).toBe("business");
    expect(navalha.coords).not.toBeNull();
    expect(navalha.vibe).toBeDefined();
    expect(navalha.beenHere).toBeDefined();
  });

  it("passes venues with no business twin through unchanged", () => {
    const businesses = DIRECTORY_PLACES.map((place) => businessToLocal(place, true));
    const venues = VENUES.map(venueToLocal);
    const merged = mergeLocalPlaces(businesses, venues);

    const tesoura = merged.find((place) => place.name === "A Tesoura");
    expect(tesoura).toBeDefined();
    expect(tesoura!.kind).toBe("venue");
  });

  it("keeps a business's own coords if it has them, even when a twin exists", () => {
    const business = businessToLocal(
      DIRECTORY_PLACES.find((place) => place.slug === "atelier-pulso")!,
      true,
    );
    const twin = {
      ...business,
      id: "venue:x",
      kind: "venue" as const,
      coords: { latitude: 0, longitude: 0 },
    };
    const merged = mergeLocalPlaces([business], [twin]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.coords).toEqual(business.coords);
  });
});

describe("filterLocalPlaces", () => {
  const places = mergeLocalPlaces(
    DIRECTORY_PLACES.map((place) => businessToLocal(place, true)),
    VENUES.map(venueToLocal),
  );

  it("returns everything when category is 'all', query empty, no vibes", () => {
    const result = filterLocalPlaces(places, {
      category: "all",
      query: "",
      vibes: [],
    });
    expect(result).toEqual(places);
  });

  it("filters by unified category", () => {
    const nightlife = filterLocalPlaces(places, {
      category: "nightlife",
      query: "",
      vibes: [],
    });
    expect(nightlife.length).toBeGreaterThan(0);
    expect(nightlife.every((place) => place.category === "nightlife")).toBe(
      true,
    );
  });

  it("matches query against name and neighbourhood, case-insensitively", () => {
    const result = filterLocalPlaces(places, {
      category: "all",
      query: "mouraria",
      vibes: [],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (place) =>
          place.name.toLowerCase().includes("mouraria") ||
          place.neighbourhood.toLowerCase().includes("mouraria"),
      ),
    ).toBe(true);
  });

  it("keeps only places matching a selected vibe (excludes vibe-less businesses)", () => {
    const result = filterLocalPlaces(places, {
      category: "all",
      query: "",
      vibes: ["trans-centred"],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((place) => (place.vibe ?? []).includes("trans-centred")),
    ).toBe(true);
  });
});
