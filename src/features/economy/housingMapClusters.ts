import type { HousingListing } from "./housingListings";
import { findHousingNeighbourhood } from "./housingNeighbourhoods";

/** One map pin: a Lisbon parish with the listings in it, positioned at the
 * shared approximate centroid. Browse pins are always area-level (never the
 * exact per-listing point), which is what keeps the map privacy-safe. */
export interface HousingCluster {
  name: string;
  latitude: number;
  longitude: number;
  listings: HousingListing[];
}

/** The id a neighbourhood's pin carries on the map. */
export function housingPinId(neighbourhood: string): string {
  return `hood:${neighbourhood}`;
}

/** The neighbourhood a pin id points at (the inverse of `housingPinId`). */
export function neighbourhoodOfPin(pinId: string): string {
  return pinId.startsWith("hood:") ? pinId.slice("hood:".length) : pinId;
}

/**
 * The parish name the map overlay uses for a listing's `hood`, matched without
 * regard to accents or case ("principe real" finds "Príncipe Real"), or null
 * when the hood is not a Lisbon parish. The overlay reports clicks by that
 * exact name, so grouping by it keeps pins, parish counts and the parish
 * selection in step.
 */
export function housingParishName(hood: string): string | null {
  return findHousingNeighbourhood(hood)?.name ?? null;
}

/**
 * Group listings into one pin per parish. A listing is placed by its
 * `location.approxLatitude/approxLongitude` (all listings in a hood share it).
 * Only listings whose hood is a Lisbon parish join a pin: a hood outside the
 * parish dataset gets a city-wide or other-city fallback point from the
 * backend, which would sit over some other parish with no bounds to select.
 * Those listings, and listings with no approximate point, stay off the map
 * and are still listed on the board. Clusters come back in descending
 * listing-count order so the busiest parishes lead the sidebar.
 */
export function buildHousingClusters(
  listings: HousingListing[],
): HousingCluster[] {
  const byHood = new Map<string, HousingCluster>();
  for (const listing of listings) {
    const { approxLatitude, approxLongitude } = listing.location;
    if (approxLatitude === null || approxLongitude === null) continue;
    const name = housingParishName(listing.hood);
    if (name === null) continue;
    const existing = byHood.get(name);
    if (existing) {
      existing.listings.push(listing);
    } else {
      byHood.set(name, {
        name,
        latitude: approxLatitude,
        longitude: approxLongitude,
        listings: [listing],
      });
    }
  }
  return [...byHood.values()].sort(
    (left, right) => right.listings.length - left.listings.length,
  );
}
