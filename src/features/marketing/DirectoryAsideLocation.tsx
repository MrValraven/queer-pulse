import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { BUSINESS_COORDS } from "./businessCoords";
import { LocationMiniMap } from "./LocationMiniMap";
import { DirectoryMapPlaceholder } from "./DirectoryMapPlaceholder";
import s from "./DirectorySpacePage.module.css";

/** The listing's location block: an "Online business" panel for an online-only
 *  listing, otherwise the mini-map (or decorative placeholder) plus the address
 *  line. Kept out of `DirectorySpaceAside` so that component stays focused. */
export function DirectoryAsideLocation({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();

  if (place.online) {
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

  // Live listings carry their pin on the DTO; demo places have it hand-placed
  // in BUSINESS_COORDS by slug (same fallback order as localPlaces.ts). When
  // neither exists (location-less listings) we keep the decorative placeholder.
  const coords =
    place.latitude != null && place.longitude != null
      ? { latitude: place.latitude, longitude: place.longitude }
      : BUSINESS_COORDS[place.slug];

  // Some listings arrive with no real street address — often the venue name
  // repeated into the field. Show the address line only when it adds something
  // the bold name above it doesn't already say.
  const address = place.address?.trim();
  const showAddress =
    !!address && address.toLowerCase() !== place.name.trim().toLowerCase();

  return (
    <>
      <div className={s.map}>
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
      <div className={s.addr}>
        <strong className={s.addrName}>{place.name}</strong>
        {showAddress && place.address}
      </div>
    </>
  );
}
