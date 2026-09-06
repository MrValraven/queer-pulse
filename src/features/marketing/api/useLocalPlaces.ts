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
  /**
   * The size of the whole population `places` is a window onto, so a caller can
   * say "showing X of Y". Live: the server-reported grand total matching the
   * current query/safe filter, which counts pages not yet fetched. Demo: the
   * merged businesses-plus-venues set, because demo is one terminal page and
   * `places` already holds all of it. Never smaller than `places.length`.
   */
  total: number;
  isLoading: boolean;
  /** True when the businesses read failed (DES-25). Callers must render an
   *  error state rather than "no places listed yet". */
  isError: boolean;
  /** Re-run the failed read, for the error state's retry. */
  refetch: () => void;
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
    isError,
    refetch,
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

  return {
    places,
    // Demo owns its own total. `total` from the businesses page counts the
    // `DIRECTORY_PLACES` fixture alone, but demo also merges the `VENUES`
    // fixture on top, and every venue with no business twin survives that
    // merge, so `places.length` exceeded it and the results header rendered
    // "Showing 30 of 24 places". Demo is a single terminal page with nothing
    // left to fetch, so the merged set IS the whole population and counting it
    // is the honest fix. Live mode keeps the server's grand total, which is
    // larger than `places.length` for the real reason: pages not fetched yet.
    total: demoMode ? places.length : total,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
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
    demoMode && id
      ? VENUES.find((candidate) => candidate.id === id)
      : undefined;
  return { venue, isLoading: false };
}
