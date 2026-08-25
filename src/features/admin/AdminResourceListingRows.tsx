import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip, type AdminTone } from "./ui";
import type { AdminResourceListingDTO } from "./api/adminResourceListings.api";
import styles from "./AdminResourceListingsPage.module.css";

const STATUS_TONE: Record<AdminResourceListingDTO["status"], AdminTone> = {
  active: "jade",
  archived: "ghost",
};

/** One row per listing: title, category/status chips, region, and
 *  edit/delete actions. */
export function AdminResourceListingRows({
  listings,
  onEdit,
  onDelete,
}: {
  listings: AdminResourceListingDTO[];
  onEdit: (listing: AdminResourceListingDTO) => void;
  onDelete: (listing: AdminResourceListingDTO) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {listings.map((listing) => (
        <div className={styles.row} key={listing.id}>
          <div className={styles.rowMain}>
            <div className={styles.rowTop}>
              <span className={styles.rowName}>{listing.title}</span>
              <AdminChip
                tone={listing.category === "legal_aid" ? "violet" : "plum"}
                dot
              >
                {t(`admin:adminResourceListings.category.${listing.category}`)}
              </AdminChip>
              <AdminChip tone={STATUS_TONE[listing.status]} dot>
                {t(`admin:adminResourceListings.status.${listing.status}`)}
              </AdminChip>
            </div>
            <div className={styles.rowMeta}>
              {listing.region ?? t("admin:adminResourceListings.row.noRegion")}
            </div>
          </div>
          <div className={styles.rowActions}>
            <Button variant="ghost" size="md" onClick={() => onEdit(listing)}>
              {t("admin:common.edit")}
            </Button>
            <Button variant="ghost" size="md" onClick={() => onDelete(listing)}>
              {t("admin:common.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
