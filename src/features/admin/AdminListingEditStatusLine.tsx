import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";
import { AdminChip } from "./ui";
import { LISTING_STATUS_TONE } from "./api/adminListings.api";
import styles from "./AdminListingEditStatusLine.module.css";

/**
 * The line under the edit page's header that names the listing being edited
 * and where it stands, so the wizard below reads as an edit of an existing
 * listing. The status chip is the one the listings queue row and preview
 * drawer show, with the same tone.
 */
export function AdminListingEditStatusLine({
  listingRef,
  status,
}: {
  listingRef: string;
  status: ListingStatus;
}) {
  const { t } = useTranslation();
  return (
    <p className={styles.statusLine}>
      <span className={styles.ref}>
        {t("admin:listingEdit.editingRef", { ref: listingRef })}
      </span>
      <AdminChip tone={LISTING_STATUS_TONE[status]} dot>
        {t(`admin:adminListings.status.${status}`)}
      </AdminChip>
    </p>
  );
}
