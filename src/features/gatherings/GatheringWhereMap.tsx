import { lazy, Suspense, useEffect } from "react";
import { MapLoading } from "../marketing/MapLoading";
import type { GatheringMapPoint } from "./gatheringLocation";
import styles from "./GatheringDetailPanels.module.css";

// maplibre is heavy, so the map stays off the gathering page's own chunk: the
// whole basemap library downloads only when a desktop reader opens a gathering
// that has somewhere to show.
const loadHousingLocationMap = () => import("../economy/HousingLocationMap");

const HousingLocationMap = lazy(() =>
  loadHousingLocationMap().then((module) => ({
    default: module.HousingLocationMap,
  })),
);

/** The Where panel's map: the housing listing's privacy-aware map (an exact
 *  pin or a soft area blob) in a frame that fills its grid cell. A null
 *  `point` holds the frame in the map's loader while the address the viewer
 *  holds is being located, and fetches the map's chunk alongside, so the pin
 *  can land as soon as the point arrives. */
export function GatheringWhereMap({
  point,
  ariaLabel,
}: {
  point: GatheringMapPoint | null;
  ariaLabel: string;
}) {
  const isLocating = point === null;
  useEffect(() => {
    if (isLocating) void loadHousingLocationMap();
  }, [isLocating]);

  return (
    <div className={styles.whereMap}>
      {point ? (
        <Suspense fallback={<MapLoading ready={false} />}>
          <HousingLocationMap
            latitude={point.latitude}
            longitude={point.longitude}
            precision={point.precision}
            ariaLabel={ariaLabel}
          />
        </Suspense>
      ) : (
        <MapLoading ready={false} />
      )}
    </div>
  );
}
