import type { HousingListingFilters } from "./api/housingListing.api";
import { FILTERS } from "./housing.data";
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

/** The type-chip values the board offers, as an allow-list for URLs: a stale or
 * hand-edited `?type=` that this build doesn't recognise falls back to "all"
 * instead of silently emptying the board. */
const HOUSING_TYPE_VALUES = new Set(FILTERS.map((option) => option.value));

/** A move-in-by date is only carried through the URL in the `YYYY-MM-DD` shape
 * the backend expects. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The board's filters written as URL query params, using the SAME key names
 * `getHousingListings` sends to the backend, so a shared link reads exactly
 * like the request behind it. Empty and default values are omitted, which keeps
 * an unfiltered board on a clean path. `page` is deliberately left out: the
 * board pages by fetching more, not by moving through the URL.
 */
export function housingFiltersToSearchParams(
  filters: HousingFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.area) params.set("area", filters.area);
  for (const area of filters.areas ?? []) params.append("areas", area);
  if (filters.priceMin !== undefined) {
    params.set("priceMin", String(filters.priceMin));
  }
  if (filters.priceMax !== undefined) {
    params.set("priceMax", String(filters.priceMax));
  }
  if (filters.bedroomsMin !== undefined) {
    params.set("bedroomsMin", String(filters.bedroomsMin));
  }
  if (filters.billsIncluded) params.set("billsIncluded", "true");
  if (filters.hasAccessibilityInfo) params.set("hasAccessibilityInfo", "true");
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  if (filters.availableBy) params.set("availableBy", filters.availableBy);
  return params;
}

/** A finite number from a query param, or undefined when the param is absent,
 * blank, or junk a hand-edited link supplied. */
function readNumberParam(
  params: URLSearchParams,
  key: string,
): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/** A boolean flag is present-and-"true" in the URL, matching what
 * `housingFiltersToSearchParams` writes; anything else reads as off. */
function readFlagParam(params: URLSearchParams, key: string): true | undefined {
  return params.get(key) === "true" ? true : undefined;
}

/**
 * The inverse of `housingFiltersToSearchParams`: rebuilds the filter set from a
 * URL so the board can be linked, reloaded, and restored by the browser's Back
 * button after opening a listing. Unknown or malformed values are dropped
 * rather than passed through, so a stale link degrades to a wider board instead
 * of an error. Params the page owns for other purposes (`tab`) are ignored.
 */
export function housingFiltersFromSearchParams(
  params: URLSearchParams,
): HousingFilters {
  const type = params.get("type");
  const area = params.get("area");
  const areas = params.getAll("areas").filter((value) => value.trim() !== "");
  const availableBy = params.get("availableBy");
  return {
    type: type && HOUSING_TYPE_VALUES.has(type) ? type : "all",
    area: area && area.trim() !== "" ? area : undefined,
    areas: areas.length > 0 ? areas : undefined,
    priceMin: readNumberParam(params, "priceMin"),
    priceMax: readNumberParam(params, "priceMax"),
    bedroomsMin: readNumberParam(params, "bedroomsMin"),
    billsIncluded: readFlagParam(params, "billsIncluded"),
    hasAccessibilityInfo: readFlagParam(params, "hasAccessibilityInfo"),
    verifiedOnly: readFlagParam(params, "verifiedOnly"),
    availableBy:
      availableBy && ISO_DATE_PATTERN.test(availableBy)
        ? availableBy
        : undefined,
  };
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
    if (
      listing.bedrooms === undefined ||
      listing.bedrooms < filters.bedroomsMin
    ) {
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
