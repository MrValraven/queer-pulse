import { lazy, Suspense } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useLocalPlaces } from "./api/useLocalPlaces";
import { useDirectoryFilters } from "./useDirectoryFilters";
import { LocalFilterBar } from "./LocalFilterBar";
import { DirectoryResultsHeader } from "./DirectoryResultsHeader";
import { DirectoryListView } from "./DirectoryListView";
import { DirectoryVerificationSection } from "./DirectoryVerificationSection";
import { MapLoading } from "./MapLoading";
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
  const places = useLocalPlaces();
  const loading = useSimulatedLoad();
  const {
    view,
    category,
    query,
    sort,
    vibes,
    safe,
    filtered,
    categoryCounts,
    mappableCount,
    activeFilters,
    selectView,
    setCategory,
    setQuery,
    setSort,
    toggleVibe,
    setSafe,
    clearFilters,
  } = useDirectoryFilters(places);
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <PageShell>
      <PageHero
        eyebrow={t("marketing:directory.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:directory.hero.title"
            components={{ em: <em /> }}
          />
        }
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
      />

      <DirectoryResultsHeader
        shown={filtered.length}
        total={places.length}
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
          total={places.length}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      ) : (
        <Suspense fallback={<MapLoading ready={false} />}>
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
        <Button size="lg" to={routes.requestInvite}>
          {t("marketing:directory.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
