import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MyGroupListing } from "./housingGroups.data";
import { MyGroupListingCard } from "./MyGroupListingCard";
import styles from "./HousingGroupsPage.module.css";

/**
 * The member's own rooms in this group, and the way in to post one (LOC-19).
 *
 * The group page above shows only what a moderator has cleared, which left a
 * poster watching their room disappear with nothing anywhere able to say
 * whether it was waiting, had gone up, had a question against it, or had been
 * refused. This section is that answer, and it is where the review expectation
 * is set before anyone writes a word.
 *
 * Rendered only for someone the backend would actually let post, so a
 * signed-out reader is never shown a control that answers with a 401.
 */
export function MyGroupListings({
  listings,
  isLoading,
  busyListingId,
  onPost,
  onEdit,
  onWithdraw,
}: {
  listings: MyGroupListing[];
  isLoading: boolean;
  /** The listing with a write in flight, so its controls stay disabled. */
  busyListingId: string | null;
  onPost: () => void;
  onEdit: (listing: MyGroupListing) => void;
  onWithdraw: (listing: MyGroupListing) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.mineSection}>
      <div className="wrap">
        <div className={styles.mineHead}>
          <div>
            <h2 className={styles.listingsTitle}>
              {t("economy:groupListing.mine.title")}{" "}
              <em>{t("economy:groupListing.mine.titleEm")}</em>
            </h2>
            <p className={styles.mineSub}>
              {t("economy:groupListing.mine.sub")}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onPost}>
            <FiPlus aria-hidden />
            {t("economy:groupListing.mine.postCta")}
          </Button>
        </div>

        {isLoading ? (
          <div className={styles.cardSkeleton} aria-busy="true" />
        ) : listings.length === 0 ? (
          <p className={styles.mineEmpty}>
            {t("economy:groupListing.mine.empty")}
          </p>
        ) : (
          <div className={styles.mineGrid}>
            {listings.map((listing) => (
              <MyGroupListingCard
                key={listing.id}
                listing={listing}
                isBusy={busyListingId === listing.id}
                onEdit={() => onEdit(listing)}
                onWithdraw={() => onWithdraw(listing)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
