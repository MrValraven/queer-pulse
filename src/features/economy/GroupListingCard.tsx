import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupListing } from "./housingGroups.data";
import styles from "./HousingGroupsPage.module.css";

/**
 * One norm-compliant room inside a vetted group: title, price, neighbourhood,
 * description, and the accessibility line the group requires.
 *
 * Read-only on purpose. The public listings payload never says who posted a
 * room, so the poster's edit and withdraw controls belong on `MyGroupListings`,
 * where the rows came from a query keyed on the caller's own submissions.
 */
export function GroupListingCard({ listing }: { listing: GroupListing }) {
  const { t } = useTranslation();
  return (
    <article className={styles.listing}>
      <div className={styles.listingHead}>
        <h3 className={styles.listingTitle}>{listing.title}</h3>
        <span className={styles.price}>
          {t("economy:housingGroups.listings.perMonth", {
            price: listing.priceEuros,
          })}
        </span>
      </div>
      <div className={styles.listingLoc}>{listing.neighbourhood}</div>
      <p className={styles.listingDesc}>{listing.description}</p>
      <div className={styles.access}>
        <span className={styles.accessLabel}>
          {t("economy:housingGroups.listings.accessLabel")}
        </span>{" "}
        {listing.accessibilityInfo}
      </div>
    </article>
  );
}
