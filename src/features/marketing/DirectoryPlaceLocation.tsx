import { FiGlobe } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isPlaceGone, type DirectoryPlace } from "./directoryPlaces";
import { placeCoordinates } from "./businessCoords";
import { LocationMiniMap } from "./LocationMiniMap";
import { DirectoryMapPlaceholder } from "./DirectoryMapPlaceholder";
import s from "./DirectorySpacePage.module.css";

/**
 * The two halves of a listing's location, kept as separate components because
 * the visit card places them in separate grid cells: the map runs flush to the
 * card's left edge with no padding of its own, while the address sits inside
 * the padded details column beside it. They used to be one stacked fragment,
 * which is what left a 200px square map with its address orphaned underneath.
 *
 * Both are small enough to share a file (see component-decomposition's
 * "several small components per file" allowance).
 */

/** The map cell: the real basemap when the place has a pin, otherwise the
 *  decorative placeholder. Fills whatever cell the card gives it. */
export function DirectoryPlaceMap({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Live listings carry their pin on the DTO; demo places have it hand-placed
  // in BUSINESS_COORDS by slug (same fallback order as localPlaces.ts). When
  // neither exists (location-less listings) we keep the decorative placeholder.
  const coords = placeCoordinates(place, demoMode);

  return (
    <div className={s.visitMap}>
      {coords ? (
        <LocationMiniMap
          latitude={coords.latitude}
          longitude={coords.longitude}
          ariaLabel={t("marketing:directory.detail.mapAria", {
            name: place.name,
          })}
        />
      ) : (
        <DirectoryMapPlaceholder />
      )}
    </div>
  );
}

/** The address cell: the venue's name, then the street line under it. */
export function DirectoryPlaceAddress({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();

  // The venue is permanently closed or has moved: the map and the address stay
  // (this is where it WAS, and that is worth recording), but the address is
  // relabelled so nobody reads it as somewhere to go today. The Directions
  // action is suppressed separately in `DirectoryActionBar`.
  const isFormerAddress = isPlaceGone(place);

  // Some listings arrive with no real street address — often the venue name
  // repeated into the field. Show the address line only when it adds something
  // the bold name above it doesn't already say.
  const address = place.address?.trim();
  const showAddress =
    !!address && address.toLowerCase() !== place.name.trim().toLowerCase();

  return (
    <div className={s.addr}>
      <strong className={s.addrName}>{place.name}</strong>
      {isFormerAddress && (
        <span className={s.formerAddressTag}>
          {t("marketing:directory.detail.formerAddress")}
        </span>
      )}
      {showAddress && place.address}
    </div>
  );
}

/** The stand-in for both of the above when a business has no premises at all. */
export function DirectoryPlaceOnline({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();

  return (
    <div className={s.onlinePlace}>
      <FiGlobe aria-hidden />
      <div>
        <strong className={s.addrName}>{place.name}</strong>
        <span>{t("marketing:directory.detail.onlineBusiness")}</span>
      </div>
    </div>
  );
}
