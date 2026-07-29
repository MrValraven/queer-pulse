import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip, type AdminTone } from "./ui";
import { useSetListingStatus } from "./api/useSetListingStatus";
import type { ListingQueueRow } from "./api/adminListings.api";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";
import styles from "./AdminListingsPage.module.css";

// AdminTone has no "warn" tone (see `./ui/AdminChip`), so "review" and
// "question" both use "ghost"; only "live" gets the stronger "jade".
const STATUS_TONE: Record<ListingStatus, AdminTone> = {
  review: "ghost",
  question: "ghost",
  live: "jade",
};

/** Linear lifecycle: the status one step forward, or null at the end. */
const NEXT_STATUS: Record<ListingStatus, ListingStatus | null> = {
  review: "question",
  question: "live",
  live: null,
};

export function AdminListingRows({
  rows,
  onStatusChanged,
}: {
  rows: ListingQueueRow[];
  onStatusChanged: (ref: string, status: ListingStatus) => void;
}) {
  const { t } = useTranslation();
  if (rows.length === 0) {
    return <p className={styles.emptyLine}>{t("admin:adminListings.empty")}</p>;
  }
  return (
    <div className={styles.rows}>
      {rows.map((row, index) => (
        <FadeIn key={row.ref} delay={Math.min(index, 8) * 50}>
          <AdminListingRow row={row} onStatusChanged={onStatusChanged} />
        </FadeIn>
      ))}
    </div>
  );
}

function AdminListingRow({
  row,
  onStatusChanged,
}: {
  row: ListingQueueRow;
  onStatusChanged: (ref: string, status: ListingStatus) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const setStatus = useSetListingStatus();
  const nextStatus = NEXT_STATUS[row.status];

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
        },
      },
    );
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{row.name}</span>
          <AdminChip tone={STATUS_TONE[row.status]} dot>
            {t(`admin:adminListings.status.${row.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {row.ref} ·{" "}
          {row.submitterName || t("admin:adminListings.unknownSubmitter")}
          {row.hood ? ` · ${row.hood}` : ""}
        </div>
      </div>
      <div className={styles.rowActions}>
        {nextStatus && (
          <Button
            variant="jade"
            size="md"
            onClick={() => moveTo(nextStatus)}
            disabled={setStatus.isPending}
          >
            {t(`admin:adminListings.advance.${nextStatus}`)}
          </Button>
        )}
        {row.status !== "review" && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => moveTo("review")}
            disabled={setStatus.isPending}
          >
            {t("admin:adminListings.sendBackCta")}
          </Button>
        )}
      </div>
    </div>
  );
}
