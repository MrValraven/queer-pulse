import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MapLoading } from "../marketing/MapLoading";
import mapStyles from "../marketing/localMap.module.css";
import { useHousingNeighbourhoodMap } from "./useHousingNeighbourhoodMap";
import type { HousingCluster } from "./housingMapClusters";

/** The housing browse map: one counted pin per neighbourhood in the result set.
 * Reuses the marketing warm-Lisbon basemap + loader; clicking a pin toggles its
 * neighbourhood in the shared `areas` filter (owned by HousingBoard). */
export function HousingMap({
  clusters,
  selected,
  onSelect,
}: {
  clusters: HousingCluster[];
  selected: Set<string>;
  onSelect: (name: string) => void;
}) {
  const { t } = useTranslation();
  const { containerRef, ready, failed } = useHousingNeighbourhoodMap({
    clusters,
    selected,
    onSelect,
  });

  return (
    <div className={mapStyles.mapPanel}>
      <div
        ref={containerRef}
        className={mapStyles.mapCanvas}
        role="group"
        aria-label={t("economy:housing.map.ariaLabel")}
        aria-hidden={failed}
      />
      {!failed && <MapLoading ready={ready} />}
      {failed && (
        <div className={mapStyles.mapError} role="status">
          {t("economy:housing.map.error")}
        </div>
      )}
    </div>
  );
}
