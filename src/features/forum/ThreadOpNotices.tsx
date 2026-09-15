import type { ReactNode } from "react";
import { FiClock, FiEdit3, FiGlobe, FiLock, FiMapPin } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
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
 *  nothing rather than as a guess. */
const LANGUAGE_KEY: Record<string, string> = {
  pt: "forum:opMeta.languagePt",
  en: "forum:opMeta.languageEn",
  both: "forum:opMeta.languageBoth",
};

/**
 * Where the thread is about and what it is written in.
 *
 * QUIET METADATA, deliberately: a line of small ink under the post, beside the
 * tags, rather than a badge competing with the title. Neighbourhood names are
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
 * The notice an AUTHOR sees on a thread the forum cannot see yet.
 *
 * The backend lets an author reach their own scheduled or under-review thread
 * by link while every member-facing read path hides the row, so somebody
 * standing on this page can be looking at a post nobody else can open. This
 * says which of the two it is and when, so that silence reads as the plan
 * rather than as a thread that vanished.
 *
 * `isPublished` is the server's own conjunction; the state underneath it comes
 * from `reviewState` and `publishedAt`, in that order, because a thread sent
 * for review is awaiting a person rather than a clock.
 */
export function ThreadStateNotice({ thread }: { thread: Thread }) {
  const { t } = useTranslation();
  const format = useFormat();
  if (thread.isPublished !== false) return null;

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

/** The shared shape of the author-only state notices above. */
function Notice({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
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
