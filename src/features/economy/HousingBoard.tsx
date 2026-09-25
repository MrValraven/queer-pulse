import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  Button,
  LoadErrorState,
  Outro,
  Reveal,
  SubpageIndex,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  FILTERS,
  HOUSING_SUBPAGES,
  MY_HOUSING_LISTINGS_PATH,
} from "./housing.data";
import { anyFilterActive, EMPTY_HOUSING_FILTERS } from "./housingFilters";
import {
  useHousingFilterParams,
  useHousingView,
} from "./useHousingFilterParams";
import { useHousingListings } from "./api/useHousingListings";
import { useLandlords } from "./api/useLandlords";
import { HousingFilterBar } from "./HousingFilterBar";
import { HousingListingGrid } from "./HousingListingGrid";
import { HousingSavedSearches } from "./HousingSavedSearches";
import { HousingViewToggle } from "./HousingViewToggle";
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
    isError: hasListingsError,
    refetch: refetchListings,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHousingListings(filters);
  const { data: landlords = [] } = useLandlords();
  // A "Load more" fetch must not swap the whole grid for skeletons — only a
  // first load (or a filter change) does.
  //
  // `useSimulatedLoad` is a DEMO device (ENG-172). Demo listings resolve from a
  // local registry in the same tick, so the short fake beat is the only thing
  // keeping the board from popping in. Live mode already has a real loading
  // state, and the fake 600ms sat on top of it: it painted a skeleton over
  // listings that had already arrived, so it is gated to demo mode.
  const isSimulatedLoading = useSimulatedLoad();
  const loading = demoMode
    ? isSimulatedLoading
    : isFetching && !isFetchingNextPage;
  const filtered = anyFilterActive(filters);

  const setType = (type: string) => setFilters((prev) => ({ ...prev, type }));

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
              <Link
                to={MY_HOUSING_LISTINGS_PATH}
                className={styles.myListingsLink}
              >
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

          <HousingFilterBar
            filters={filters}
            onChange={setFilters}
            viewSlot={
              <HousingViewToggle view={view} onSelectView={selectView} />
            }
          />

          <HousingSavedSearches onApply={setFilters} />

          {isMapView ? (
            // The map stays up through a failed fetch; its sidebar carries the
            // error, retry and loading states, like the directory's map.
            <Suspense fallback={<MapLoadingPanel />}>
              <HousingMapView
                listings={visible}
                loading={loading}
                isError={hasListingsError}
                onRetry={() => void refetchListings()}
                hasActiveFilters={filtered}
                onClearFilters={() => setFilters(EMPTY_HOUSING_FILTERS)}
              />
            </Suspense>
          ) : hasListingsError && !loading ? (
            // The directory is this page's main content, so a failed fetch says
            // so instead of "nothing matches your filters" (DES-22).
            <LoadErrorState
              title={t("economy:housing.loadError.title")}
              description={t("economy:housing.loadError.description")}
              onRetry={() => void refetchListings()}
            />
          ) : (
            <HousingListingGrid
              loading={loading}
              visible={visible}
              filtered={filtered}
              onClearFilter={() => setFilters(EMPTY_HOUSING_FILTERS)}
              onListSpace={() => setListing(true)}
            />
          )}

          {!isMapView && !loading && hasNextPage && (
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
