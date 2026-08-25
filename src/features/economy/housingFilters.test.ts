import { describe, expect, it } from "vitest";
import { matchesHousingFilters, activeFilterCount } from "./housingFilters";
import { HOUSING_LISTINGS } from "./housingListings";

const arroios = HOUSING_LISTINGS.find((listing) => listing.hood === "Arroios")!;

describe("matchesHousingFilters — areas", () => {
  it("matches when the listing's hood is one of the selected areas", () => {
    expect(
      matchesHousingFilters(arroios, {
        type: "all",
        areas: ["Arroios", "Misericórdia"],
      }),
    ).toBe(true);
  });

  it("rejects when the listing's hood is not selected", () => {
    expect(
      matchesHousingFilters(arroios, { type: "all", areas: ["Misericórdia"] }),
    ).toBe(false);
  });

  it("counts a non-empty areas selection as one active filter", () => {
    expect(activeFilterCount({ type: "all", areas: ["Arroios"] })).toBe(1);
    expect(activeFilterCount({ type: "all", areas: [] })).toBe(0);
  });
});
