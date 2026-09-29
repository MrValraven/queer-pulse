import { useId } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import { thread as threadPath } from "../../app/routeMap";
import { contentWarningLabels } from "../forum/forumWarnings.helpers";
import { AdminChip } from "./ui";
import type { AdminForumReviewThread } from "./api/adminForumReview.api";
import submissionStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminForumReviewPage.module.css";

/** Whether an ISO instant is still ahead of us: a held thread whose author
 *  also scheduled it goes live at that instant, once approved. */
function isInFuture(iso: string): boolean {
  const instant = new Date(iso).getTime();
  return !Number.isNaN(instant) && instant > Date.now();
}

/**
 * One held thread in the staff review queue.
 *
 * The moderator reads the real author here, even on a thread that will post
 * anonymously, because the decision is about the person as much as the post.
 * The warnings are spelled out as text in front of the excerpt. The title is
 * the row's only link to the thread itself, which moderators can read before
 * it is published.
 *
 * Row layout (title style, meta line, wrapper) comes straight from
 * AdminSubmissionList.module.css, the shared family every other oversight
 * queue uses; only the warnings/excerpt/footer/actions below are specific to
 * a forum thread.
 */
export function AdminForumReviewRow({
  thread,
  isPending,
  onApprove,
  onDecline,
}: {
  thread: AdminForumReviewThread;
  isPending: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const titleId = useId();
  const categoryKey = `forum:cat.${thread.category}`;
  const categoryLabel = t(categoryKey);
  const warningLabels = contentWarningLabels(thread.contentWarnings, t);
  const isScheduled = isInFuture(thread.publishedAt);
  const metaParts = [
    thread.author.displayName,
    categoryLabel === categoryKey ? thread.category : categoryLabel,
    thread.community
      ? t("admin:adminForumReview.row.inCommunity", {
          community: thread.community.name,
        })
      : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <article
      className={`${submissionStyles.row} ${styles.row}`}
      aria-labelledby={titleId}
    >
      <div className={submissionStyles.rowMain}>
        <div className={submissionStyles.rowTop}>
          <Link
            id={titleId}
            to={threadPath(thread.slug)}
            className={`${submissionStyles.rowName} ${submissionStyles.rowNameLink}`}
          >
            {thread.title}
          </Link>
          {thread.isAnonymous && (
            <AdminChip tone="violet">
              {t("admin:adminForumReview.row.anonymous")}
            </AdminChip>
          )}
        </div>
        <div className={submissionStyles.rowMeta}>{metaParts.join(" · ")}</div>
        {warningLabels.length > 0 && (
          <p className={styles.rowWarnings}>
            {t("admin:adminForumReview.row.warnings", {
              warnings: warningLabels.join(", "),
            })}
          </p>
        )}
        {thread.excerpt && (
          <p className={styles.rowExcerpt}>{thread.excerpt}</p>
        )}
        <div className={styles.rowFooter}>
          <span>
            {t("admin:adminForumReview.row.submitted", {
              time: formatRelative(thread.createdAt, formatters),
            })}
          </span>
          {isScheduled && (
            <span>
              {t("admin:adminForumReview.row.scheduled", {
                time: formatters.date(new Date(thread.publishedAt), {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  // N4: a 24h clock in both languages, matching the house
                  // date-plus-time helper elsewhere (SentInvitesList's
                  // `dateAndTime`), reads shorter than EN's default AM/PM
                  // and keeps this sentence from being the reason it wraps.
                  hourCycle: "h23",
                }),
              })}
            </span>
          )}
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button
          variant="jade"
          size="sm"
          className={styles.actionButton}
          disabled={isPending}
          aria-describedby={titleId}
          onClick={onApprove}
        >
          {t("admin:adminForumReview.action.approve")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={styles.actionButton}
          disabled={isPending}
          aria-describedby={titleId}
          onClick={onDecline}
        >
          {t("admin:adminForumReview.action.reject")}
        </Button>
      </div>
    </article>
  );
}
