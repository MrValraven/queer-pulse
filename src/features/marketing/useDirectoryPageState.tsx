import { useEffect, useMemo } from "react";
import { ActiveFilters } from "../../shared/components/ui";
import {
  useMediaQuery,
  useMyLocation,
  useSimulatedLoad,
} from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdultDirectoryPlaces } from "./api/useAdultDirectoryPlaces";
import { ADULT_LISTING_CATEGORY_SLUG } from "./localCategories";
import { useLocalPlaces } from "./api/useLocalPlaces";
import {
  appendUniquePlaces,
  businessToLocal,
  filterLocalPlaces,
  localPlaceMatchesListingFacts,
} from "./localPlaces";
import {
  useDirectoryFilterParams,
  useDirectoryFilterResults,
  type DirectoryFilterParams,
} from "./useDirectoryFilters";
import type { DirectoryPlace } from "./directoryPlaces";
import { type LocalFilterFieldsProps } from "./LocalFilterFields";
import { DirectoryNearMe } from "./DirectoryNearMe";
import { useMapFallbackShownAt } from "./useMapFallbackShownAt";

/** The picked categories the results use. The 18+ category only means
 *  something while the 18+ shops are shown: a `?cat=intimacy` left in the
 *  URL would otherwise empty the Online tab's public pool. */
function useShownCategories(
  categories: string[],
  shouldDropAdult: boolean,
): string[] {
  return useMemo(
    () =>
      shouldDropAdult
        ? categories.filter(
            (category) => category !== ADULT_LISTING_CATEGORY_SLUG,
          )
        : categories,
    [categories, shouldDropAdult],
  );
}

/** The 18+ shops as local places, and how many of them the member's refine
 *  filters keep, for the header's total (the server's `total` already
 *  answers the same filters for the public pool). */
function useAdultLocals(
  adultPlaces: DirectoryPlace[],
  demoMode: boolean,
  isAdultShown: boolean,
  {
    listingFacts,
    safe,
    owned,
    access,
  }: Pick<DirectoryFilterParams, "listingFacts" | "safe" | "owned" | "access">,
) {
  // The 18+ list comes from an endpoint that takes no fact filters, so its
  // cards are narrowed here, with the server's semantics. The facet counts
  // read the candidates before that narrowing, since a lifted group (a
  // language, a way in) counts places the current choice leaves out.
  const adultCandidates = useMemo(
    () => adultPlaces.map((place) => businessToLocal(place, demoMode)),
    [adultPlaces, demoMode],
  );
  const adultLocals = useMemo(
    () =>
      adultCandidates.filter((place) =>
        localPlaceMatchesListingFacts(place, listingFacts),
      ),
    [adultCandidates, listingFacts],
  );
  const adultMatchCount = useMemo(
    () =>
      isAdultShown
        ? filterLocalPlaces(adultLocals, {
            categories: [],
            query: "",
            safe,
            owned,
            access,
            isOnlineScope: true,
          }).length
        : 0,
    [isAdultShown, adultLocals, safe, owned, access],
  );
  return { adultCandidates, adultLocals, adultMatchCount };
}

/**
 * All the state, data fetching and derived values `DirectoryPage` renders
 * from: the URL-held filter state, the paginated local-places fetch, the
 * opt-in member location, and the pieces (near-me control, active-filter
 * chips, the shared filter-field props) that both the desktop results column
 * and the mobile results header need in different slots.
 */
export function useDirectoryPageState() {
  const { demoMode } = useDemoMode();
  const { loggedIn, status } = useAuth();
  const { t } = useTranslation();
  const filterParams = useDirectoryFilterParams();
  const {
    view,
    categories,
    sort,
    listingFacts,
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
    toggleListingFact,
    setSafe,
    toggleOwned,
    setOpenNow,
    isOutAndAbout,
    toggleAccess,
    adult,
    setAdult,
    clearFilters,
  } = filterParams;
  // Known before `useLocalPlaces`, which asks for the Online tab's pool.
  const isOnlineView = view === "online";
  // Known before `useLocalPlaces` too, which sends the categories: the 18+
  // shops are an active member's own opt-in on the Online tab (see below).
  const canShowAdult = isOnlineView && loggedIn && status === "active";
  const isAdultShown = canShowAdult && adult;
  const shownCategories = useShownCategories(
    categories,
    isOnlineView && !isAdultShown,
  );
  const {
    places,
    total: serverTotal,
    isLoading: placesLoading,
    isError: isPlacesError,
    isFetchNextPageError,
    refetch: refetchPlaces,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    facets: serverFacets,
  } = useLocalPlaces({
    query,
    categories: shownCategories,
    safe,
    access,
    owned,
    online: isOnlineView,
    isOutAndAbout,
    listingFacts,
  });
  // ENG-501: a failed next page also sets `isError`. The full error state is
  // for a read that loaded nothing; once places are on screen they stay, and
  // the grid's footer reports the failed page and retries it.
  const hasPlacesError = isPlacesError && places.length === 0;
  // Opt-in, and held in memory on this device alone. Held here so one position serves
  // both the ordering and the walking times, and so turning it off is a single
  // state change that hands the previous ordering straight back.
  const myLocation = useMyLocation();
  // Where the "use my location" control lives. On desktop it sits on the row
  // above the results, beside the Filters toggle and the sort. On phones the
  // filters collapse into the Filters sheet, and distance is too central to
  // bury behind a tap, so there it stays in the results header. Both places
  // stack its privacy note under the button. `isMobile` is the breakpoint the
  // page switches its layout on, so exactly one of the two renders.
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const nearMe = <DirectoryNearMe location={myLocation} layout="stack" />;
  // The Online tab reads the server's `online=true` pool (online-only listings
  // and places that sell online), so its total and paging are the server's.
  // A position means nothing to a business with no door, so distance never
  // reorders this pool.
  //
  // The 18+ shops: an active member's own opt-in on the Online tab, read from
  // the member-only endpoint (`ActiveMemberGuard`) and merged after the public
  // pool. Signed out, or signed in to an account that is not active,
  // `?adult=1` does nothing.
  const adultDirectory = useAdultDirectoryPlaces({
    query,
    isEnabled: isAdultShown,
  });
  const isAdultLoading = isAdultShown && adultDirectory.isLoading;
  const { adultCandidates, adultLocals, adultMatchCount } = useAdultLocals(
    adultDirectory.places,
    demoMode,
    isAdultShown,
    filterParams,
  );
  // The server already narrowed the Online tab's pool to what sells online
  // (`online=true`), so nothing here re-checks that. The member's own chips
  // (categories, the refine filters) still run over it below, as on
  // every tab.
  const scopedPlaces = useMemo(
    () => (isAdultShown ? appendUniquePlaces(places, adultLocals) : places),
    [isAdultShown, places, adultLocals],
  );
  const {
    filtered,
    categoryCounts,
    chipCounts,
    mappableCount,
    activeFilters,
    distanceById,
  } = useDirectoryFilterResults(
    scopedPlaces,
    { ...filterParams, categories: shownCategories },
    isOnlineView ? null : myLocation.coordinates,
    {
      publicPlaces: places,
      // Whole once nothing is loading (a server filter change refetches from
      // scratch, with no placeholder data), the read succeeded, and no
      // further page is to come. Only a whole set may be counted in the
      // browser: a count over part of it is never drawn.
      isPublicSetComplete: !placesLoading && !isPlacesError && !hasNextPage,
      serverFacets,
      adultCandidates,
      isAdultShown,
      isAdultSettled: !adultDirectory.isLoading && !adultDirectory.isError,
    },
  );
  // `useSimulatedLoad` is a DEMO device (ENG-172). The demo registry resolves
  // in the same tick, so without a short fake beat the grid pops in with no
  // loading state at all. Live mode has a real one in `placesLoading`, and the
  // fake 600ms only painted a skeleton on top of places that had already
  // arrived, so it is gated to demo mode.
  const isSimulatedLoading = useSimulatedLoad();
  const loading = placesLoading || (demoMode && isSimulatedLoading);
  // "Show 18+ shops" reads as an active filter while it is on, so it can be
  // removed from the chips like any other.
  const activeFiltersWithAdult = useMemo(
    () =>
      isAdultShown
        ? [
            ...activeFilters,
            {
              key: "adult",
              label: t("marketing:local.filter.adultActive"),
              onRemove: () => setAdult(false),
            },
          ]
        : activeFilters,
    [isAdultShown, activeFilters, t, setAdult],
  );
  const hasActiveFilters = activeFiltersWithAdult.length > 0;
  // What is narrowing the list right now, as removable chips. Placed the same
  // way as `nearMe` above: above the results on desktop, where it answers
  // "what's on?" with the sidebar hidden too, and in the results header on
  // phones, where the sticky bar has no room for a wrapping row. Mounted even
  // with nothing active, so "Clear all" lets the row animate itself away.
  const activeFilterChips = (
    <ActiveFilters
      filters={activeFiltersWithAdult}
      onClearFilters={clearFilters}
    />
  );
  // One set of field props for the desktop sidebar, the mobile sheet and the
  // full screen map's card, so all three drive the same URL filters.
  const filterFieldProps: LocalFilterFieldsProps = {
    categories: shownCategories,
    onToggleCategory: toggleCategory,
    onClearCategories: clearCategories,
    categoryCounts,
    chipCounts,
    query,
    onQueryChange: setQuery,
    listingFacts,
    onToggleListingFact: toggleListingFact,
    safeOnly: safe === "verified",
    onToggleSafeOnly: () => setSafe(safe !== "verified"),
    owned,
    onToggleOwned: toggleOwned,
    openNow,
    onToggleOpenNow: () => setOpenNow(!openNow),
    isOutAndAbout,
    onToggleOutAndAbout: () => filterParams.setOutAndAbout(!isOutAndAbout),
    access,
    onToggleAccess: toggleAccess,
    sort,
    onSortChange: setSort,
    isLocationOn: !isOnlineView && myLocation.coordinates !== null,
    isOnlineScope: isOnlineView,
    isAdultShown,
    canShowAdult,
    onToggleAdult: () => setAdult(!adult),
  };

  // Map view has no scroll-driven "load more" of its own (unlike the list's
  // incremental reveal in `DirectoryListView`), and wants every matching pin
  // on screen, so it keeps pulling pages while the map tab is active. The Online
  // tab does the same: its constellation and chip counts read the whole
  // selling-online pool, which is only whole once every page is in. The pull
  // ends once the server reports its last page (a curated, bounded city
  // registry). A failed page pauses it until the member presses Retry, so an
  // outage is asked once.
  useEffect(() => {
    if (view === "list") return;
    if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    fetchNextPage();
  }, [
    view,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    places.length,
  ]);
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
    isFetchNextPageError,
    myLocation,
    isMobile,
    // No "use my location" on the Online tab: there is nothing to walk to.
    nearMe: isOnlineView ? undefined : nearMe,
    // The header's "of N online businesses": the server's total, plus the 18+
    // shops a member has asked for that pass the same filters.
    onlineTotal: serverTotal + adultMatchCount,
    onlineLoadedCount: scopedPlaces.length,
    isAdultError: adultDirectory.isError,
    // The 18+ list is still on its way: the Online tab and its header hold
    // their loading state, so no empty state shows before it lands.
    isAdultLoading,
    onRetryAdult: adultDirectory.refetch,
    filtered,
    mappableCount,
    activeFilters: activeFiltersWithAdult,
    distanceById,
    loading,
    hasActiveFilters,
    clearFilters,
    activeFilterChips,
    filterFieldProps,
    mapFallback,
  };
}
