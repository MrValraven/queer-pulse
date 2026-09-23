import { useRef } from "react";
import { FiArrowDown } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { type LocalPlace } from "./localPlaces";
import { LisbonMap } from "./LisbonMap";
import { DirectoryMapSidebar } from "./DirectoryMapSidebar";
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
}) {
  // The stage holds the map AND the list, so full screen takes both along.
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useMapFullscreen(stageRef);
  const state = useDirectoryMapView(places, {
    isFullscreen: fullscreen.isFullscreen,
  });
  // Desktop floats the list over the map's right edge. A phone stacks it below
  // the map, until full screen turns it into a sheet over the bottom.
  const panelEdge: MapPanelEdge | null = state.isMobile
    ? fullscreen.isFullscreen
      ? "bottom"
      : null
    : "right";

  return (
    <div className="wrap">
      <div className={s.directoryMapBody}>
        <div
          ref={stageRef}
          className={s.stage}
          data-fullscreen={fullscreen.isFullscreen ? "true" : undefined}
          data-fullscreen-mode={fullscreen.mode ?? undefined}
        >
          <LisbonMap
            venues={state.markers}
            freguesia={state.selectedFreguesia}
            selectedVenueId={state.expandedId}
            focusedVenueId={state.focusedPlace?.id ?? null}
            counts={state.counts}
            onSelectFreguesia={state.toggleFreguesia}
            onSelectVenue={state.selectPlace}
            panelRef={state.sidebarRef}
            panelEdge={panelEdge}
            fullscreen={{
              isFullscreen: fullscreen.isFullscreen,
              onToggle: fullscreen.toggle,
            }}
          />

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
        </div>
      </div>
    </div>
  );
}
