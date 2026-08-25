import { lazy, Suspense, useEffect } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, FeatureHelp, Outro, Reveal } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
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
    query,
    selectView,
    setCategory,
    setQuery,
    setSort,
    toggleVibe,
    setSafe,
    clearFilters,
  } = filterParams;
  const {
    places,
    total: serverTotal,
    isLoading: placesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLocalPlaces({ query, safe });
  const { filtered, categoryCounts, mappableCount, activeFilters } =
    useDirectoryFilterResults(places, filterParams);
  const loading = useSimulatedLoad() || placesLoading;
  const hasActiveFilters = activeFilters.length > 0;

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
      <PageHero
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
        view={view}
        onViewChange={selectView}
        activeFilterCount={activeFilters.length}
        resultCount={filtered.length}
      />

      <DirectoryResultsHeader
        shown={filtered.length}
        total={serverTotal}
        mappableCount={mappableCount}
        loading={loading}
        view={view}
        onViewChange={selectView}
        sort={sort}
        onSortChange={setSort}
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
      />

      {view === "list" ? (
        <DirectoryListView
          places={filtered}
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
