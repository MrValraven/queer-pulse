import { FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ManagedListingDTO } from "../api/listings.api";
import styles from "./ListingVisibility.module.css";

/**
 * "This listing is paused" restated at the top of the editor.
 *
 * The pause switch itself lives further down, beside the trading controls it
 * has to be told apart from. That is the right place to make the choice, and
 * the wrong place to LEARN that the choice is currently on: an owner arriving
 * to fix a phone number would not scroll that far. The failure this prevents
 * is a listing sitting invisible for weeks while its owner assumes it is live.
 *
 * Renders nothing whenever the listing is showing, and nothing at all on a
 * payload that predates the field.
 */
export function ListingHiddenBanner({
  listing,
}: {
  listing: ManagedListingDTO;
}) {
  const { t } = useTranslation();
  if (listing.directoryVisibility?.isHiddenByOwner !== true) return null;

  return (
    <p className={styles.banner} role="status">
      <span className={styles.bannerIcon} aria-hidden>
        <FiEyeOff />
      </span>
      <span className={styles.bannerText}>
        <span className={styles.bannerTitle}>
          {t("marketing:listBusiness.visibility.banner.title")}
        </span>
        {t("marketing:listBusiness.visibility.banner.body")}
      </span>
    </p>
  );
}
