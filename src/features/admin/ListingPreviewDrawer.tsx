import { Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { AdminChip } from "./ui";
import { DirectorySpaceView } from "../marketing/DirectorySpaceView";
import { listingDtoToPreviewPlace } from "./api/listingPreviewPlace";
import { ListingModerationActions } from "./ListingModerationActions";
import { ListingHistoryPanel } from "./ListingHistoryPanel";
import { ListingDelegationSection } from "./ListingDelegationSection";
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
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  const place = listingDtoToPreviewPlace(row.detail);
  // Every delegation route is `@StaffRoles()` + `@Roles(Admin)`, so a
  // `directory_moderator` opening this same drawer would be refused by all
  // six. The section is gated the way `AdminSidebar` gates its admin-only
  // rail entries, and for the same reason: never offer a control the route
  // gate then bounces.
  const isAdmin = demoMode || role === "admin";

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
      {isAdmin && (
        <ListingDelegationSection
          listingRef={row.ref}
          ownerSlug={row.detail.submittedBy?.slug ?? null}
        />
      )}
    </Modal>
  );
}
