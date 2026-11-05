import { useEffect } from "react";
import {
  FilterPageLayout,
  useFilterPageState,
} from "../../shared/components/filterPage";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { EMPTY_HOUSING_FILTERS } from "./housingFilters";
import { HOUSING_FILTER_SECTION_KEYS } from "./housingFilterSections";
import {
  useHousingFilterParams,
  useHousingView,
} from "./useHousingFilterParams";
import { useHousingActiveFilters } from "./useHousingActiveFilters";
import { useHousingListings } from "./api/useHousingListings";
import {
  HousingFilterSidebar,
  HousingFiltersSheet,
} from "./HousingFilterSidebar";
import { HousingBoardResults } from "./HousingBoardResults";

/** The Housing tab's board: the filters sidebar beside the results column,
 *  plus the mobile filters sheet. `HousingPage` renders it inside its filter
 *  page frame under the shared header, and renders the landlords, tips,
 *  subpage index and outro after the frame. */
export function HousingBoard({
  onListSpace,
}: {
  /** Opens the "List your space" modal the page owns. */
  onListSpace: () => void;
}) {
  const { demoMode } = useDemoMode();
  // Filters live in the URL, so a narrowed board is shareable, survives a
  // reload, and is what the Back button restores after opening a listing.
  const [filters, setFilters] = useHousingFilterParams();
  const activeFilters = useHousingActiveFilters({
    filters,
    onChange: setFilters,
  });
  // View-only state: the sidebar's shown/hidden choice is shared with the
  // Flatmates tab, the open sections are this tab's own.
  const {
    isMobile,
    isPanelOpen,
    togglePanel,
    sectionsOpen,
    toggleSection,
    isSheetOpen,
    openSheet,
    closeSheet,
  } = useFilterPageState({
    panelStorageKey: "qp.housing.filtersPanelOpen",
    sectionsStorageKey: "qp.housing.filterSections",
    sectionKeys: HOUSING_FILTER_SECTION_KEYS,
  });
  // The hook applies every filter (client-side in demo, server-side in live),
  // so the board renders the result directly with no second client-side
  // pass. It pages: `listings` accumulates every page loaded so far, which
  // the map view clusters from as well, so pin counts match the grid.
  const {
    listings,
    total,
    isFetching,
    isError: hasListingsError,
    refetch: refetchListings,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    facets,
    areFacetsStale,
  } = useHousingListings(filters);
  // A "Load more" fetch must not swap the whole grid for skeletons; only a
  // first load (or a filter change) does.
  //
  // `useSimulatedLoad` is a DEMO device (ENG-172). Demo listings resolve from a
  // local registry in the same tick, so the short fake beat is the only thing
  // keeping the board from popping in. Live mode already has a real loading
  // state, and the fake 600ms sat on top of it: it painted a skeleton over
  // listings that had already arrived, so it is gated to demo mode.
  const isSimulatedLoading = useSimulatedLoad();
  const isLoading = demoMode
    ? isSimulatedLoading
    : isFetching && !isFetchingNextPage;

  // The view lives in the URL too (`?view=map`), like the local directory, so
  // a map link opens on the map and a filter change keeps the member on it.
  const [view, selectView] = useHousingView();
  const isMapView = view === "map";

  // The map has no "Load more" of its own and wants every matching pin on
  // screen, so keep pulling pages while it is active. The housing registry is
  // bounded, so this stops once the server reports no more pages. A failed
  // page stops it too (a failed `fetchNextPage` also sets `isError`), and the
  // map sidebar's retry refetches every page.
  useEffect(() => {
    if (!isMapView || hasListingsError) return;
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [
    isMapView,
    hasListingsError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const clearAllFilters = () => setFilters(EMPTY_HOUSING_FILTERS);
  const sidebarProps = {
    filters,
    onChange: setFilters,
    appliedCount: activeFilters.length,
    onClearAll: clearAllFilters,
    sectionsOpen,
    onToggleSection: toggleSection,
    facets,
    areFacetsStale,
  };

  return (
    <>
      <FilterPageLayout
        isMobile={isMobile}
        isPanelOpen={isPanelOpen}
        sidebar={<HousingFilterSidebar {...sidebarProps} />}
      >
        <HousingBoardResults
          filters={filters}
          onChangeFilters={setFilters}
          activeFilters={activeFilters}
          isMobile={isMobile}
          isPanelOpen={isPanelOpen}
          onTogglePanel={togglePanel}
          onOpenSheet={openSheet}
          view={view}
          onSelectView={selectView}
          listings={listings}
          total={total}
          isLoading={isLoading}
          hasError={hasListingsError}
          onRetry={() => void refetchListings()}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onFetchNextPage={() => void fetchNextPage()}
          onListSpace={onListSpace}
        />
      </FilterPageLayout>

      {isMobile && isSheetOpen && (
        <HousingFiltersSheet
          {...sidebarProps}
          resultCount={total}
          onClose={closeSheet}
        />
      )}
    </>
  );
}
