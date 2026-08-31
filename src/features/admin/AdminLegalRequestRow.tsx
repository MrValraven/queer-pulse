import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { AdminChip, type AdminTone } from "./ui";
import type {
  AdminLegalRequestDTO,
  LegalRequestOutcome,
} from "./api/adminLegalRequests.api";
import styles from "./AdminLegalRequestsPage.module.css";

/**
 * Outcome tone. Coral for every outcome under which member data actually left
 * the platform, jade where it did not, amber while the demand is unanswered.
 * The chip always carries the outcome in words as well, so the colour is a
 * second reading of the meaning and never the only one.
 */
const OUTCOME_TONE: Record<LegalRequestOutcome, AdminTone> = {
  complied_in_full: "coral",
  complied_in_part: "coral",
  narrowed: "coral",
  refused: "jade",
  withdrawn: "jade",
  pending: "amber",
};

/**
 * One recorded demand in the register. The whole row is the control that opens
 * the detail pane, so it is a real `<button>` named after the body that made
 * the demand, never a clickable `<div>`.
 */
export function AdminLegalRequestRow({
  record,
  onOpen,
}: {
  record: AdminLegalRequestDTO;
  onOpen: () => void;
}) {
  const { t, language } = useTranslation();
  const receivedOn = formatDate(record.receivedOn, language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <button
      type="button"
      className={[styles.row, record.isVoided && styles.rowVoided]
        .filter(Boolean)
        .join(" ")}
      onClick={onOpen}
      aria-label={t("admin:legalRequests.row.openAriaLabel", {
        body: record.requestingBody,
        date: receivedOn,
      })}
    >
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowBody}>{record.requestingBody}</span>
          <AdminChip tone="plum" dot>
            {t(`admin:legalRequests.type.${record.requestType}`)}
          </AdminChip>
          {record.isUnderGagOrder && (
            <AdminChip tone="violet">
              {t("admin:legalRequests.gagOrderChip")}
            </AdminChip>
          )}
        </div>
        <p className={styles.rowMeta}>
          {t("admin:legalRequests.row.meta", {
            jurisdiction: record.jurisdiction,
            date: receivedOn,
          })}
        </p>
        <p className={styles.rowMeta}>
          {t("admin:legalRequests.row.accounts", {
            affected: record.accountsAffected,
            notified: record.accountsNotified,
          })}
        </p>
      </div>
      <div className={styles.rowSide}>
        <AdminChip tone={OUTCOME_TONE[record.outcome]} dot>
          {t(`admin:legalRequests.outcome.${record.outcome}`)}
        </AdminChip>
        {record.isVoided && (
          <AdminChip tone="ghost">
            {t("admin:legalRequests.voidedChip")}
          </AdminChip>
        )}
      </div>
    </button>
  );
}
