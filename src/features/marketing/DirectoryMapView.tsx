import { FiArrowDown } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { type LocalPlace } from "./localPlaces";
import { LisbonMap } from "./LisbonMap";
import { DirectoryMapSidebar } from "./DirectoryMapSidebar";
import { useDirectoryMapView } from "./useDirectoryMapView";
import s from "./localMap.module.css";

/** The unified map view: Lisbon map of coords-having places + a parish-grouped sidebar of mixed cards. Filtering happens upstream in the shell. */
export function DirectoryMapView({
  places,
  loading,
  hasActiveFilters,
  onClearFilters,
}: {
  places: LocalPlace[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  const state = useDirectoryMapView(places);

  return (
    <div className="wrap">
      <div className={s.body}>
        <LisbonMap
          venues={state.markers}
          freguesia={state.selectedFreguesia}
          selectedVenueId={state.expandedId}
          focusedVenueId={state.focusedPlace?.id ?? null}
          counts={state.counts}
          onSelectFreguesia={state.toggleFreguesia}
          onSelectVenue={state.selectPlace}
        />

        {/* Mobile-only: the map stacks above a long list — offer a jump down so
            the map isn't a dead-end scroll. Hidden on desktop (side-by-side). */}
        <button type="button" className={s.jumpToList} onClick={state.jumpToList}>
          <FiArrowDown aria-hidden />
          <Translation
            i18nKey="marketing:map.jumpToList"
            values={{ count: state.items.length }}
          />
        </button>

        <DirectoryMapSidebar
          {...state}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      </div>
    </div>
  );
}
