import type { HousingFilters } from "./housingFilters";

/** The collapsible filter groups in the housing board's sidebar. Order here
 *  is the render order. `useFilterPageState` builds the all-collapsed default
 *  and the stored-map guard from `HOUSING_FILTER_SECTION_KEYS`. */
export type HousingFilterSectionKey =
  "type" | "area" | "price" | "beds" | "availableBy" | "deposit" | "mustHave";

export const HOUSING_FILTER_SECTION_KEYS: readonly HousingFilterSectionKey[] = [
  "type",
  "area",
  "price",
  "beds",
  "availableBy",
  "deposit",
  "mustHave",
];

/** The yes/no narrowings of the "Must have" section, paired with their label.
 *  The sidebar's checkbox rows and the chips `useHousingActiveFilters` builds
 *  both read this one list, so a chip reads where its checkbox does. */
export const HOUSING_MUST_HAVE_OPTIONS = [
  ["billsIncluded", "economy:housing.filterBar.bills"],
  ["furnished", "economy:housing.filterBar.furnished"],
  ["petsWelcome", "economy:housing.filterBar.pets"],
  ["hasAccessibilityInfo", "economy:housing.filterBar.accessibility"],
  ["verifiedOnly", "economy:housing.filterBar.verified"],
] as const;

/** How many selections each section holds, for its header badge. A price
 *  range counts once however many of its two ends are set, matching the one
 *  chip that removes it. The neighbourhood count is the ticked rows the
 *  section draws: each distinct ticked name (one the build no longer offers
 *  included) plus the old free-text `area`, which gets a row of its own. */
export function housingSectionActiveCounts(
  filters: HousingFilters,
): Record<HousingFilterSectionKey, number> {
  const hasType = filters.type !== undefined && filters.type !== "all";
  const hasPrice =
    filters.priceMin !== undefined || filters.priceMax !== undefined;
  return {
    type: hasType ? 1 : 0,
    area: new Set(filters.areas ?? []).size + (filters.area ? 1 : 0),
    price: hasPrice ? 1 : 0,
    beds: filters.bedroomsMin !== undefined ? 1 : 0,
    availableBy: filters.availableBy ? 1 : 0,
    deposit: filters.depositMax !== undefined ? 1 : 0,
    mustHave: HOUSING_MUST_HAVE_OPTIONS.filter(([key]) => filters[key]).length,
  };
}
