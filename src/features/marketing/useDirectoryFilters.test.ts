import { describe, expect, it } from "vitest";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { businessToLocal, filterLocalPlaces } from "./localPlaces";
import {
  categoriesForView,
  countByCategory,
  toCategories,
  toOwned,
} from "./useDirectoryFilters";

describe("toOwned", () => {
  it("reads a stale or hand-edited URL without erroring", () => {
    expect(toOwned("bogus,women,women")).toEqual(["women"]);
  });
  it("returns canonical order", () => {
    expect(toOwned("bipoc,trans")).toEqual(["trans", "bipoc"]);
  });
  it("reads an absent param as none", () => {
    expect(toOwned(null)).toEqual([]);
  });
});

describe("toCategories", () => {
  it("keeps online and place ids, in chip order, once each", () => {
    expect(toCategories("therapy,food,bogus,food")).toEqual([
      "food",
      "therapy",
    ]);
  });
  it("reads an absent param as none", () => {
    expect(toCategories(null)).toEqual([]);
  });
});

describe("categoriesForView", () => {
  it("offers the online vocabulary on the Online tab and the place one elsewhere", () => {
    expect(categoriesForView("online")).toContain("books-music");
    expect(categoriesForView("online")).not.toContain("nightlife");
    expect(categoriesForView("list")).toContain("nightlife");
    expect(categoriesForView("map")).not.toContain("therapy");
  });
  it("keeps food on every tab, so it survives a switch either way", () => {
    expect(categoriesForView("online")).toContain("food");
    expect(categoriesForView("list")).toContain("food");
  });
});

describe("countByCategory", () => {
  const onlineListing = (slug: string, cat: string) =>
    businessToLocal({ ...DIRECTORY_PLACES[0]!, slug, cat, online: true }, true);
  const places = [
    ...DIRECTORY_PLACES.filter((place) => !place.online).map((place) =>
      businessToLocal(place, true),
    ),
    onlineListing("test-handmade-shop", "handmade"),
    onlineListing("test-apparel-shop", "apparel"),
  ];
  const listedUnder = (categoryId: string, isOnlineScope: boolean) =>
    filterLocalPlaces(places, {
      categories: [categoryId],
      query: "",
      vibes: [],
      isOnlineScope,
    }).length;

  it("counts a migrated online listing under its place chip on the List tab", () => {
    const placeCounts = countByCategory(places, false);
    expect(placeCounts.handmade).toBeUndefined();
    expect(placeCounts.apparel).toBe(1);
    expect(placeCounts.design).toBe(listedUnder("design", false));
    expect(listedUnder("design", false)).toBeGreaterThan(
      places.filter((place) => place.category === "design").length,
    );
  });

  it("shows on every chip of a tab exactly as many as that chip lists", () => {
    for (const view of ["list", "online"] as const) {
      const isOnlineScope = view === "online";
      const counts = countByCategory(places, isOnlineScope);
      for (const categoryId of categoriesForView(view)) {
        expect(counts[categoryId] ?? 0).toBe(
          listedUnder(categoryId, isOnlineScope),
        );
      }
    }
  });

  it("keeps the Online tab counting the online vocabulary", () => {
    const onlineCounts = countByCategory(places, true);
    expect(onlineCounts.handmade).toBe(listedUnder("handmade", true));
    expect(onlineCounts.handmade).toBeGreaterThanOrEqual(1);
    expect(onlineCounts.design).toBeUndefined();
  });
});
