import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { AdminChip, type AdminTone } from "./ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type {
  AdminMagazineSubmissionDTO,
  MagazineSubmissionDecision,
  MagazineSubmissionStatus,
} from "./api/adminMagazineSubmissions.api";
import { AdminMagazineSubmissionReopenAction } from "./AdminMagazineSubmissionReopenAction";
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
 * live. Both yeses reach the desk, by different routes: "Commission" puts a
 * pitch in the desk's inbox to be triaged, while "Accept" creates the piece
 * itself, files the member's text as its article draft and assigns them as its
 * writer. Once accepted, the row links straight through to that desk record.
 * The reply note is optional and is the only prose the submitter gets back:
 * QueerPulse sends no email, so it reaches them on their own tracker card and
 * through the in-app bell.
 *
 * A DECLINED row also carries the one route back. A decline used to be
 * permanent, so a wrong button, a change of mind, or a revision the member sent
 * afterwards ended the story. Reopen is offered quietly (a ghost action, last,
 * behind a confirm) because it is a correction rather than part of the daily
 * pass over the queue, and it says plainly in the dialog that the decline and
 * the reply the member received are erased and the member is told. Accepted and
 * commissioned rows never offer it: both left a record on the desk that
 * reopening would strand.
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
  // A yes that never reached the desk. Rows accepted before an acceptance
  // created the piece carry a decision and nothing behind it: the member was
  // told yes and there is no piece to edit, assign or pay. Re-sending the
  // accept finishes the job without re-deciding the row or ringing the member
  // again, so the action stays available on a closed row here alone.
  const hasUnfinishedAccept =
    !isOpen &&
    submission.decision === "accepted" &&
    submission.acceptedPieceId === null;

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
        {submission.acceptedPieceId && (
          <div className={styles.rowNote}>
            <Link
              className={styles.rowCrossLink}
              to={routes.magazinePiece.replace(
                ":id",
                submission.acceptedPieceId,
              )}
            >
              {t("admin:adminMagazineSubmissions.row.openDeskPiece")}
            </Link>
          </div>
        )}
        {/* A reopen CLEARS the decision it undoes, so without this line the row
            would be back in the queue looking as if nobody had ever decided it,
            and the editor who wrote the decline would have nothing telling them
            where it went. The count only shows past the first, where it starts
            saying something: a story round the loop three times is a different
            conversation from one reopened once. */}
        {submission.reopenedAt && (
          <div className={styles.rowNote}>
            {submission.reopenedBy
              ? t("admin:adminMagazineSubmissions.row.reopenedBy", {
                  name: submission.reopenedBy.name,
                  date: shortDate(fmt, submission.reopenedAt),
                })
              : t("admin:adminMagazineSubmissions.row.reopened", {
                  date: shortDate(fmt, submission.reopenedAt),
                })}
            {submission.reopenCount > 1
              ? ` ${t("admin:adminMagazineSubmissions.row.reopenedTimes", {
                  count: submission.reopenCount,
                })}`
              : ""}
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

      {hasUnfinishedAccept && (
        <div className={styles.rowActions}>
          <p className={styles.rowNote}>
            {t("admin:adminMagazineSubmissions.row.acceptNotOnDesk")}
          </p>
          <div className={styles.rowActionButtons}>
            <Button
              variant="jade"
              size="sm"
              disabled={pending}
              onClick={() => decideWith("accepted")}
            >
              {t("admin:adminMagazineSubmissions.row.createDeskPieceCta")}
            </Button>
          </div>
        </div>
      )}

      {/* Renders only on a declined row, and returns null on every other. */}
      <AdminMagazineSubmissionReopenAction submission={submission} />
    </div>
  );
}
