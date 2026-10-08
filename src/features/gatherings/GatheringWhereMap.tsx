import { lazy, Suspense } from "react";
import { MapLoading } from "../marketing/MapLoading";
import type { GatheringMapPoint } from "./gatheringLocation";
import styles from "./GatheringDetailPanels.module.css";

// maplibre is heavy, so the map stays off the gathering page's own chunk: the
// whole basemap library downloads only when a desktop reader opens a gathering
// that has somewhere to show.
const HousingLocationMap = lazy(() =>
  import("../economy/HousingLocationMap").then((module) => ({
    default: module.HousingLocationMap,
  })),
);

/** The Where panel's map: the housing listing's privacy-aware map (an exact
 *  pin or a soft area blob) in a frame that fills its grid cell. */
export function GatheringWhereMap({
  point,
  ariaLabel,
}: {
  point: GatheringMapPoint;
  ariaLabel: string;
}) {
  return (
    <div className={styles.whereMap}>
      <Suspense fallback={<MapLoading ready={false} />}>
        <HousingLocationMap
          latitude={point.latitude}
          longitude={point.longitude}
          precision={point.precision}
          ariaLabel={ariaLabel}
        />
      </Suspense>
    </div>
  );
}
