import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FiArrowDown } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { type LocalPlace } from "./localPlaces";
import { LisbonMap } from "./LisbonMap";
import { DirectoryMapSidebar } from "./DirectoryMapSidebar";
import { DirectoryServerPageFooter } from "./DirectoryServerPageFooter";
import { useDirectoryMapView } from "./useDirectoryMapView";
import { useMapFullscreen } from "./useMapFullscreen";
import { type MapPanelEdge } from "./useLisbonMap";
import s from "./localMap.module.css";

/** The unified map view: a full-width Lisbon map of coords-having places with
 *  the parish-grouped list of mixed cards floating over its right edge (stacked
 *  below it on a phone). Filtering happens upstream in the shell. */
export function DirectoryMapView({
  places,
  loading,
  isError = false,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  hasMoreFromServer = false,
  isLoadingMoreFromServer = false,
  isFetchNextPageError = false,
  onLoadMoreFromServer,
  fullscreenControls,
  fallbackShownAt = null,
}: {
  places: LocalPlace[];
  loading: boolean;
  /** True when the directory read failed (DES-25), passed through to the
   *  sidebar so an outage never reads as an empty map. */
  isError?: boolean;
  /** Re-run the failed read, for the sidebar's retry. */
  onRetry?: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  /** The server holds more pages; the map tab pulls them in one by one. */
  hasMoreFromServer?: boolean;
  /** True while the next server page is in flight. */
  isLoadingMoreFromServer?: boolean;
  /** True when the latest server page failed. The pins already loaded stay;
   *  the footer under the map says so and retries that page (ENG-501). */
  isFetchNextPageError?: boolean;
  /** Fetches the next server page, or retries the one that failed. */
  onLoadMoreFromServer?: () => void;
  /** The search row shown inside the map while it is full screen on desktop,
   *  so filtering never means leaving full screen. */
  fullscreenControls?: ReactNode;
  /** When the Suspense fallback stage (DirectoryMapFallback) appeared, or
   *  null when this view mounted without one. */
  fallbackShownAt?: number | null;
}) {
  // Taking over from the fallback: its entrance and loader have been running
  // since `fallbackShownAt`, so this stage's copies resume at that point
  // (--map-loader-elapsed shifts their animation delays back). Set before
  // the first paint, so no frame shows them starting over.
  const stageRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (fallbackShownAt === null) return;
    const elapsed = Math.round(performance.now() - fallbackShownAt);
    stageRef.current?.style.setProperty("--map-loader-elapsed", `${elapsed}ms`);
  }, [fallbackShownAt]);

  // The stage holds the map AND the list, so full screen takes both along.
  const fullscreen = useMapFullscreen();
  const state = useDirectoryMapView(places, {
    isFullscreen: fullscreen.isFullscreen,
  });
  // The full screen search card, held in state so the map re-measures its
  // camera padding as the card mounts and unmounts with full screen.
  const [fullscreenControlsElement, setFullscreenControlsElement] =
    useState<HTMLDivElement | null>(null);
  // The camera keeps clear of the card's search row alone. The Refine drawer
  // opens over the map like a menu, so the map holds still while it opens
  // and closes.
  const fullscreenSearchRow = fullscreenControlsElement?.firstElementChild;
  // Desktop floats the list over the map's right edge. A phone stacks it below
  // the map, until full screen turns it into a sheet over the bottom.
  const panelEdge: MapPanelEdge | null = state.isMobile
    ? fullscreen.isFullscreen
      ? "bottom"
      : null
    : "right";

  // Full screen covers the page, so the footer moves into the stage as a
  // floating status. It shows while a page is in flight or has failed, which
  // keeps a failed server page visible with its Retry.
  const serverPageFooter =
    hasMoreFromServer && !loading && !isError && onLoadMoreFromServer ? (
      <DirectoryServerPageFooter
        isFetchingNextPage={isLoadingMoreFromServer}
        isFetchNextPageError={isFetchNextPageError}
        onLoadMore={onLoadMoreFromServer}
      />
    ) : null;

  return (
    <div className="wrap">
      <div className={s.directoryMapBody}>
        <div
          ref={stageRef}
          className={s.stage}
          data-fullscreen={fullscreen.isFullscreen ? "true" : undefined}
        >
          <LisbonMap
            venues={state.markers}
            freguesia={state.selectedFreguesia}
            selectedVenueId={state.expandedId}
            focusedVenueId={state.focusedPlace?.id ?? null}
            hoveredVenueId={state.hoveredId}
            pinStyle="portrait"
            counts={state.counts}
            highlightedFreguesias={state.highlightedFreguesias}
            onSelectFreguesia={state.toggleFreguesia}
            onSelectVenue={state.selectPlace}
            panelRef={state.sidebarRef}
            panelEdge={panelEdge}
            topPanel={
              fullscreenSearchRow instanceof HTMLElement
                ? fullscreenSearchRow
                : null
            }
            fullscreen={{
              isFullscreen: fullscreen.isFullscreen,
              onToggle: fullscreen.toggle,
              redrawHandleRef: fullscreen.redrawHandleRef,
              toggleButtonRef: fullscreen.toggleButtonRef,
            }}
          />

          {/* Full screen covers the page's search row, so on desktop the row
              comes along as a card at the top of the map. A phone's full
              screen is the bottom sheet layout, which leaves it out. */}
          {fullscreen.isFullscreen && !state.isMobile && fullscreenControls && (
            <div
              ref={setFullscreenControlsElement}
              className={s.fullscreenControls}
            >
              {fullscreenControls}
            </div>
          )}

          {/* Mobile-only: the map stacks above a long list, so offer a jump
              down and the map is no dead-end scroll. Hidden on desktop, where
              the list floats over the map, and in full screen. */}
          <button
            type="button"
            className={s.jumpToList}
            onClick={state.jumpToList}
          >
            <FiArrowDown aria-hidden />
            <Translation
              i18nKey="marketing:map.jumpToList"
              values={{ count: state.items.length }}
            />
          </button>

          <DirectoryMapSidebar
            {...state}
            className={s.floatingPanel}
            loading={loading}
            isError={isError}
            onRetry={onRetry}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />

          {fullscreen.isFullscreen &&
            serverPageFooter &&
            (isLoadingMoreFromServer || isFetchNextPageError) && (
              <div className={s.fullscreenPageStatus}>{serverPageFooter}</div>
            )}
        </div>
      </div>
      {!fullscreen.isFullscreen && serverPageFooter}
    </div>
  );
}
