import { useState } from "react";
import { safeHref } from "../../shared/lib/safeHref";
import { Button } from "../../shared/components/ui";
import { AdminChip, type AdminTone } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminWriterApplicationDTO } from "./api/adminWriterApplications.api";
import { useTriageWriterApplication } from "./api/useTriageWriterApplication";
import styles from "./AdminSubmissionList.module.css";

const STATUS_TONE: Record<AdminWriterApplicationDTO["status"], AdminTone> = {
  pending: "amber",
  approved: "jade",
  declined: "coral",
};

export function AdminWriterApplicationsRow({
  application,
}: {
  application: AdminWriterApplicationDTO;
}) {
  const { t } = useTranslation();
  const { triage, pending } = useTriageWriterApplication();
  const [reviewNote, setReviewNote] = useState("");
  const applicantName =
    application.applicant?.name ??
    t("admin:adminWriterApplications.unknownMember");
  const sampleHref = safeHref(application.sampleLink);

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{applicantName}</span>
        </div>
        {application.pitchNote && (
          <div className={styles.rowMeta}>{application.pitchNote}</div>
        )}
        {application.sampleText && (
          <div className={styles.rowNote}>{application.sampleText}</div>
        )}
        {application.sampleLink && (
          <div className={styles.rowNote}>
            {t("admin:adminWriterApplications.row.sampleLink")}:{" "}
            {sampleHref ? (
              <a href={sampleHref} target="_blank" rel="noopener noreferrer">
                {application.sampleLink}
              </a>
            ) : (
              <span>{application.sampleLink}</span>
            )}
          </div>
        )}
      </div>
      <div className={styles.rowActions}>
        <AdminChip tone={STATUS_TONE[application.status]} dot>
          {t(`admin:adminWriterApplications.status.${application.status}`)}
        </AdminChip>
        {application.status === "pending" && (
          <>
            <input
              className={styles.rowNoteInput}
              type="text"
              placeholder={t(
                "admin:adminWriterApplications.row.reviewNotePlaceholder",
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
                    id: application.id,
                    status: "declined",
                    reviewNote: reviewNote.trim() || undefined,
                  })
                }
              >
                {t("admin:adminWriterApplications.row.declineCta")}
              </Button>
              <Button
                variant="jade"
                size="sm"
                disabled={pending}
                onClick={() =>
                  triage({
                    id: application.id,
                    status: "approved",
                    reviewNote: reviewNote.trim() || undefined,
                  })
                }
              >
                {t("admin:adminWriterApplications.row.approveCta")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
