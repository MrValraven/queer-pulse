import { useEffect } from "react";
import { ActiveFilters } from "../../shared/components/ui";
import {
  useMediaQuery,
  useMyLocation,
  useSimulatedLoad,
} from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useLocalPlaces } from "./api/useLocalPlaces";
import {
  useDirectoryFilterParams,
  useDirectoryFilterResults,
} from "./useDirectoryFilters";
import { type LocalFilterFieldsProps } from "./LocalFilterFields";
import { DirectoryNearMe } from "./DirectoryNearMe";
import { useMapFallbackShownAt } from "./useMapFallbackShownAt";

/**
 * All the state, data fetching and derived values `DirectoryPage` renders
 * from: the URL-held filter state, the paginated local-places fetch, the
 * opt-in member location, and the pieces (near-me control, active-filter
 * chips, the shared filter-field props) that both the desktop search row and
 * the mobile results header need in different slots.
 */
export function useDirectoryPageState() {
  const { demoMode } = useDemoMode();
  const filterParams = useDirectoryFilterParams();
  const {
    view,
    categories,
    sort,
    vibes,
    safe,
    owned,
    openNow,
    access,
    query,
    selectView,
    toggleCategory,
    clearCategories,
    setQuery,
    setSort,
    toggleVibe,
    setSafe,
    setWomenOwned,
    setOpenNow,
    toggleAccess,
    clearFilters,
  } = filterParams;
  const {
    places,
    total: serverTotal,
    isLoading: placesLoading,
    isError: hasPlacesError,
    refetch: refetchPlaces,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLocalPlaces({ query, safe, access, owned });
  // Opt-in, memory-only, never sent anywhere. Held here so one position serves
  // both the ordering and the walking times, and so turning it off is a single
  // state change that hands the previous ordering straight back.
  const myLocation = useMyLocation();
  // Where the "use my location" control lives. On desktop it rides the search
  // row, between the field and "Refine". On phones that row collapses into the
  // Filters sheet, and distance is too central to bury behind a tap — so there
  // it stays in the results header. Same breakpoint the bar itself switches on,
  // so exactly one of the two renders.
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const nearMe = (
    <DirectoryNearMe
      location={myLocation}
      layout={isMobile ? "stack" : "inline"}
    />
  );
  const {
    filtered,
    categoryCounts,
    mappableCount,
    activeFilters,
    distanceById,
  } = useDirectoryFilterResults(places, filterParams, myLocation.coordinates);
  // `useSimulatedLoad` is a DEMO device (ENG-172). The demo registry resolves
  // in the same tick, so without a short fake beat the grid pops in with no
  // loading state at all. Live mode has a real one in `placesLoading`, and the
  // fake 600ms only painted a skeleton on top of places that had already
  // arrived, so it is gated to demo mode.
  const isSimulatedLoading = useSimulatedLoad();
  const loading = placesLoading || (demoMode && isSimulatedLoading);
  const hasActiveFilters = activeFilters.length > 0;
  // What is narrowing the list right now, as removable chips. Placed the same
  // way as `nearMe` above: on the search row on desktop, where it answers
  // "what's on?" without opening the drawer, and in the results header on
  // phones, where the sticky bar has no room for a wrapping row. Mounted even
  // with nothing active, so "Clear all" lets the row animate itself away.
  const activeFilterChips = (
    <ActiveFilters filters={activeFilters} onClearFilters={clearFilters} />
  );
  // One set of field props for the page's bar and the full screen map's card,
  // so both drive the same URL filters.
  const filterFieldProps: LocalFilterFieldsProps = {
    categories,
    onToggleCategory: toggleCategory,
    onClearCategories: clearCategories,
    categoryCounts,
    query,
    onQueryChange: setQuery,
    vibes,
    onToggleVibe: toggleVibe,
    safeOnly: safe === "verified",
    onToggleSafeOnly: () => setSafe(safe !== "verified"),
    womenOwnedOnly: owned === "women",
    onToggleWomenOwnedOnly: () => setWomenOwned(owned !== "women"),
    openNow,
    onToggleOpenNow: () => setOpenNow(!openNow),
    access,
    onToggleAccess: toggleAccess,
    sort,
    onSortChange: setSort,
    isLocationOn: myLocation.coordinates !== null,
  };

  // Map view has no scroll-driven "load more" of its own (unlike the list's
  // incremental reveal in `DirectoryListView`), and wants every matching pin
  // on screen — so keep pulling pages while the map tab is active. This
  // terminates naturally once the server reports no more pages (a curated,
  // bounded city registry), never an unbounded fetch loop.
  useEffect(() => {
    if (view !== "map") return;
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [view, hasNextPage, isFetchingNextPage, fetchNextPage, places.length]);
  const mapFallback = useMapFallbackShownAt(view === "map");

  return {
    view,
    selectView,
    places,
    serverTotal,
    hasPlacesError,
    refetchPlaces,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    myLocation,
    isMobile,
    nearMe,
    filtered,
    mappableCount,
    activeFilters,
    distanceById,
    loading,
    hasActiveFilters,
    clearFilters,
    activeFilterChips,
    filterFieldProps,
    mapFallback,
  };
}
