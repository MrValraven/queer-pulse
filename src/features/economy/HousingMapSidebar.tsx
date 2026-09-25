import { FiHome, FiX } from "react-icons/fi";
import { EmptyState, LoadErrorState } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { HousingMapCard, HousingMapCardSkeleton } from "./HousingMapCard";
import type { HousingListing } from "./housingListings";
import type { HousingMapViewState } from "./useHousingMapView";
import mapStyles from "../marketing/localMap.module.css";

interface Props extends Pick<
  HousingMapViewState,
  "sidebarRef" | "selectedFreguesia" | "items" | "groups" | "selectFreguesia"
> {
  loading: boolean;
  /** True when the housing read failed. The sidebar says so instead of
   *  reading as "nothing here matches", which the map cannot tell apart. */
  isError: boolean;
  /** Re-run the failed read, wired to the error state's retry. */
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  /** The panel class, e.g. the one that floats over the map. */
  className?: string;
}

/** The housing map's sidebar: heading and count, a clear chip while a parish
 * is selected, an error or empty state, loading skeletons, or the listing
 * cards grouped by neighbourhood. Mirrors `DirectoryMapSidebar`; the parish
 * selection lives in `useHousingMapView`. */
export function HousingMapSidebar({
  sidebarRef,
  selectedFreguesia,
  items,
  groups,
  selectFreguesia,
  loading,
  isError,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  className,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const renderCard = (listing: HousingListing) => (
    <HousingMapCard key={listing.slug} listing={listing} />
  );

  return (
    <aside className={className} ref={sidebarRef}>
      <div className={mapStyles.sbTop}>
        <div>
          <div className={mapStyles.sbHeading}>
            {selectedFreguesia ?? t("economy:housing.map.sidebar.allHomes")}
          </div>
          <div className={mapStyles.sbCount}>
            <Translation
              i18nKey="economy:housing.map.sidebar.count"
              values={{ count: items.length }}
              components={{ b: <b /> }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(items.length)}
                    numericValue={items.length}
                  />
                ),
              }}
            />
          </div>
        </div>
        {selectedFreguesia && (
          <button
            type="button"
            className={mapStyles.clear}
            onClick={() => selectFreguesia(null)}
          >
            <FiX aria-hidden /> {t("marketing:map.sidebar.clear")}
          </button>
        )}
      </div>

      {!loading && isError && (
        <LoadErrorState
          compact
          onRetry={onRetry}
          title={t("economy:housing.loadError.title")}
          description={t("economy:housing.loadError.description")}
        />
      )}

      {!loading && !isError && items.length === 0 && (
        <EmptyState
          compact
          icon={<FiHome />}
          title={t("economy:housing.map.empty")}
          action={
            hasActiveFilters
              ? {
                  label: t("economy:housing.empty.clearFilters"),
                  onClick: onClearFilters,
                }
              : undefined
          }
        />
      )}

      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <HousingMapCardSkeleton key={index} />
          ))
        : groups
          ? groups.map((group) => (
              <div key={group.freguesia}>
                <div className={mapStyles.groupHead}>{group.freguesia}</div>
                {group.listings.map(renderCard)}
              </div>
            ))
          : items.map(renderCard)}
    </aside>
  );
}
