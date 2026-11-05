import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { FiArrowDown } from "react-icons/fi";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { LisbonMap } from "../marketing/LisbonMap";
import { useMapFullscreen } from "../marketing/useMapFullscreen";
import { type MapPanelEdge } from "../marketing/useLisbonMap";
import { HousingMapSidebar } from "./HousingMapSidebar";
import { useHousingMapView } from "./useHousingMapView";
import type { HousingListing } from "./housingListings";
import mapStyles from "../marketing/localMap.module.css";

/** Which map edge the list covers, for the camera padding. Desktop floats it
 *  over the right edge, or docks it along the bottom on a narrow stage. A
 *  phone stacks it below the map (no edge), until full screen turns it into
 *  a sheet over the bottom. Same rule as the directory map's. */
function housingMapPanelEdge({
  isMobile,
  isFullscreen,
  isNarrowStage,
}: {
  isMobile: boolean;
  isFullscreen: boolean;
  isNarrowStage: boolean;
}): MapPanelEdge | null {
  if (isMobile) return isFullscreen ? "bottom" : null;
  return isNarrowStage && !isFullscreen ? "bottom" : "right";
}

// The housing list carries photo-led listing cards, so it needs more map
// beside it than the directory's does. At 652px (a 1024px window with the
// filter sidebar open) the floating panel covers about 43% of the stage, so
// it docks along the bottom below 720px. A 1024px window with the sidebar
// hidden (about 932px) and 1280px and up keep the side panel. The directory's
// own threshold (useNarrowMapStage) is 640px and stays as it is.
const HOUSING_NARROW_STAGE_WIDTH = 720;

/** Same contract as the directory's `useNarrowMapStage` (measured before the
 *  first paint, `hasSwitched` true once the layout changes after that, the
 *  last answer holds while disabled), with the housing threshold above. */
function useHousingNarrowStage(
  stageRef: RefObject<HTMLElement | null>,
  { isEnabled }: { isEnabled: boolean },
) {
  const [stageLayout, setStageLayout] = useState({
    isNarrow: false,
    hasSwitched: false,
  });
  const hasMeasuredRef = useRef(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isEnabled) return;
    function measureStage() {
      if (!stage) return;
      const isNarrowNow =
        stage.getBoundingClientRect().width < HOUSING_NARROW_STAGE_WIDTH;
      const hasMeasuredBefore = hasMeasuredRef.current;
      hasMeasuredRef.current = true;
      setStageLayout((current) =>
        current.isNarrow === isNarrowNow
          ? current
          : { isNarrow: isNarrowNow, hasSwitched: hasMeasuredBefore },
      );
    }
    measureStage();
    const observer = new ResizeObserver(measureStage);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stageRef, isEnabled]);

  return stageLayout;
}

/** The housing browse map view, built on the directory map's own pieces: a
 * Lisbon map filling the results column, with one pin per neighbourhood and
 * the listings, grouped by neighbourhood, floating over its right edge
 * (docked along its bottom on a narrow stage, stacked below it on a phone).
 * Filtering happens upstream in HousingBoard; picking a parish here only
 * narrows the map and its list. */
export function HousingMapView({
  listings,
  loading,
  isError,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}: {
  listings: HousingListing[];
  loading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  const fmt = useFormat();
  const stageRef = useRef<HTMLDivElement>(null);
  // The stage holds the map AND the list, so full screen takes both along.
  const fullscreen = useMapFullscreen();
  const state = useHousingMapView(listings, {
    isFullscreen: fullscreen.isFullscreen,
  });
  // The results column beside the filters sidebar can leave the desktop stage
  // too narrow for the list beside the map, so it then docks as a drawer
  // along the bottom, as on /local (at a wider threshold). Full screen spans
  // the window, so it keeps the side panel and the last inline answer holds
  // until it closes.
  const stageLayout = useHousingNarrowStage(stageRef, {
    isEnabled: !state.isMobile && !fullscreen.isFullscreen,
  });
  const isNarrowStage = !state.isMobile && stageLayout.isNarrow;
  const panelEdge = housingMapPanelEdge({
    isMobile: state.isMobile,
    isFullscreen: fullscreen.isFullscreen,
    isNarrowStage,
  });
  const listCount = state.items.length;

  return (
    <div className={mapStyles.directoryMapBody}>
      <div
        ref={stageRef}
        className={mapStyles.stage}
        data-fullscreen={fullscreen.isFullscreen ? "true" : undefined}
        data-narrow={isNarrowStage ? "true" : undefined}
        data-layout-switched={
          stageLayout.hasSwitched && !state.isMobile ? "true" : undefined
        }
      >
        <LisbonMap
          venues={state.markers}
          freguesia={state.selectedFreguesia}
          selectedVenueId={state.selectedPinId}
          focusedVenueId={null}
          counts={state.counts}
          markerLabels={state.markerLabels}
          parishLabelAnchor="top"
          onSelectFreguesia={state.toggleFreguesia}
          onSelectVenue={state.selectPin}
          panelRef={state.sidebarRef}
          panelEdge={panelEdge}
          fullscreen={{
            isFullscreen: fullscreen.isFullscreen,
            onToggle: fullscreen.toggle,
            redrawHandleRef: fullscreen.redrawHandleRef,
            toggleButtonRef: fullscreen.toggleButtonRef,
          }}
        />

        {/* Mobile-only: the map stacks above a long list, so offer a jump
            down and the map is no dead-end scroll. Hidden on desktop, where
            the list floats over the map, and in full screen. */}
        <button
          type="button"
          className={mapStyles.jumpToList}
          onClick={state.jumpToList}
        >
          <FiArrowDown aria-hidden />
          {/* One flex item, so the button's gap stays between icon and label. */}
          <span>
            <Translation
              i18nKey="economy:housing.map.jumpToList"
              values={{ count: listCount }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(listCount)}
                    numericValue={listCount}
                  />
                ),
              }}
            />
          </span>
        </button>

        <HousingMapSidebar
          sidebarRef={state.sidebarRef}
          selectedFreguesia={state.selectedFreguesia}
          items={state.items}
          groups={state.groups}
          selectFreguesia={state.selectFreguesia}
          className={mapStyles.floatingPanel}
          loading={loading}
          isError={isError}
          onRetry={onRetry}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      </div>
    </div>
  );
}
