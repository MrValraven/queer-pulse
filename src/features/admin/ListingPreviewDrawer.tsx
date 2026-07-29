import { useState } from "react";
import { Modal, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, type AdminTone } from "./ui";
import { DirectorySpaceView } from "../marketing/DirectorySpaceView";
import { listingDtoToPreviewPlace } from "./api/listingPreviewPlace";
import { useSetListingStatus } from "./api/useSetListingStatus";
import { AskQuestionModal } from "./AskQuestionModal";
import type { ListingQueueRow } from "./api/adminListings.api";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";
import styles from "./AdminListingsPage.module.css";

const STATUS_TONE: Record<ListingStatus, AdminTone> = {
  review: "ghost",
  question: "ghost",
  live: "jade",
};

export function ListingPreviewDrawer({
  row,
  onClose,
  onStatusChanged,
}: {
  row: ListingQueueRow;
  onClose: () => void;
  onStatusChanged: (ref: string, status: ListingStatus) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const setStatus = useSetListingStatus();
  const [asking, setAsking] = useState(false);
  const place = listingDtoToPreviewPlace(row.detail);

  function moveTo(status: ListingStatus) {
    setStatus.mutate(
      { row, status },
      {
        onSuccess: () => {
          onStatusChanged(row.ref, status);
          showToast(
            t("admin:adminListings.toast.moved", {
              name: row.name,
              status: t(`admin:adminListings.status.${status}`),
            }),
            "success",
          );
          onClose();
        },
      },
    );
  }

  return (
    <>
      <Modal
        wide
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
            <AdminChip tone={STATUS_TONE[row.status]} dot>
              {t(`admin:adminListings.status.${row.status}`)}
            </AdminChip>
          </span>
        }
        sub={t("admin:adminListings.preview.sub")}
        onClose={onClose}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setAsking(true)}
              disabled={setStatus.isPending}
            >
              {t("admin:adminListings.advance.question")}
            </Button>
            {row.status !== "review" && (
              <Button
                variant="ghost"
                onClick={() => moveTo("review")}
                disabled={setStatus.isPending}
              >
                {t("admin:adminListings.sendBackCta")}
              </Button>
            )}
            {row.status !== "live" && (
              <Button
                variant="jade"
                onClick={() => moveTo("live")}
                disabled={setStatus.isPending}
              >
                {t("admin:adminListings.advance.live")}
              </Button>
            )}
          </>
        }
      >
        <div className={styles.previewFrame}>
          <DirectorySpaceView place={place} preview />
        </div>
      </Modal>
      {asking && (
        <AskQuestionModal
          row={row}
          onClose={() => setAsking(false)}
          onAsked={(ref) => onStatusChanged(ref, "question")}
        />
      )}
    </>
  );
}
