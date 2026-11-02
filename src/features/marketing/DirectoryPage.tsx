import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo/PageMeta";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalFilterBar } from "./LocalFilterBar";
import { DirectoryResultsHeader } from "./DirectoryResultsHeader";
import type { DirectoryResultsCountProps } from "./DirectoryResultsCount";
import { DirectoryVerificationSection } from "./DirectoryVerificationSection";
import { DirectoryHeader } from "./DirectoryHeader";
import { DirectoryDesktopLayout } from "./DirectoryDesktopLayout";
import { DirectoryPartnersRow } from "./DirectoryPartnersRow";
import { DirectoryResultsView } from "./DirectoryResultsView";
import { DirectorySubmitStrip } from "./DirectorySubmitStrip";
import { useDirectoryPageState } from "./useDirectoryPageState";
import styles from "./DirectoryLayout.module.css";

export function DirectoryPage() {
  const { t } = useTranslation();
  const {
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
    nearMe,
    onlineTotal,
    onlineLoadedCount,
    isAdultError,
    isAdultLoading,
    onRetryAdult,
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
  } = useDirectoryPageState();

  // One count, two homes. On desktop it opens the row above the results,
  // across from the controls that shape them. On phones the results header
  // keeps it, with the near-me control beside it.
  const countProps: DirectoryResultsCountProps = {
    shown: filtered.length,
    total: view === "online" ? onlineTotal : serverTotal,
    loadedCount: places.length,
    hasMoreFromServer: hasNextPage,
    mappableCount,
    loading: loading || isAdultLoading,
    isError: hasPlacesError,
    view,
  };

  const results = (
    <DirectoryResultsView
      view={view}
      filtered={filtered}
      distanceById={distanceById}
      serverTotal={serverTotal}
      onlineTotal={onlineTotal}
      onlineLoadedCount={onlineLoadedCount}
      isAdultError={isAdultError}
      isAdultLoading={isAdultLoading}
      onRetryAdult={onRetryAdult}
      loadedCount={places.length}
      loading={loading}
      hasPlacesError={hasPlacesError}
      refetchPlaces={refetchPlaces}
      hasActiveFilters={hasActiveFilters}
      clearFilters={clearFilters}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetchNextPageError={isFetchNextPageError}
      fetchNextPage={fetchNextPage}
      fallbackShownAt={mapFallback.fallbackShownAt}
      onMapFallbackShown={mapFallback.recordFallbackShown}
      filterFieldProps={filterFieldProps}
      myLocation={myLocation}
      activeFilterChips={activeFilterChips}
    />
  );

  // The List tab's partners row, with two homes: under the chips on desktop,
  // and above the results header on phones, so "Showing N places" leads the
  // list itself. Only one of the two renders. The Online tab mounts its own
  // row under the "Sold online" band (DirectoryOnlineView).
  const partnersRow = (
    <DirectoryPartnersRow
      view={view}
      shownOnView="list"
      hasActiveFilters={hasActiveFilters}
      isPhone={isMobile}
    />
  );

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:directory.meta.title")}
        description={t("marketing:directory.meta.description")}
      />
      <div
        className={
          isMobile ? styles.page : `${styles.page} ${styles.pageDesktop}`
        }
      >
        <DirectoryHeader isMobile={isMobile} />

        {/* The phone toolbar stays a child of the page, so it stays stuck
            past the results and over the bands below them, as before. */}
        {isMobile && (
          <LocalFilterBar
            {...filterFieldProps}
            view={view}
            onViewChange={selectView}
            activeFilterCount={activeFilters.length}
            resultCount={filtered.length}
          />
        )}

        {/* One tree shape in both modes, so the results stay mounted when the
            window crosses the phone breakpoint. */}
        <DirectoryDesktopLayout
          isMobile={isMobile}
          mobileTopSlot={
            <>
              {partnersRow}
              <DirectoryResultsHeader
                {...countProps}
                nearMeSlot={nearMe}
                activeFiltersSlot={activeFilterChips}
              />
            </>
          }
          filterFieldProps={filterFieldProps}
          view={view}
          onViewChange={selectView}
          countProps={countProps}
          nearMeSlot={nearMe}
          activeFiltersSlot={activeFilterChips}
          partnersSlot={partnersRow}
        >
          {results}
        </DirectoryDesktopLayout>

        <DirectoryVerificationSection />

        <DirectorySubmitStrip />
      </div>
    </PageShell>
  );
}
