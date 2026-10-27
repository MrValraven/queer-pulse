import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DirectoryMapPlaceholder } from "../../DirectoryMapPlaceholder";
import { DirectoryMobileArea } from "../../DirectoryMobileArea";
import type { DirectoryPlace } from "../../directoryPlaces";
import type { ListingKind } from "../../listBusiness/listingMobile.data";
import spaceStyles from "../../DirectorySpacePage.module.css";
import styles from "./BusinessesLocationView.module.css";

/** The visit card's heading for each kind, the listing page's own words. */
const VISIT_TITLE_KEYS: Record<ListingKind, string> = {
  place: "marketing:directory.detail.visitTitle",
  online: "marketing:directory.detail.visitTitleOnline",
  mobile: "marketing:directory.detail.visitTitleMobile",
};

/** An online-only business in place of an address, drawn as the listing
 *  page's `DirectoryPlaceOnline` draws it. */
function OnlineLine({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  return (
    <div className={spaceStyles.onlinePlace}>
      <FiGlobe aria-hidden />
      <div>
        <strong className={spaceStyles.addrName}>{place.name}</strong>
        <span>
          {place.city
            ? t("marketing:directory.detail.onlineBusinessIn", {
                city: place.city,
              })
            : t("marketing:directory.detail.onlineBusiness")}
        </span>
      </div>
    </div>
  );
}

/**
 * The location half of a sample listing page, in the listing page's own
 * visit-card styles: a place gets the map band (the decorative placeholder,
 * so the page never loads the map) over its street, an online business its
 * "Online only" line, an out-and-about one the real area block.
 */
export function BusinessesLocationView({
  place,
  kind,
}: {
  place: DirectoryPlace;
  kind: ListingKind;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.view}>
      <p className={styles.title}>{t(VISIT_TITLE_KEYS[kind])}</p>
      <div className={spaceStyles.visitShell}>
        <div className={spaceStyles.visitCard}>
          {kind === "place" && (
            <div className={`${spaceStyles.visitMap} ${styles.map}`}>
              <DirectoryMapPlaceholder />
            </div>
          )}
          <div className={spaceStyles.visitBody}>
            {kind === "place" && (
              <div className={spaceStyles.addr}>
                <span className={spaceStyles.addrStreet}>{place.address}</span>
                <span>{place.hood}</span>
              </div>
            )}
            {kind === "online" && <OnlineLine place={place} />}
            {kind === "mobile" && <DirectoryMobileArea place={place} />}
          </div>
        </div>
      </div>
    </div>
  );
}
