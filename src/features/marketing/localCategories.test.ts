import { describe, expect, it } from "vitest";
import {
  asOnlineCategory,
  asPlaceCategory,
  LOCAL_CATEGORIES,
  LOCAL_CATEGORY_LABEL_KEYS,
  listingCategoriesFor,
  normalizeCategory,
  ONLINE_CATEGORY_FOR_PLACE_CATEGORY,
  PLACE_CATEGORY_FOR_ONLINE_CATEGORY,
} from "./localCategories";
import { CATEGORY_ICON } from "./map.data";

describe("the place categories", () => {
  it("keeps the contract's chip order with the two new slugs last", () => {
    expect([...LOCAL_CATEGORIES]).toEqual([
      "food",
      "design",
      "health",
      "space",
      "culture",
      "tech",
      "grooming",
      "fitness",
      "nightlife",
      "tours",
      "home-services",
    ]);
  });

  it("offers both new slugs to places and mobile listings, and never to online ones", () => {
    expect(listingCategoriesFor(false)).toEqual(
      expect.arrayContaining(["tours", "home-services"]),
    );
    expect(listingCategoriesFor(true)).not.toContain("tours");
    expect(listingCategoriesFor(true)).not.toContain("home-services");
  });

  it("labels and pins every place category", () => {
    for (const slug of LOCAL_CATEGORIES) {
      expect(LOCAL_CATEGORY_LABEL_KEYS[slug], slug).toMatch(/^marketing:/);
      expect(CATEGORY_ICON[slug], slug).toBeDefined();
    }
  });

  it("passes the new slugs through normalizeCategory", () => {
    expect(normalizeCategory("tours")).toBe("tours");
    expect(normalizeCategory("home-services")).toBe("home-services");
  });
});

describe("the category cross-map", () => {
  it("maps home-services to services both ways", () => {
    expect(ONLINE_CATEGORY_FOR_PLACE_CATEGORY["home-services"]).toBe(
      "services",
    );
    expect(PLACE_CATEGORY_FOR_ONLINE_CATEGORY.services).toBe("home-services");
    expect(asOnlineCategory("home-services")).toBe("services");
    expect(asPlaceCategory("services")).toBe("home-services");
  });

  it("gives tours no online counterpart", () => {
    expect(ONLINE_CATEGORY_FOR_PLACE_CATEGORY.tours).toBeUndefined();
    expect(asOnlineCategory("tours")).toBe("tours");
  });

  it("inverts with no collision, so a second place slug on one online slug fails here", () => {
    expect(Object.keys(PLACE_CATEGORY_FOR_ONLINE_CATEGORY)).toHaveLength(
      Object.keys(ONLINE_CATEGORY_FOR_PLACE_CATEGORY).length,
    );
  });
});
