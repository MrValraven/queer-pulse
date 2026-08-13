import type { HousingListingFilters } from "./api/housingListing.api";
import type { HousingListing } from "./housingListings";

/**
 * The directory filter set the board builds and the saved searches store —
 * `HousingListingFilters` from the api layer (mirrors the backend
 * `BrowseHousingListingsQuery`). Re-exported here so filter UI + demo matching
 * import one name.
 */
export type HousingFilters = HousingListingFilters;

export const EMPTY_HOUSING_FILTERS: HousingFilters = { type: "all" };

/** Which filters (beyond the type chip) are actually narrowing the board. */
export function activeFilterCount(filters: HousingFilters): number {
  let count = 0;
  if (filters.priceMin !== undefined) count += 1;
  if (filters.priceMax !== undefined) count += 1;
  if (filters.area) count += 1;
  if (filters.areas && filters.areas.length > 0) count += 1;
  if (filters.bedroomsMin !== undefined) count += 1;
  if (filters.billsIncluded) count += 1;
  if (filters.hasAccessibilityInfo) count += 1;
  if (filters.verifiedOnly) count += 1;
  if (filters.availableBy) count += 1;
  return count;
}

/** Any narrowing at all, including the type chip — drives the grid's
 * "clear filters" empty state. */
export function anyFilterActive(filters: HousingFilters): boolean {
  return (
    (filters.type !== undefined && filters.type !== "all") ||
    activeFilterCount(filters) > 0
  );
}

/** The numeric monthly-ish rent parsed from a demo fixture's `price` string
 * ("€1,100" → 1100). Live listings are filtered server-side, so this only runs
 * on fixtures. */
function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9]/g, "")) || 0;
}

/**
 * The client-side mirror of the backend directory filter, used ONLY in demo
 * mode (live mode filters server-side). Evaluates each active filter against a
 * fixture; an absent field is treated the same way the backend treats a missing
 * column (e.g. no bedroom count can't satisfy a minimum-beds filter).
 */
export function matchesHousingFilters(
  listing: HousingListing,
  filters: HousingFilters,
): boolean {
  if (filters.type && filters.type !== "all" && listing.type !== filters.type) {
    return false;
  }
  if (filters.areas && filters.areas.length > 0) {
    const hood = listing.hood.trim().toLowerCase();
    const anyMatch = filters.areas.some(
      (area) => area.trim().toLowerCase() === hood,
    );
    if (!anyMatch) return false;
  } else if (filters.area) {
    const needle = filters.area.trim().toLowerCase();
    if (needle && !listing.hood.toLowerCase().includes(needle)) return false;
  }
  const price = parsePrice(listing.price);
  if (filters.priceMin !== undefined && price < filters.priceMin) return false;
  if (filters.priceMax !== undefined && price > filters.priceMax) return false;
  if (filters.bedroomsMin !== undefined) {
    if (listing.bedrooms === undefined || listing.bedrooms < filters.bedroomsMin) {
      return false;
    }
  }
  if (filters.billsIncluded && !listing.billsIncluded) return false;
  if (filters.hasAccessibilityInfo && !listing.accessibilityInfo) return false;
  if (filters.verifiedOnly && !listing.verified) return false;
  // `availableBy` is applied server-side in live mode; demo fixtures carry a
  // human `avail` label ("1 Jul", "Now"), not a real date, so it isn't
  // evaluated here — it never narrows the demo board.
  return true;
}
