import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiEdit3, FiGlobe, FiLock, FiMapPin } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NEIGHBOURHOOD_OTHER_ID } from "./compose/composeNeighbourhoods.data";
import type { Thread } from "./forum.data";
import styles from "./ThreadPage.module.css";

/** A date a member has to act on carries its time of day: "goes live 4 Oct"
 *  is not enough to know whether to wait ten minutes or overnight. */
const DATE_AND_TIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
};

/** The catalog key for each language the composer can state. Anything else,
 *  including the null the older threads carry, has no label and renders as
 *  nothing, so the page never guesses. */
const LANGUAGE_KEY: Record<string, string> = {
  pt: "forum:opMeta.languagePt",
  en: "forum:opMeta.languageEn",
  both: "forum:opMeta.languageBoth",
};

/**
 * Where the thread is about and what it is written in.
 *
 * QUIET METADATA, deliberately: a line of small ink under the post, beside the
 * tags, kept quieter than the title. Neighbourhood names are
 * proper nouns and print verbatim; only the composer's trailing "Other" is UI
 * copy, so only it carries a key.
 */
export function ThreadOpMeta({
  neighbourhood,
  language,
}: {
  neighbourhood: string | null | undefined;
  language: string | null | undefined;
}) {
  const { t } = useTranslation();
  const languageKey = language ? LANGUAGE_KEY[language] : undefined;
  if (!neighbourhood && !languageKey) return null;
  return (
    <p className={styles.opMeta}>
      {neighbourhood && (
        <span className={styles.opMetaItem}>
          <FiMapPin aria-hidden="true" />
          {t("forum:opMeta.neighbourhood", {
            name:
              neighbourhood === NEIGHBOURHOOD_OTHER_ID
                ? t("forum:composePage.neighbourhood.other")
                : neighbourhood,
          })}
        </span>
      )}
      {languageKey && (
        <span className={styles.opMetaItem}>
          <FiGlobe aria-hidden="true" />
          {t("forum:opMeta.language", { language: t(languageKey) })}
        </span>
      )}
    </p>
  );
}

/**
 * The notice on a thread the forum cannot see yet, in the author's voice for
 * the author and in a neutral voice for a moderator.
 *
 * The backend lets an author reach their own scheduled or under-review thread
 * by link while every member-facing read path hides the row, so somebody
 * standing on this page can be looking at a post nobody else can open. This
 * says which of the two it is and when, so that silence reads as the plan
 * and the thread reads as waiting.
 *
 * `isPublished` is the server's own conjunction; the state underneath it comes
 * from `reviewState` and `publishedAt`, in that order, because a thread sent
 * for review is awaiting a person, and a scheduled one is awaiting a clock.
 *
 * A moderator reaches the same page from Forum review ("Read the thread"), and
 * "You sent this for review" would misname them. The server's own flags tell
 * the two apart: `canEditTitle` is the thread author's permission, `canLock`
 * and `canPin` are the moderator's. A moderator who wrote the thread keeps the
 * author's voice. Demo threads carry none of these flags, so demo keeps the
 * author's notice it was written to show.
 */
export function ThreadStateNotice({ thread }: { thread: Thread }) {
  const { t } = useTranslation();
  const format = useFormat();
  if (thread.isPublished !== false) return null;

  const isModeratorViewer =
    !thread.canEditTitle && !!(thread.canLock || thread.canPin);
  if (isModeratorViewer) return <ModeratorStateNotice thread={thread} />;

  if (thread.reviewState === "pending") {
    return (
      <Notice
        icon={<FiEdit3 aria-hidden="true" />}
        title={t("forum:unpublished.reviewTitle")}
        body={t("forum:unpublished.reviewBody")}
      />
    );
  }
  if (thread.reviewState === "rejected") {
    return (
      <Notice
        icon={<FiEdit3 aria-hidden="true" />}
        title={t("forum:unpublished.rejectedTitle")}
        body={t("forum:unpublished.rejectedBody")}
      />
    );
  }
  return (
    <Notice
      icon={<FiClock aria-hidden="true" />}
      title={t("forum:unpublished.scheduledTitle")}
      body={
        thread.publishedAt
          ? t("forum:unpublished.scheduledBody", {
              date: format.date(new Date(thread.publishedAt), DATE_AND_TIME),
            })
          : t("forum:unpublished.scheduledBodyNoDate")
      }
    />
  );
}

/**
 * Stands in for the reply composer once the AUTHOR's own deadline has passed.
 *
 * A moderator's lock and an author's closing date are different facts, so they
 * are two banners saying two things: this one carries no reprimand, because
 * nobody did anything wrong. Same plum-panel shape as the locked banner, and
 * the conversation above it stays fully readable.
 */
export function ThreadClosedBanner({
  closesAt,
}: {
  closesAt: string | null | undefined;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <div className={styles.lockedBanner} role="status">
      <FiLock className={styles.lockedIcon} aria-hidden="true" />
      <div>
        <p className={styles.lockedTitle}>{t("forum:closed.title")}</p>
        <p className={styles.lockedBody}>
          {closesAt
            ? t("forum:closed.bodyOn", {
                date: format.date(new Date(closesAt), DATE_AND_TIME),
              })
            : t("forum:closed.body")}
        </p>
      </div>
    </div>
  );
}

/**
 * What a moderator reads on a scheduled, pending or sent-back thread: the same
 * three states, said about the author. A pending thread links back to Forum
 * review, where the approve and decline controls live. The thread page itself
 * carries none.
 */
function ModeratorStateNotice({ thread }: { thread: Thread }) {
  const { t } = useTranslation();
  const format = useFormat();
  if (thread.reviewState === "pending") {
    return (
      <Notice
        icon={<FiEdit3 aria-hidden="true" />}
        title={t("forum:unpublished.moderatorReviewTitle")}
        body={
          <Translation
            i18nKey="forum:unpublished.moderatorReviewBody"
            components={{
              link: (
                <Link
                  to={routes.adminForumReview}
                  className={styles.stateNoticeLink}
                />
              ),
            }}
          />
        }
      />
    );
  }
  if (thread.reviewState === "rejected") {
    return (
      <Notice
        icon={<FiEdit3 aria-hidden="true" />}
        title={t("forum:unpublished.moderatorRejectedTitle")}
        body={t("forum:unpublished.moderatorRejectedBody")}
      />
    );
  }
  return (
    <Notice
      icon={<FiClock aria-hidden="true" />}
      title={t("forum:unpublished.scheduledTitle")}
      body={
        thread.publishedAt
          ? t("forum:unpublished.moderatorScheduledBody", {
              date: format.date(new Date(thread.publishedAt), DATE_AND_TIME),
            })
          : t("forum:unpublished.moderatorScheduledBodyNoDate")
      }
    />
  );
}

/** The shared shape of the state notices above. */
function Notice({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: ReactNode;
}) {
  return (
    <div className={styles.stateNotice} role="status">
      <span className={styles.stateNoticeIcon}>{icon}</span>
      <div>
        <p className={styles.stateNoticeTitle}>{title}</p>
        <p className={styles.stateNoticeBody}>{body}</p>
      </div>
    </div>
  );
}
