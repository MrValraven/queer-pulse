import { FiSearch, FiX } from "react-icons/fi";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { type LocalPlace } from "./localPlaces";
import { LocalPlaceCard } from "./LocalPlaceCard";
import { type DirectoryMapViewState } from "./useDirectoryMapView";
import s from "./localMap.module.css";
import p from "./DirectoryPage.module.css";

// Mirrors the real .vc: hero photo, name + rating, type/bairro, vibe pills.
function VenueCardSkeleton() {
  return (
    <div className={s.vc} aria-hidden>
      <SkeletonLine width="100%" height={140} style={{ borderRadius: 14 }} />
      <div className={p.nameRow}>
        <SkeletonLine width="55%" height={17} />
        <SkeletonLine width={48} height={12} />
      </div>
      <div className={p.metaRow}>
        <SkeletonLine width={70} height={16} style={{ borderRadius: 6 }} />
        <SkeletonLine width={60} height={12.5} />
      </div>
      <div>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="85%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={p.pillsRow}>
        <SkeletonLine width={48} height={18} style={{ borderRadius: 999 }} />
        <SkeletonLine width={62} height={18} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}

interface Props extends DirectoryMapViewState {
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

/** The map view's parish-grouped sidebar: heading + count, a clear-filter
 * chip, an empty state, loading skeletons, or the (optionally
 * freguesia-grouped) list of place cards. When a pin is tapped the whole
 * panel narrows to that one place's details. Pin↔card selection and the
 * "I've been here" tally live in `useDirectoryMapView`. */
export function DirectoryMapSidebar({
  sidebarRef,
  cardRefs,
  selectedFreguesia,
  expandedId,
  focusedPlace,
  been,
  items,
  groups,
  selectFreguesia,
  clearFocus,
  toggleExpand,
  markBeen,
  loading,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  const { t } = useTranslation();

  const renderCard = (place: LocalPlace, index: number) => (
    <div
      key={place.id}
      ref={(node) => {
        if (node) cardRefs.current.set(place.id, node);
        else cardRefs.current.delete(place.id);
      }}
    >
      <LocalPlaceCard
        place={place}
        index={index}
        expandedId={expandedId}
        been={been}
        onToggleExpand={toggleExpand}
        onMarkBeen={markBeen}
      />
    </div>
  );

  return (
    <aside className={s.sidebar} ref={sidebarRef}>
      <div className={s.sbTop}>
        <div>
          <div className={s.sbHeading}>
            {focusedPlace?.name ??
              selectedFreguesia ??
              t("marketing:map.sidebar.allVenues")}
          </div>
          <div className={s.sbCount}>
            {focusedPlace ? (
              focusedPlace.neighbourhood
            ) : (
              <Translation
                i18nKey="marketing:map.sidebar.venueCount"
                values={{ count: items.length }}
                components={{ b: <b /> }}
              />
            )}
          </div>
        </div>
        {(focusedPlace || selectedFreguesia) && (
          <button
            type="button"
            className={s.clear}
            onClick={focusedPlace ? clearFocus : () => selectFreguesia(null)}
          >
            <FiX />{" "}
            {focusedPlace
              ? t("marketing:map.sidebar.backToAll")
              : t("marketing:map.sidebar.clear")}
          </button>
        )}
      </div>

      {!loading && items.length === 0 && (
        <EmptyState
          compact
          icon={<FiSearch />}
          title={t("marketing:map.sidebar.empty")}
          action={
            hasActiveFilters
              ? {
                  label: t("marketing:directory.clearFilters"),
                  onClick: onClearFilters,
                }
              : undefined
          }
        />
      )}

      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <VenueCardSkeleton key={index} />
          ))
        : groups
          ? groups.map((group) => (
              <div key={group.freguesia}>
                <div className={s.groupHead}>{group.freguesia}</div>
                {group.places.map(renderCard)}
              </div>
            ))
          : items.map(renderCard)}
    </aside>
  );
}
