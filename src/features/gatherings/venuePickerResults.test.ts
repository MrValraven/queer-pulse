import { describe, expect, it } from "vitest";
import {
  DIRECTORY_PLACES,
  type DirectoryPlace,
} from "../marketing/directoryPlaces";
import { venuePickerResults } from "./venuePickerResults";

const basePlace: DirectoryPlace = {
  ...DIRECTORY_PLACES[0]!,
  online: false,
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
