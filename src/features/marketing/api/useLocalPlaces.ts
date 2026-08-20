import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { VENUES, type Venue } from "../map.data";
import {
  businessToLocal,
  mergeLocalPlaces,
  venueToLocal,
  type LocalPlace,
} from "../localPlaces";
import {
  useDirectoryPlacesPage,
  type DirectoryPlacesPageFilters,
} from "./useDirectory";

export interface LocalPlacesResult {
  places: LocalPlace[];
  /** Server-reported grand total matching the current query/safe filter. */
  total: number;
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

/**
 * Unified, paginated source for the Local page's list + map (gap-audit
 * HSG-5). Businesses come from `useDirectoryPlacesPage` (demo mock / live,
 * server-filtered + paginated API) — `query`/`safe` are forwarded so the
 * network fetch matches what's actually being searched for instead of every
 * live listing unfiltered. Venues are demo-only and merged in by name
 * (business canonical), so live mode shows businesses alone — no mock venues
 * leak into production.
 *
 * `category`/`vibe` stay client-side filters over whatever's been loaded so
 * far (see `useDirectoryFilters`) — `category` so its chip counts stay
 * correct against the loaded set, `vibe` because it's a demo-only concept
 * (see `LocalFilterFields`'s `useDemoMode` gate).
 */
export function useLocalPlaces(
  filters: DirectoryPlacesPageFilters = {},
): LocalPlacesResult {
  const { demoMode } = useDemoMode();
  const {
    places: businesses,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useDirectoryPlacesPage(filters);

  const places = useMemo(() => {
    const businessLocals = businesses.map((business) =>
      businessToLocal(business, demoMode),
    );
    if (!demoMode) return businessLocals;
    const venueLocals = VENUES.map(venueToLocal);
    return mergeLocalPlaces(businessLocals, venueLocals);
  }, [businesses, demoMode]);

  return { places, total, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage };
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
