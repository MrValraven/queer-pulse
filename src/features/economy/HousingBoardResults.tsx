import { lazy, Suspense, type ReactNode } from "react";
import {
  Button,
  Collapse,
  LoadErrorState,
  SkeletonLine,
  type ActiveFilter,
} from "../../shared/components/ui";
import {
  AppliedChipsRow,
  FilterResultsTop,
  FiltersToggleButton,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  anyFilterActive,
  EMPTY_HOUSING_FILTERS,
  type HousingFilters,
} from "./housingFilters";
import type { HousingListing } from "./housingListings";
import type { HousingView } from "./useHousingFilterParams";
import { AffirmingBaselineNote } from "./AffirmingBaseline";
import { HousingListingGrid } from "./HousingListingGrid";
import { HousingSavedSearches } from "./HousingSavedSearches";
import { HousingSaveSearch } from "./HousingSaveSearch";
import { HousingViewToggle } from "./HousingViewToggle";
import { MapLoadingPanel } from "../marketing/MapLoading";
import styles from "./HousingPage.module.css";

// Code-split the map view (pulls in maplibre-gl) so it stays off the entry
// chunk; it is only fetched when the member switches to the map tab.
const HousingMapView = lazy(() =>
  import("./HousingMapView").then((module) => ({
    default: module.HousingMapView,
  })),
);

export interface HousingBoardResultsProps {
  filters: HousingFilters;
  onChangeFilters: (next: HousingFilters) => void;
  /** Every applied narrowing, as removable chips. */
  activeFilters: ActiveFilter[];
  isMobile: boolean;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onOpenSheet: () => void;
  view: HousingView;
  onSelectView: (next: HousingView) => void;
  listings: HousingListing[];
  /** Every matching listing, loaded or not, for the count. */
  total: number;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onListSpace: () => void;
}

/** The housing board's results column: the affirming baseline note, the
 *  count row with the Filters button and the List/Map switch ("My listings"
 *  and "List your space" sit in the page header), the applied chips with "Save search" at their end, the
 *  saved searches, then the listing grid or the map and the pager. */
export function HousingBoardResults({
  filters,
  onChangeFilters,
  activeFilters,
  isMobile,
  isPanelOpen,
  onTogglePanel,
  onOpenSheet,
  view,
  onSelectView,
  listings,
  total,
  isLoading,
  hasError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onListSpace,
}: HousingBoardResultsProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isMapView = view === "map";
  const isFiltered = anyFilterActive(filters);
  const clearFilters = () => onChangeFilters(EMPTY_HOUSING_FILTERS);
  const isLoadMoreShown = !isMapView && !isLoading && hasNextPage;
  // The count is a claim about the board, so it waits for one: a shimmer
  // while listings load (a first live load reports a total of 0 until the
  // answer lands), and nothing after a first load that failed with nothing
  // on the board, where the error state speaks for it.
  let resultCount: ReactNode = null;
  if (isLoading) {
    resultCount = <SkeletonLine width={120} height={20} />;
  } else if (!hasError || listings.length > 0) {
    resultCount = (
      <Translation
        i18nKey="economy:housing.resultCount"
        values={{ count: total }}
        slots={{
          count: (
            <b>
              <em>
                <RollingNumber value={fmt.number(total)} numericValue={total} />
              </em>
            </b>
          ),
        }}
      />
    );
  }

  return (
    <div className={styles.results}>
      {/* The affirming baseline is the board's standing rule, so it leads the
          results whatever the filters say. */}
      <AffirmingBaselineNote className={styles.affirmingNote} />

      <FilterResultsTop
        count={resultCount}
        filtersButton={
          <FiltersToggleButton
            isMobile={isMobile}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            onOpenSheet={onOpenSheet}
            activeCount={activeFilters.length}
          />
        }
        controls={<HousingViewToggle view={view} onSelectView={onSelectView} />}
      />

      <AppliedChipsRow
        // Every housing chip label is a plain translated string or a
        // neighbourhood name; the key is only a fallback the board never hits.
        chips={activeFilters.map((activeFilter) => ({
          key: activeFilter.key,
          label:
            typeof activeFilter.label === "string"
              ? activeFilter.label
              : activeFilter.key,
          onRemove: activeFilter.onRemove,
        }))}
        trailing={
          <HousingSaveSearch filters={filters} disabled={!isFiltered} />
        }
      />

      <HousingSavedSearches onApply={onChangeFilters} />

      {isMapView ? (
        // The map stays up through a failed fetch; its sidebar carries the
        // error, retry and loading states, like the directory's map.
        <Suspense fallback={<MapLoadingPanel />}>
          <HousingMapView
            listings={listings}
            loading={isLoading}
            isError={hasError}
            onRetry={onRetry}
            hasActiveFilters={isFiltered}
            onClearFilters={clearFilters}
          />
        </Suspense>
      ) : hasError && !isLoading ? (
        // The directory is this page's main content, so a failed fetch says
        // so plainly, apart from "nothing matches your filters" (DES-22).
        <LoadErrorState
          title={t("economy:housing.loadError.title")}
          description={t("economy:housing.loadError.description")}
          onRetry={onRetry}
        />
      ) : (
        <HousingListingGrid
          loading={isLoading}
          visible={listings}
          filtered={isFiltered}
          onClearFilter={clearFilters}
          onListSpace={onListSpace}
        />
      )}

      <Collapse isOpen={isLoadMoreShown}>
        <div className={styles.loadMoreRow}>
          <Button
            type="button"
            variant="ghost"
            onClick={onFetchNextPage}
            disabled={isFetchingNextPage}
          >
            {t(
              isFetchingNextPage
                ? "economy:housing.loadingMore"
                : "economy:housing.loadMore",
            )}
          </Button>
        </div>
      </Collapse>
    </div>
  );
}
