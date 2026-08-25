import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { AdminChip, type AdminTone } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { AdminChangemakerNominationDTO } from "./api/adminChangemakerNominations.api";
import { useTriageChangemakerNomination } from "./api/useTriageChangemakerNomination";
import styles from "./AdminSubmissionList.module.css";

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_TONE: Record<AdminChangemakerNominationDTO["status"], AdminTone> =
  {
    pending: "amber",
    approved: "jade",
    dismissed: "coral",
  };

/**
 * One nomination row on the admin oversight page — the nominee, who
 * nominated them and why (COM-16's `reason` field), and (COM-17) the triage
 * state plus approve/dismiss actions while it's still pending. Mirrors
 * `AdminWriterApplicationsRow` exactly: same status-chip pattern, same
 * optional-note-then-two-buttons row action shape.
 */
export function AdminChangemakerNominationsRow({
  nomination,
}: {
  nomination: AdminChangemakerNominationDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { triage, pending } = useTriageChangemakerNomination();
  const [reviewNote, setReviewNote] = useState("");
  const nominatorName =
    nomination.nominator?.name ??
    t("admin:adminChangemakerNominations.unknownMember");

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{nomination.nomineeName}</span>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminChangemakerNominations.row.by", {
            name: nominatorName,
          })}
        </div>
        {nomination.reason && (
          <div className={styles.rowNote}>{nomination.reason}</div>
        )}
        <div className={styles.rowDates}>
          {t("admin:adminChangemakerNominations.row.sent", {
            date: shortDate(fmt, nomination.createdAt),
          })}
          {nomination.status !== "pending" && nomination.reviewer && (
            <>
              {" · "}
              {t("admin:adminChangemakerNominations.row.reviewedBy", {
                name: nomination.reviewer.name,
              })}
            </>
          )}
        </div>
      </div>
      <div className={styles.rowActions}>
        <AdminChip tone={STATUS_TONE[nomination.status]} dot>
          {t(`admin:adminChangemakerNominations.status.${nomination.status}`)}
        </AdminChip>
        {nomination.status === "pending" && (
          <>
            <input
              className={styles.rowNoteInput}
              type="text"
              placeholder={t(
                "admin:adminChangemakerNominations.row.reviewNotePlaceholder",
              )}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
            <div className={styles.rowActionButtons}>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  triage({
                    id: nomination.id,
                    status: "dismissed",
                    reviewNote: reviewNote.trim() || undefined,
                  })
                }
              >
                {t("admin:adminChangemakerNominations.row.dismissCta")}
              </Button>
              <Button
                variant="jade"
                size="sm"
                disabled={pending}
                onClick={() =>
                  triage({
                    id: nomination.id,
                    status: "approved",
                    reviewNote: reviewNote.trim() || undefined,
                  })
                }
              >
                {t("admin:adminChangemakerNominations.row.approveCta")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
