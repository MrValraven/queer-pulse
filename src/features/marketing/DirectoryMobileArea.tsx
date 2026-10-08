import { FiNavigation } from "react-icons/fi";
import { intlLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  hasMeetingPoint,
  joinedPlaceNames,
  normalizeMobileDetails,
} from "./listBusiness/listingMobile.data";
import styles from "./DirectoryMobileArea.module.css";

/**
 * The head of the visit card's details for an out-and-about business:
 * where it works ("All of Lisbon", or its parishes as a list), the towns it
 * also travels to, and, when it meets people at a set spot, the "Meeting
 * point" subhead the address and directions sit under.
 */
export function DirectoryMobileArea({ place }: { place: DirectoryPlace }) {
  const { t, language } = useTranslation();
  const details = normalizeMobileDetails(place.mobileDetails);
  const isAllOfCity = details.allOfCity || details.parishes.length === 0;
  return (
    <div className={styles.area}>
      <div className={styles.areaRow}>
        <FiNavigation className={styles.icon} aria-hidden />
        <div className={styles.areaText}>
          {isAllOfCity ? (
            <strong className={styles.areaLead}>
              {t("marketing:directory.detail.mobile.allOfLisbon")}
            </strong>
          ) : (
            <ul
              className={styles.parishList}
              aria-label={t("marketing:directory.detail.mobile.parishesAria")}
            >
              {details.parishes.map((parish) => (
                <li key={parish}>{parish}</li>
              ))}
            </ul>
          )}
          {details.alsoTravelsTo.length > 0 && (
            <span className={styles.travels}>
              {t("marketing:directory.detail.mobile.alsoTravelsTo", {
                places: joinedPlaceNames(
                  details.alsoTravelsTo,
                  intlLocale(language),
                ),
              })}
            </span>
          )}
        </div>
      </div>
      {hasMeetingPoint(place) && (
        <h3 className={styles.meetingPointHead}>
          {t("marketing:directory.detail.mobile.meetingPoint")}
        </h3>
      )}
    </div>
  );
}
