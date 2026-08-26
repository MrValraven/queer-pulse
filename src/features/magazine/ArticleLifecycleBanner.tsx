import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiArchive, FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { formatDate } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  ArticleLifecycle,
  ArticleLifecycleNoticeDTO,
} from "./api/magazine.api";
import styles from "./ArticleLifecycleBanner.module.css";

export interface ArticleLifecycleBannerProps {
  lifecycle: ArticleLifecycle | undefined;
  notice: ArticleLifecycleNoticeDTO | undefined;
  /** The piece's own publish date, already formatted for display, so the
   *  reader sees how old it is without scrolling back to the byline. */
  publishedLabel: string;
}

/** Which icon carries each state. Never a Unicode glyph (`local/no-emoji`). */
const ICON_BY_STATE: Record<Exclude<ArticleLifecycle, "live">, IconType> = {
  under_review: FiRefreshCw,
  archived: FiArchive,
  superseded: FiArrowRight,
};

/** The state's own tone class, so a record note and a "there is a newer
 *  piece" pointer do not read as the same kind of warning. */
const TONE_BY_STATE: Record<Exclude<ArticleLifecycle, "live">, string> = {
  under_review: styles.review ?? "",
  archived: styles.archive ?? "",
  superseded: styles.superseded ?? "",
};

/**
 * CON-16 — the dated lifecycle banner.
 *
 * The point of the whole feature: a piece the desk no longer stands by stays
 * READABLE and stays in the archive, and the reader is told where it stands
 * instead of finding a 404 where a link used to be. Unpublishing was the only
 * retirement tool the magazine had, and it deleted the piece from the archive
 * along with every link anyone had shared.
 *
 * A `live` piece draws nothing, which is the page the reader has always had.
 * Every other state draws a block above the body carrying three honest things:
 * how old the piece is, when the desk last looked at it, and what the desk
 * says about it now. The editor's own sentence leads when they wrote one;
 * otherwise the generic wording for the state stands in, which says less and
 * is still true.
 */
export function ArticleLifecycleBanner({
  lifecycle,
  notice,
  publishedLabel,
}: ArticleLifecycleBannerProps) {
  const { t, language } = useTranslation();

  if (!lifecycle || lifecycle === "live") return null;

  const Icon = ICON_BY_STATE[lifecycle];
  const changedAt = notice?.changedAt;
  const note = notice?.note?.trim();
  const supersededBy = notice?.supersededBy ?? null;
  const reviewDueOn = notice?.reviewDueOn ?? null;

  return (
    <aside
      className={`${styles.banner} ${TONE_BY_STATE[lifecycle]}`}
      aria-labelledby="article-lifecycle-heading"
    >
      <span className={styles.icon} aria-hidden>
        <Icon />
      </span>
      <div className={styles.body}>
        <h2 className={styles.heading} id="article-lifecycle-heading">
          {t(`magazine:article.lifecycle.${lifecycle}.heading`)}
        </h2>

        <p className={styles.meta}>
          {publishedLabel &&
            t("magazine:article.lifecycle.publishedOn", {
              date: publishedLabel,
            })}
          {publishedLabel && changedAt && (
            <span className={styles.metaDot} aria-hidden>
              {" · "}
            </span>
          )}
          {changedAt && (
            <time dateTime={changedAt}>
              {t(`magazine:article.lifecycle.${lifecycle}.changedOn`, {
                date: formatDate(changedAt, language),
              })}
            </time>
          )}
        </p>

        <p className={styles.note}>
          {note || t(`magazine:article.lifecycle.${lifecycle}.fallbackNote`)}
        </p>

        {supersededBy && (
          <Link
            className={styles.replacement}
            to={`${routes.article}?id=${encodeURIComponent(supersededBy.slug)}`}
          >
            {t("magazine:article.lifecycle.readReplacement", {
              title: supersededBy.title,
            })}
            <FiArrowRight aria-hidden />
          </Link>
        )}

        {reviewDueOn && (
          <p className={styles.promise}>
            <time dateTime={reviewDueOn}>
              {t("magazine:article.lifecycle.reviewDue", {
                date: formatDate(reviewDueOn, language),
              })}
            </time>
          </p>
        )}
      </div>
    </aside>
  );
}
