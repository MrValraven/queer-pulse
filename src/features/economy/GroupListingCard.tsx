import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupListing } from "./housingGroups.data";
import styles from "./HousingGroupsPage.module.css";

/**
 * One norm-compliant room inside a vetted group: title, price, neighbourhood,
 * description, and the accessibility line the group requires.
 *
 * While the group page is in manage mode, the card also carries the poster's
 * own controls (`PATCH`/`DELETE /housing-groups/:slug/listings/:id`). The
 * public listings payload does not say who posted a room, so the backend is the
 * only place ownership is known: these controls are an ask, and a 403 comes
 * back as a plain "only the person who posted this room can change it". The
 * manage-mode note above the grid says so before anything is clicked.
 */
export function GroupListingCard({
  listing,
  isManaging,
  isBusy,
  onEdit,
  onWithdraw,
}: {
  listing: GroupListing;
  isManaging: boolean;
  isBusy: boolean;
  onEdit: () => void;
  onWithdraw: () => void;
}) {
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
      {isManaging && (
        <div className={styles.listingManage}>
          <Button
            variant="ghost"
            size="md"
            onClick={onEdit}
            disabled={isBusy}
            aria-label={t("economy:groupListing.manage.editAriaLabel", {
              title: listing.title,
            })}
          >
            <FiEdit3 aria-hidden />
            {t("economy:groupListing.manage.editCta")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            className={styles.listingWithdraw}
            onClick={onWithdraw}
            disabled={isBusy}
            aria-label={t("economy:groupListing.manage.withdrawAriaLabel", {
              title: listing.title,
            })}
          >
            <FiTrash2 aria-hidden />
            {t("economy:groupListing.manage.withdrawCta")}
          </Button>
        </div>
      )}
    </article>
  );
}
