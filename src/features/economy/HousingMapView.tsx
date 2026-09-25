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

/** The housing browse map view, built on the directory map's own pieces: a
 * full-width Lisbon map with one pin per neighbourhood and the listings,
 * grouped by neighbourhood, floating over its right edge (stacked below it on
 * a phone). Filtering happens upstream in HousingBoard; picking a parish here
 * only narrows the map and its list. */
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
  // The stage holds the map AND the list, so full screen takes both along.
  const fullscreen = useMapFullscreen();
  const state = useHousingMapView(listings, {
    isFullscreen: fullscreen.isFullscreen,
  });
  // Desktop floats the list over the map's right edge. A phone stacks it below
  // the map, until full screen turns it into a sheet over the bottom.
  const panelEdge: MapPanelEdge | null = state.isMobile
    ? fullscreen.isFullscreen
      ? "bottom"
      : null
    : "right";
  const listCount = state.items.length;

  return (
    <div className="wrap">
      <div className={mapStyles.directoryMapBody}>
        <div
          className={mapStyles.stage}
          data-fullscreen={fullscreen.isFullscreen ? "true" : undefined}
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
    </div>
  );
}
