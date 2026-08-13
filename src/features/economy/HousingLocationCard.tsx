import { lazy, Suspense } from "react";
import { FiLock, FiMapPin } from "react-icons/fi";
import { MapLoading } from "../marketing/MapLoading";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingLocation } from "./housingListings";
import s from "./housingLocationMap.module.css";

// maplibre is heavy — keep it off the entry chunk. The map only mounts on a
// listing detail page, so lazy-loading here defers the whole basemap library
// until someone actually opens a listing.
const HousingLocationMap = lazy(() =>
  import("./HousingLocationMap").then((module) => ({
    default: module.HousingLocationMap,
  })),
);

interface HousingLocationCardProps {
  location: HousingLocation;
  /** The listing title, woven into the map's screen-reader label. */
  title: string;
}

/**
 * The "Where it is" block on a housing listing. Pre-connection it shows an
 * approximate neighbourhood pin with a note that the exact address is shared
 * once you connect; once you're the owner or a connected member the backend
 * sends precise coordinates + the address, and this upgrades to the exact pin.
 */
export function HousingLocationCard({ location, title }: HousingLocationCardProps) {
  const { t } = useTranslation();
  const exact = location.precision === "exact";

  // The exact view prefers the precise point; otherwise (and as a fallback if a
  // precise point is somehow missing) we show the approximate centroid.
  const latitude = exact ? location.preciseLatitude : location.approxLatitude;
  const longitude = exact ? location.preciseLongitude : location.approxLongitude;

  // No coordinates at all (unknown area, no geocode): skip the map rather than
  // render an empty frame, but still tell the reader where — or that the exact
  // address arrives after connecting. Bundling the pair narrows both to `number`.
  const point =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;

  return (
    <div>
      {point && (
        <div className={s.mapShell}>
          <Suspense fallback={<MapLoading ready={false} />}>
            <HousingLocationMap
              latitude={point.latitude}
              longitude={point.longitude}
              precision={location.precision}
              ariaLabel={t(
                exact
                  ? "economy:housingListing.location.mapExactAria"
                  : "economy:housingListing.location.mapAreaAria",
                { title },
              )}
            />
          </Suspense>
        </div>
      )}

      {exact && location.addressLine ? (
        <div className={s.address}>
          <span className={s.addressLabel}>
            {t("economy:housingListing.location.addressLabel")}
          </span>
          <span className={s.addressValue}>{location.addressLine}</span>
        </div>
      ) : (
        <p className={s.note}>
          <FiLock className={s.noteIcon} aria-hidden />
          {t("economy:housingListing.location.approxNote")}
        </p>
      )}

      {exact && (
        <p className={s.note}>
          <FiMapPin className={s.noteIcon} aria-hidden />
          {t("economy:housingListing.location.exactNote")}
        </p>
      )}
    </div>
  );
}
