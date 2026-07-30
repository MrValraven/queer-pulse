import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { VENUES, type Venue } from "../map.data";
import {
  businessToLocal,
  mergeLocalPlaces,
  venueToLocal,
  type LocalPlace,
} from "../localPlaces";
import { useDirectoryPlaces } from "./useDirectory";

/**
 * Unified source for the Local page's list + map. Businesses come from
 * useDirectoryPlaces (demo mock / live API). Venues are demo-only and merged in
 * by name (business canonical), so live mode shows businesses alone — no mock
 * venues leak into production.
 *
 * Always returns the full (unfiltered) set — the "Verified safe spaces" chip
 * (like category/query/vibe) is applied client-side in `useDirectoryFilters`'s
 * `filtered`, so the results header's "X of Y" total stays the grand total
 * instead of collapsing to "X of X" once the chip is on.
 */
export function useLocalPlaces(): LocalPlace[] {
  const { demoMode } = useDemoMode();
  const businesses = useDirectoryPlaces();

  return useMemo(() => {
    const businessLocals = businesses.map((business) =>
      businessToLocal(business, demoMode),
    );
    if (!demoMode) return businessLocals;
    const venueLocals = VENUES.map(venueToLocal);
    return mergeLocalPlaces(businessLocals, venueLocals);
  }, [businesses, demoMode]);
}

/**
 * A single venue by id, for the (demo-only) venue detail page. Live mode returns
 * undefined so the page redirects to the directory.
 */
export function useLocalVenue(id: string | undefined): {
  venue: Venue | undefined;
  isLoading: boolean;
} {
  const { demoMode } = useDemoMode();
  const venue =
    demoMode && id ? VENUES.find((candidate) => candidate.id === id) : undefined;
  return { venue, isLoading: false };
}
