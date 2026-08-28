import { lazy, Suspense, useEffect } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  ActiveFilters,
  Button,
  FeatureHelp,
  Outro,
  Reveal,
} from "../../shared/components/ui";
import {
  useMediaQuery,
  useMyLocation,
  useSimulatedLoad,
} from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta } from "../../shared/seo/PageMeta";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { useLocalPlaces } from "./api/useLocalPlaces";
import {
  useDirectoryFilterParams,
  useDirectoryFilterResults,
} from "./useDirectoryFilters";
import { LocalFilterBar } from "./LocalFilterBar";
import { DirectoryNearMe } from "./DirectoryNearMe";
import { DirectoryResultsHeader } from "./DirectoryResultsHeader";
import { DirectoryListView } from "./DirectoryListView";
import { DirectoryVerificationSection } from "./DirectoryVerificationSection";
import { MapLoadingPanel } from "./MapLoading";
import s from "./DirectoryPage.module.css";

// Code-split the map view (pulls in maplibre-gl) so it stays off the entry
// chunk — it's only fetched when the visitor switches to the map tab.
const DirectoryMapView = lazy(() =>
  import("./DirectoryMapView").then((module) => ({
    default: module.DirectoryMapView,
  })),
);

export function DirectoryPage() {
  const { t } = useTranslation();
  const filterParams = useDirectoryFilterParams();
  const {
    view,
    category,
    sort,
    vibes,
    safe,
    openNow,
    access,
    query,
    selectView,
    setCategory,
    setQuery,
    setSort,
    toggleVibe,
    setSafe,
    setOpenNow,
    toggleAccess,
    clearFilters,
  } = filterParams;
  const {
    places,
    total: serverTotal,
    isLoading: placesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLocalPlaces({ query, safe, access });
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
  const loading = useSimulatedLoad() || placesLoading;
  const hasActiveFilters = activeFilters.length > 0;
  // What is narrowing the list right now, as removable chips. Placed the same
  // way as `nearMe` above: on the search row on desktop, where it answers
  // "what's on?" without opening the drawer, and in the results header on
  // phones, where the sticky bar has no room for a wrapping row.
  const activeFilterChips = hasActiveFilters ? (
    <ActiveFilters filters={activeFilters} onClearFilters={clearFilters} />
  ) : null;

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

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:directory.meta.title")}
        description={t("marketing:directory.meta.description")}
      />
      {/* Compact: this page is a search box and a result list, and the full
          display hero pushed the first places below the fold. */}
      <PageHero
        compact
        eyebrow={t("marketing:directory.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:directory.hero.title"
            components={{ em: <em /> }}
          />
        }
        titleAction={<FeatureHelp id="local.directory" />}
        sub={t("marketing:directory.hero.sub")}
      >
        <div className={s.heroNote}>
          <span className={s.live} /> {t("marketing:directory.hero.note")}
        </div>
      </PageHero>

      <LocalFilterBar
        category={category}
        onCategoryChange={setCategory}
        categoryCounts={categoryCounts}
        query={query}
        onQueryChange={setQuery}
        vibes={vibes}
        onToggleVibe={toggleVibe}
        safeOnly={safe === "verified"}
        onToggleSafeOnly={() => setSafe(safe !== "verified")}
        openNow={openNow}
        onToggleOpenNow={() => setOpenNow(!openNow)}
        access={access}
        onToggleAccess={toggleAccess}
        sort={sort}
        onSortChange={setSort}
        isLocationOn={myLocation.coordinates !== null}
        view={view}
        onViewChange={selectView}
        activeFilterCount={activeFilters.length}
        resultCount={filtered.length}
        nearMeSlot={isMobile ? undefined : nearMe}
        activeFiltersSlot={isMobile ? undefined : activeFilterChips}
      />

      <DirectoryResultsHeader
        shown={filtered.length}
        total={serverTotal}
        mappableCount={mappableCount}
        loading={loading}
        view={view}
        nearMeSlot={isMobile ? nearMe : undefined}
        activeFiltersSlot={isMobile ? activeFilterChips : undefined}
      />

      {view === "list" ? (
        <DirectoryListView
          places={filtered}
          distanceById={distanceById}
          total={serverTotal}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          hasMoreFromServer={hasNextPage}
          isLoadingMoreFromServer={isFetchingNextPage}
          onLoadMoreFromServer={fetchNextPage}
        />
      ) : (
        <Suspense
          fallback={
            <div className="wrap">
              <MapLoadingPanel />
            </div>
          }
        >
          <DirectoryMapView
            places={filtered}
            loading={loading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </Suspense>
      )}

      <DirectoryVerificationSection />

      <section className={s.content}>
        <div className="wrap">
          <Reveal className={s.submitStrip}>
            <div>
              <h3>
                <Translation
                  i18nKey="marketing:directory.submitStrip.title"
                  components={{ em: <em /> }}
                />
              </h3>
              <p>{t("marketing:directory.submitStrip.body")}</p>
            </div>
            <Button size="lg" to={routes.listBusiness}>
              {t("marketing:directory.submitStrip.cta")}
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:directory.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:directory.outro.sub")}
      >
        <Button size="lg" to={requestInvitePath("directory")}>
          {t("marketing:directory.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
