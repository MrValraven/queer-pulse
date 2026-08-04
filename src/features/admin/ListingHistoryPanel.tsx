import { SkeletonLine } from "../../shared/components/ui";
import { AdminChip } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import type { TFunction } from "../../shared/i18n/types";
import { useListingHistory } from "./api/useListingHistory";
import type {
  ListingModerationEventDTO,
  ListingQuestionDTO,
} from "./api/adminListings.api";
import type { MemberRefDTO } from "../../shared/api/refs";
import styles from "./AdminListingsPage.module.css";

function actorName(actor: MemberRefDTO | null, t: TFunction): string {
  if (!actor) return t("admin:adminListings.history.unknownActor");
  return `${actor.firstName} ${actor.lastName}`.trim();
}

/** One line per event action — `fromStatus`/`toStatus` only apply to the two
 *  status-transition actions, so only those two interpolate `{from}`/`{to}`. */
function eventLabel(event: ListingModerationEventDTO, t: TFunction): string {
  const actor = actorName(event.actor, t);
  const from = event.fromStatus
    ? t(`admin:adminListings.status.${event.fromStatus}`)
    : "";
  const to = event.toStatus
    ? t(`admin:adminListings.status.${event.toStatus}`)
    : "";
  switch (event.action) {
    case "status_changed":
      return t("admin:adminListings.history.event.statusChanged", {
        actor,
        from,
        to,
      });
    case "bulk_status":
      return t("admin:adminListings.history.event.bulkStatus", {
        actor,
        from,
        to,
      });
    case "removed":
      return t("admin:adminListings.history.event.removed", { actor });
    case "question_asked":
      return t("admin:adminListings.history.event.questionAsked", { actor });
    case "answered":
      return t("admin:adminListings.history.event.answered", { actor });
    default: {
      const exhaustiveCheck: never = event.action;
      return exhaustiveCheck;
    }
  }
}

/**
 * The moderation audit trail + Q&A thread for one listing, read into the
 * preview drawer's side column. Two independent sections — the moderation
 * event timeline (who did what, from/to status, an optional reason, when)
 * and the Q&A thread (what was asked, and whether the submitter has answered
 * yet) — both rendered newest-first, matching the backend's `ListingHistoryDTO`
 * ordering. `listingRef` is the listing's own business reference code
 * (`row.ref`, e.g. `"QPL-2026-0007"`) — named `listingRef` rather than `ref`
 * on purpose: a prop literally named `ref` (even holding a plain string, not
 * a React ref) trips the `react-hooks/refs` compiler lint, which taint-tracks
 * anything passed to a `ref=` JSX attribute and then flags every later access
 * to that same variable for the rest of the caller's render — see
 * `useListingHistory`.
 */
export function ListingHistoryPanel({
  listingRef,
}: {
  listingRef: string;
}) {
  const { t } = useTranslation();
  const { history, isLoading, isError } = useListingHistory(listingRef);

  // One combined `history` fetch backs both sections below, so loading/error
  // are handled once, panel-wide — never a bare section heading with nothing
  // (no skeleton, no error, no content) rendered under it.
  if (isLoading) {
    return (
      <div className={styles.historyPanel}>
        <HistorySkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.historyPanel}>
        <p className={styles.historyError}>
          {t("admin:adminListings.history.error")}
        </p>
      </div>
    );
  }

  const hasEvents = history.events.length > 0;
  const hasQuestions = history.questions.length > 0;

  return (
    <div className={styles.historyPanel}>
      <h4 className={styles.historySectionTitle}>
        {t("admin:adminListings.history.eventsHeading")}
      </h4>
      {hasEvents ? (
        <ul className={styles.historyList}>
          {history.events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      ) : (
        <p className={styles.historyEmpty}>
          {t("admin:adminListings.history.emptyEvents")}
        </p>
      )}

      <h4 className={styles.historySectionTitle}>
        {t("admin:adminListings.history.questionsHeading")}
      </h4>
      {hasQuestions ? (
        <ul className={styles.historyList}>
          {history.questions.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))}
        </ul>
      ) : (
        <p className={styles.historyEmpty}>
          {t("admin:adminListings.history.emptyQuestions")}
        </p>
      )}
    </div>
  );
}

function EventRow({ event }: { event: ListingModerationEventDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const whenText = formatRelative(event.createdAt, fmt);

  return (
    <li className={styles.historyRow}>
      <div className={styles.historyRowHead}>
        <span className={styles.historyRowLabel}>{eventLabel(event, t)}</span>
        {whenText && (
          <time className={styles.historyRowMeta} dateTime={event.createdAt}>
            {whenText}
          </time>
        )}
      </div>
      {event.reason && <p className={styles.historyReason}>“{event.reason}”</p>}
    </li>
  );
}

function QuestionRow({ question }: { question: ListingQuestionDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const askedByName = actorName(question.askedBy, t);
  const whenText = formatRelative(question.createdAt, fmt);

  return (
    <li className={styles.historyRow}>
      <div className={styles.historyRowHead}>
        <span className={styles.historyRowMeta}>
          {t("admin:adminListings.history.askedBy", { actor: askedByName })}
        </span>
        {whenText && (
          <time className={styles.historyRowMeta} dateTime={question.createdAt}>
            {whenText}
          </time>
        )}
      </div>
      <p className={styles.questionBody}>{question.body}</p>
      {question.answer ? (
        <p className={styles.questionReply}>{question.answer}</p>
      ) : (
        <AdminChip tone="warn" dot>
          {t("admin:adminListings.history.awaitingReply")}
        </AdminChip>
      )}
    </li>
  );
}

function HistorySkeleton() {
  return (
    <div className={styles.historyList} aria-hidden>
      <SkeletonLine width="90%" height={14} />
      <SkeletonLine width="60%" height={12} style={{ marginTop: 8 }} />
      <SkeletonLine width="85%" height={14} style={{ marginTop: 20 }} />
      <SkeletonLine width="50%" height={12} style={{ marginTop: 8 }} />
    </div>
  );
}
