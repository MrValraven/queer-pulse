import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { AdminChip, type AdminTone } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type {
  AdminMagazineSubmissionDTO,
  MagazineSubmissionDecision,
  MagazineSubmissionStatus,
} from "./api/adminMagazineSubmissions.api";
import { useDecideMagazineSubmission } from "./api/useDecideMagazineSubmission";
import styles from "./AdminSubmissionList.module.css";

const STATUS_TONE: Record<MagazineSubmissionStatus, AdminTone> = {
  draft: "ghost",
  submitted: "amber",
  in_review: "violet",
  accepted: "jade",
  rejected: "coral",
  published: "plum",
};

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * One reader story on the admin queue: what the member wrote (summary, deck,
 * the piece itself, the cover they uploaded) and the decision on it.
 *
 * A submission with no `decidedAt` is still open, and the three actions are
 * live. "Commission" also creates a pitch in the desk's inbox, which is why it
 * is worded differently from a plain accept. The reply note is optional and is
 * the only prose the submitter gets back: QueerPulse sends no email, so it
 * reaches them on their own tracker card and through the in-app bell.
 */
export function AdminMagazineSubmissionRow({
  submission,
}: {
  submission: AdminMagazineSubmissionDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { decide, pending } = useDecideMagazineSubmission();
  const [replyNote, setReplyNote] = useState("");
  const submitterName =
    submission.submitter?.name ??
    t("admin:adminMagazineSubmissions.unknownMember");
  const isOpen = submission.decidedAt === null;

  const decideWith = (decision: MagazineSubmissionDecision) =>
    decide({
      id: submission.id,
      decision,
      replyNote: replyNote.trim() || undefined,
    });

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{submission.workingTitle}</span>
          <AdminChip tone={STATUS_TONE[submission.status]} dot>
            {t(`admin:adminMagazineSubmissions.status.${submission.status}`)}
          </AdminChip>
          {submission.decision === "commissioned" && (
            <AdminChip tone="violet" dot>
              {t("admin:adminMagazineSubmissions.status.commissioned")}
            </AdminChip>
          )}
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminMagazineSubmissions.row.by", { name: submitterName })}
          {" · "}
          {submission.format}
        </div>
        <div className={styles.rowNote}>{submission.pitch}</div>
        {submission.deck && (
          <div className={styles.rowNote}>{submission.deck}</div>
        )}
        {submission.body && (
          <details className={styles.rowNote}>
            <summary>
              {t("admin:adminMagazineSubmissions.row.readPiece")}
            </summary>
            <p>{submission.body}</p>
          </details>
        )}
        {submission.coverUrl && (
          <img
            className={styles.rowCover}
            src={submission.coverUrl}
            alt={t("admin:adminMagazineSubmissions.row.coverAlt", {
              title: submission.workingTitle,
            })}
            loading="lazy"
            decoding="async"
            width={320}
            height={160}
          />
        )}
        {submission.decisionNote && (
          <div className={styles.rowNote}>
            {t("admin:adminMagazineSubmissions.row.reply", {
              note: submission.decisionNote,
            })}
          </div>
        )}
        <div className={styles.rowDates}>
          {t("admin:adminMagazineSubmissions.row.sent", {
            date: shortDate(fmt, submission.createdAt),
          })}
          {submission.decidedAt
            ? ` · ${t("admin:adminMagazineSubmissions.row.decided", {
                date: shortDate(fmt, submission.decidedAt),
              })}`
            : ""}
        </div>
      </div>

      {isOpen && (
        <div className={styles.rowActions}>
          <input
            className={styles.rowNoteInput}
            type="text"
            aria-label={t("admin:adminMagazineSubmissions.row.replyLabel")}
            placeholder={t(
              "admin:adminMagazineSubmissions.row.replyPlaceholder",
            )}
            value={replyNote}
            onChange={(event) => setReplyNote(event.target.value)}
          />
          <div className={styles.rowActionButtons}>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => decideWith("declined")}
            >
              {t("admin:adminMagazineSubmissions.row.declineCta")}
            </Button>
            <Button
              variant="jade"
              size="sm"
              disabled={pending}
              onClick={() => decideWith("accepted")}
            >
              {t("admin:adminMagazineSubmissions.row.acceptCta")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={() => decideWith("commissioned")}
            >
              {t("admin:adminMagazineSubmissions.row.commissionCta")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
