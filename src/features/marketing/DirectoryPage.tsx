import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo/PageMeta";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalFilterBar } from "./LocalFilterBar";
import { DirectoryResultsHeader } from "./DirectoryResultsHeader";
import { DirectoryVerificationSection } from "./DirectoryVerificationSection";
import { DirectoryHero } from "./DirectoryHero";
import { DirectoryResultsView } from "./DirectoryResultsView";
import { DirectorySubmitStrip } from "./DirectorySubmitStrip";
import { useDirectoryPageState } from "./useDirectoryPageState";

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
    myLocation,
    isMobile,
    nearMe,
    onlineTotal,
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

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:directory.meta.title")}
        description={t("marketing:directory.meta.description")}
      />
      <DirectoryHero />

      <LocalFilterBar
        {...filterFieldProps}
        view={view}
        onViewChange={selectView}
        activeFilterCount={activeFilters.length}
        resultCount={filtered.length}
        nearMeSlot={isMobile ? undefined : nearMe}
        activeFiltersSlot={isMobile ? undefined : activeFilterChips}
      />

      <DirectoryResultsHeader
        shown={filtered.length}
        total={view === "online" ? onlineTotal : serverTotal}
        loadedCount={places.length}
        hasMoreFromServer={hasNextPage}
        mappableCount={mappableCount}
        loading={loading}
        isError={hasPlacesError}
        view={view}
        nearMeSlot={isMobile ? nearMe : undefined}
        activeFiltersSlot={isMobile ? activeFilterChips : undefined}
      />

      <DirectoryResultsView
        view={view}
        filtered={filtered}
        distanceById={distanceById}
        serverTotal={serverTotal}
        onlineTotal={onlineTotal}
        loadedCount={places.length}
        loading={loading}
        hasPlacesError={hasPlacesError}
        refetchPlaces={refetchPlaces}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        fallbackShownAt={mapFallback.fallbackShownAt}
        onMapFallbackShown={mapFallback.recordFallbackShown}
        filterFieldProps={filterFieldProps}
        myLocation={myLocation}
        activeFilterChips={activeFilterChips}
      />

      <DirectoryVerificationSection />

      <DirectorySubmitStrip />
    </PageShell>
  );
}
