import { describe, expect, it } from "vitest";
import {
  DIRECTORY_PLACES,
  type DirectoryPlace,
} from "../marketing/directoryPlaces";
import { hasHiddenRunByMatch, venuePickerResults } from "./venuePickerResults";

const basePlace: DirectoryPlace = {
  ...DIRECTORY_PLACES[0]!,
  online: false,
  mobile: false,
  hasOnlineShop: false,
  isAdultsOnly: false,
};

const walkInBar: DirectoryPlace = {
  ...basePlace,
  slug: "walk-in-bar",
  name: "Walk-in Bar",
  hood: "Mouraria",
  cat: "nightlife",
};

const onlineOnlyShop: DirectoryPlace = {
  ...basePlace,
  slug: "online-only-shop",
  name: "Online Only Shop",
  online: true,
};

const outAndAboutTour: DirectoryPlace = {
  ...basePlace,
  slug: "out-and-about-tour",
  name: "Out And About Tour",
  mobile: true,
};

const adultsOnlyClub: DirectoryPlace = {
  ...basePlace,
  slug: "adults-only-club",
  name: "Adults Only Club",
  isAdultsOnly: true,
};

const bookshopWithWebShop: DirectoryPlace = {
  ...basePlace,
  slug: "bookshop-with-web-shop",
  name: "Bookshop With Web Shop",
  hood: "Alfama",
  cat: "books",
  hasOnlineShop: true,
};

const allPlaces: readonly DirectoryPlace[] = [
  walkInBar,
  onlineOnlyShop,
  outAndAboutTour,
  adultsOnlyClub,
  bookshopWithWebShop,
];

function resultSlugs(query: string): string[] {
  return venuePickerResults(allPlaces, query).map((place) => place.slug);
}

describe("venuePickerResults", () => {
  it("hides an online-only listing, which has no door to walk into", () => {
    expect(resultSlugs("")).not.toContain("online-only-shop");
    expect(resultSlugs("online only")).toEqual([]);
  });

  it("hides an out-and-about listing, which has no door to walk into", () => {
    expect(resultSlugs("")).not.toContain("out-and-about-tour");
    expect(resultSlugs("out and about")).toEqual([]);
  });

  it("keeps a place that is neither online nor out and about", () => {
    expect(resultSlugs("walk-in")).toEqual(["walk-in-bar"]);
  });

  it("hides an 18+ listing", () => {
    expect(resultSlugs("")).not.toContain("adults-only-club");
    expect(resultSlugs("adults only")).toEqual([]);
  });

  it("keeps a place that also sells online", () => {
    expect(resultSlugs("")).toEqual(["walk-in-bar", "bookshop-with-web-shop"]);
  });

  it("matches the query against name, neighbourhood and category", () => {
    expect(resultSlugs("WALK-IN")).toEqual(["walk-in-bar"]);
    expect(resultSlugs("  alfama ")).toEqual(["bookshop-with-web-shop"]);
    expect(resultSlugs("nightlife")).toEqual(["walk-in-bar"]);
    expect(resultSlugs("no such venue")).toEqual([]);
  });
});

describe("hasHiddenRunByMatch", () => {
  it("is true when the query names an out-and-about or online listing", () => {
    expect(hasHiddenRunByMatch(allPlaces, "out and about")).toBe(true);
    expect(hasHiddenRunByMatch(allPlaces, "online only")).toBe(true);
  });

  it("is false for a visible place, an 18+ listing or no match", () => {
    expect(hasHiddenRunByMatch(allPlaces, "walk-in")).toBe(false);
    expect(hasHiddenRunByMatch(allPlaces, "adults only")).toBe(false);
    expect(hasHiddenRunByMatch(allPlaces, "no such venue")).toBe(false);
  });

  it("is false for an empty query", () => {
    expect(hasHiddenRunByMatch(allPlaces, "  ")).toBe(false);
  });
});
