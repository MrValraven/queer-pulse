import { lazy, Suspense, type ReactNode } from "react";
import { type MyLocation } from "../../shared/hooks";
import { DirectoryNearMe } from "./DirectoryNearMe";
import { DirectoryListView } from "./DirectoryListView";
import { DirectoryMapFallback } from "./DirectoryMapFallback";
import { DirectoryOnlineView } from "./DirectoryOnlineView";
import { type DirectoryView } from "./useDirectoryFilters";
import {
  LocalFilterFields,
  type LocalFilterFieldsProps,
} from "./LocalFilterFields";
import { type LocalPlace } from "./localPlaces";

// Code-split the map view (pulls in maplibre-gl) so it stays off the entry
// chunk — it's only fetched when the visitor switches to the map tab.
const DirectoryMapView = lazy(() =>
  import("./DirectoryMapView").then((module) => ({
    default: module.DirectoryMapView,
  })),
);

interface DirectoryResultsViewProps {
  view: DirectoryView;
  filtered: LocalPlace[];
  distanceById: ReadonlyMap<string, number> | null;
  serverTotal: number;
  /** How many online-only businesses are loaded, before any filter. */
  onlineTotal: number;
  loadedCount: number;
  loading: boolean;
  /** The read failed with no place loaded (ENG-501). */
  hasPlacesError: boolean;
  refetchPlaces: () => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** The latest next page failed; the loaded places stay on screen. */
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
  fallbackShownAt: number | null;
  onMapFallbackShown: (shownAt: number) => void;
  filterFieldProps: LocalFilterFieldsProps;
  myLocation: MyLocation;
  activeFilterChips: ReactNode;
}

/** The directory's main results area: the incremental-reveal list; on the
 *  map tab, the code-split map view (with its own loading stage that hands
 *  off to the real view mid-animation); or, on the online tab, the
 *  constellation of businesses that have no door to pin. */
export function DirectoryResultsView({
  view,
  filtered,
  distanceById,
  serverTotal,
  onlineTotal,
  loadedCount,
  loading,
  hasPlacesError,
  refetchPlaces,
  hasActiveFilters,
  clearFilters,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  fetchNextPage,
  fallbackShownAt,
  onMapFallbackShown,
  filterFieldProps,
  myLocation,
  activeFilterChips,
}: DirectoryResultsViewProps) {
  if (view === "online") {
    // Online businesses can sit on any page, so a failed page before the first
    // one arrives leaves this tab with nothing to show: that reads as the
    // error state, and its retry fetches the failed page.
    const hasNoOnlinePlacesError = isFetchNextPageError && onlineTotal === 0;
    return (
      <DirectoryOnlineView
        places={filtered}
        total={onlineTotal}
        loading={
          loading || (hasNextPage && !isFetchNextPageError && onlineTotal === 0)
        }
        isError={hasPlacesError || hasNoOnlinePlacesError}
        onRetry={hasPlacesError ? refetchPlaces : fetchNextPage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        hasMoreFromServer={hasNextPage}
        isLoadingMoreFromServer={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        onLoadMoreFromServer={fetchNextPage}
      />
    );
  }

  if (view === "list") {
    return (
      <DirectoryListView
        places={filtered}
        distanceById={distanceById}
        total={serverTotal}
        loadedCount={loadedCount}
        loading={loading}
        isError={hasPlacesError}
        onRetry={refetchPlaces}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        hasMoreFromServer={hasNextPage}
        isLoadingMoreFromServer={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        onLoadMoreFromServer={fetchNextPage}
      />
    );
  }

  return (
    <Suspense fallback={<DirectoryMapFallback onShown={onMapFallbackShown} />}>
      <DirectoryMapView
        fallbackShownAt={fallbackShownAt}
        places={filtered}
        loading={loading}
        isError={hasPlacesError}
        onRetry={refetchPlaces}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        hasMoreFromServer={hasNextPage}
        isLoadingMoreFromServer={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        onLoadMoreFromServer={fetchNextPage}
        fullscreenControls={
          <LocalFilterFields
            {...filterFieldProps}
            variant="overlay"
            nearMeSlot={
              <DirectoryNearMe location={myLocation} layout="inline" />
            }
            activeFiltersSlot={activeFilterChips}
          />
        }
      />
    </Suspense>
  );
}
