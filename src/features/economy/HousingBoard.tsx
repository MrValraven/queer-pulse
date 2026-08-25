import { lazy, Suspense, useMemo, useState } from "react";
import { FiArrowRight, FiList, FiMap } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, Outro, Reveal, SubpageIndex } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILTERS, HOUSING_SUBPAGES, MY_HOUSING_LISTINGS_PATH } from "./housing.data";
import { anyFilterActive, EMPTY_HOUSING_FILTERS } from "./housingFilters";
import { useHousingFilterParams } from "./useHousingFilterParams";
import { useHousingListings } from "./api/useHousingListings";
import { useLandlords } from "./api/useLandlords";
import { HousingFilterBar } from "./HousingFilterBar";
import { HousingListingGrid } from "./HousingListingGrid";
import { HousingSavedSearches } from "./HousingSavedSearches";
import { HousingLandlords, HousingTips } from "./HousingSections";
import { ListSpaceModal } from "./ListSpaceModal";
import { AffirmingBaselineNote } from "./AffirmingBaseline";
import { MapLoadingPanel } from "../marketing/MapLoading";
import styles from "./HousingPage.module.css";

// Code-split the map view (pulls in maplibre-gl) so it stays off the entry
// chunk; it is only fetched when the member switches to the map tab.
const HousingMapView = lazy(() =>
  import("./HousingMapView").then((module) => ({
    default: module.HousingMapView,
  })),
);

export function HousingBoard() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Filters live in the URL, so a narrowed board is shareable, survives a
  // reload, and is what the Back button restores after opening a listing.
  const [filters, setFilters] = useHousingFilterParams();
  const [listing, setListing] = useState(false);
  const subpages = useMemo(
    () =>
      HOUSING_SUBPAGES.map((subpage) => ({
        to: subpage.to,
        label: t(subpage.labelKey),
        blurb: t(subpage.blurbKey),
      })),
    [t],
  );
  // The hook applies every filter (client-side in demo, server-side in live),
  // so the board renders the result directly — no second client-side pass. It
  // pages: `visible` accumulates every page loaded so far, which the map view
  // clusters from as well, so pin counts match the grid.
  const {
    listings: visible,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHousingListings(filters);
  const { data: landlords = [] } = useLandlords();
  // A "Load more" fetch must not swap the whole grid for skeletons — only a
  // first load (or a filter change) does.
  const loading =
    useSimulatedLoad() || (!demoMode && isFetching && !isFetchingNextPage);
  const filtered = anyFilterActive(filters);

  const setType = (type: string) => setFilters((prev) => ({ ...prev, type }));

  const [view, setView] = useState<"list" | "map">("list");

  const toggleNeighbourhood = (name: string) =>
    setFilters((prev) => {
      const current = prev.areas ?? [];
      const next = current.includes(name)
        ? current.filter((area) => area !== name)
        : [...current, name];
      return { ...prev, areas: next.length ? next : undefined };
    });

  return (
    <>
      <div className={styles.body}>
        <div className="wrap">
          <AffirmingBaselineNote className={styles.affirmingNote} />

          <div className={styles.top}>
            <Reveal as="div" className={styles.filters}>
              {FILTERS.map((filterOption) => (
                <button
                  type="button"
                  key={filterOption.value}
                  className={[
                    styles.chip,
                    filters.type === filterOption.value && styles.chipActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setType(filterOption.value)}
                >
                  {t(filterOption.labelKey)}
                </button>
              ))}
            </Reveal>
            <div className={styles.listActions}>
              <Link to={MY_HOUSING_LISTINGS_PATH} className={styles.myListingsLink}>
                {t("economy:myHousingListings.entryLink")}
              </Link>
              <Reveal
                as="button"
                className={styles.listBtn}
                delay={60}
                onClick={() => setListing(true)}
              >
                {t("economy:housing.listSpaceCta")}
              </Reveal>
            </div>
          </div>

          <HousingFilterBar filters={filters} onChange={setFilters} />

          <HousingSavedSearches onApply={setFilters} />

          <div className={styles.viewRow}>
            <div
              className={styles.viewToggle}
              role="group"
              aria-label={`${t("economy:housing.map.viewList")} / ${t("economy:housing.map.viewMap")}`}
            >
              <button
                type="button"
                className={[styles.viewToggleBtn, view === "list" && styles.viewToggleBtnOn]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <FiList aria-hidden /> {t("economy:housing.map.viewList")}
              </button>
              <button
                type="button"
                className={[styles.viewToggleBtn, view === "map" && styles.viewToggleBtnOn]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={view === "map"}
                onClick={() => setView("map")}
              >
                <FiMap aria-hidden /> {t("economy:housing.map.viewMap")}
              </button>
            </div>
          </div>

          {view === "list" ? (
            <HousingListingGrid
              loading={loading}
              visible={visible}
              filtered={filtered}
              onClearFilter={() => setFilters(EMPTY_HOUSING_FILTERS)}
              onListSpace={() => setListing(true)}
            />
          ) : (
            <Suspense fallback={<MapLoadingPanel />}>
              <HousingMapView
                listings={visible}
                selectedAreas={filters.areas ?? []}
                onToggleNeighbourhood={toggleNeighbourhood}
                onClearFilters={() => setFilters(EMPTY_HOUSING_FILTERS)}
                filtered={filtered}
              />
            </Suspense>
          )}

          {!loading && hasNextPage && (
            <div className={styles.loadMoreRow}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {t(
                  isFetchingNextPage
                    ? "economy:housing.loadingMore"
                    : "economy:housing.loadMore",
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <HousingLandlords landlords={landlords} />

      <HousingTips />

      {listing && <ListSpaceModal onClose={() => setListing(false)} />}

      <SubpageIndex
        eyebrow={t("economy:housing.subpages.eyebrow")}
        title={t("economy:housing.subpages.title")}
        items={subpages}
      />

      <Outro
        title={
          <Translation
            i18nKey="economy:housing.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:housing.outro.sub")}
      >
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => setListing(true)}
        >
          {t("economy:housing.outro.listCta")}
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          {t("economy:housing.outro.askForum")} <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </>
  );
}
