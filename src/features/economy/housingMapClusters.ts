import type { HousingListing } from "./housingListings";

/** One map pin: a neighbourhood with the listings in it, positioned at the
 * shared approximate centroid. Browse pins are always area-level (never the
 * exact per-listing point) — that's what keeps the map privacy-safe. */
export interface HousingCluster {
  name: string;
  latitude: number;
  longitude: number;
  listings: HousingListing[];
}

/**
 * Group listings into one pin per neighbourhood. A listing is placed by its
 * `location.approxLatitude/approxLongitude` (all listings in a hood share it);
 * listings with no approximate point are dropped from the map (still listed).
 * Clusters come back in descending listing-count order so the busiest
 * neighbourhoods lead the sidebar.
 */
export function buildHousingClusters(
  listings: HousingListing[],
): HousingCluster[] {
  const byHood = new Map<string, HousingCluster>();
  for (const listing of listings) {
    const { approxLatitude, approxLongitude } = listing.location;
    if (approxLatitude === null || approxLongitude === null) continue;
    const existing = byHood.get(listing.hood);
    if (existing) {
      existing.listings.push(listing);
    } else {
      byHood.set(listing.hood, {
        name: listing.hood,
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
