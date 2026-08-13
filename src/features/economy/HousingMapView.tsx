import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowDown, FiHome } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { buildHousingClusters } from "./housingMapClusters";
import { HousingMap } from "./HousingMap";
import type { HousingListing } from "./housingListings";
import mapStyles from "../marketing/localMap.module.css";
import s from "./HousingPage.module.css";

/** The housing browse map view: `HousingMap` beside a scrollable sidebar of the
 * same listings grouped by neighbourhood, mirroring the directory's
 * `DirectoryMapView` shell (mobile jump-to-list, reduced-motion, empty state
 * with clear-filters). Each sidebar listing links to its detail page. */
export function HousingMapView({
  listings,
  selectedAreas,
  onToggleNeighbourhood,
  onClearFilters,
  filtered,
}: {
  listings: HousingListing[];
  selectedAreas: string[];
  onToggleNeighbourhood: (name: string) => void;
  onClearFilters: () => void;
  filtered: boolean;
}) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const sidebarRef = useRef<HTMLElement | null>(null);
  const clusters = useMemo(() => buildHousingClusters(listings), [listings]);
  const selected = useMemo(() => new Set(selectedAreas), [selectedAreas]);
  const scrollBehavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

  const jumpToList = () =>
    sidebarRef.current?.scrollIntoView({ behavior: scrollBehavior });

  return (
    <div className="wrap">
      <div className={mapStyles.body}>
        <HousingMap
          clusters={clusters}
          selected={selected}
          onSelect={onToggleNeighbourhood}
        />

        <button type="button" className={mapStyles.jumpToList} onClick={jumpToList}>
          <FiArrowDown aria-hidden />
          {t("economy:housing.map.jumpToList", { count: listings.length })}
        </button>

        <aside className={mapStyles.sidebar} ref={sidebarRef}>
          {clusters.length === 0 ? (
            <EmptyState
              compact
              icon={<FiHome />}
              title={t("economy:housing.map.empty")}
              action={
                filtered
                  ? {
                      label: t("economy:housing.empty.clearFilters"),
                      onClick: onClearFilters,
                    }
                  : undefined
              }
            />
          ) : (
            clusters.map((cluster) => (
              <div key={cluster.name}>
                <div className={mapStyles.groupHead}>
                  {cluster.name}
                  {" · "}
                  {t("economy:housing.map.count", { count: cluster.listings.length })}
                </div>
                {cluster.listings.map((listing) => (
                  <Link
                    key={listing.slug}
                    to={`${routes.housing}/${listing.slug}`}
                    className={s.mapListItem}
                  >
                    <span className={s.mapListTitle}>{listing.title}</span>
                    <span className={s.mapListMeta}>
                      {listing.price} / {listing.period} · {listing.beds}
                    </span>
                  </Link>
                ))}
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
