import { Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip } from "./ui";
import { DirectorySpaceView } from "../marketing/DirectorySpaceView";
import { listingDtoToPreviewPlace } from "./api/listingPreviewPlace";
import { ListingModerationActions } from "./ListingModerationActions";
import { ListingHistoryPanel } from "./ListingHistoryPanel";
import {
  LISTING_STATUS_TONE,
  type ListingQueueRow,
} from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

export function ListingPreviewDrawer({
  row,
  onClose,
}: {
  row: ListingQueueRow;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const place = listingDtoToPreviewPlace(row.detail);

  return (
    <Modal
      wide
      className={styles.drawerModal}
      eyebrow={
        <>
          {row.ref} ·{" "}
          {row.submitterName || t("admin:adminListings.unknownSubmitter")} ·{" "}
          {fmt.date(new Date(row.createdAt), {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </>
      }
      title={
        <span className={styles.previewTitle}>
          {row.name}{" "}
          <AdminChip tone={LISTING_STATUS_TONE[row.status]} dot>
            {t(`admin:adminListings.status.${row.status}`)}
          </AdminChip>
        </span>
      }
      sub={t("admin:adminListings.preview.sub")}
      onClose={onClose}
      footer={
        <ListingModerationActions variant="drawer" row={row} onDone={onClose} />
      }
    >
      <div className={styles.previewLayout}>
        <div className={styles.previewFrame}>
          <DirectorySpaceView place={place} preview />
        </div>
        <ListingHistoryPanel listingRef={row.ref} />
      </div>
    </Modal>
  );
}
