import { Link } from "react-router-dom";
import { FiArrowRight, FiInfo } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPanel, adminTableClasses } from "./ui";
import type { FeedItem } from "./adminDashboard.data";
import { routes } from "../../app/routeMap";
import styles from "./AdminDashboardPage.module.css";

const FEED_ROW_CLASS = `${adminTableClasses.row} ${styles.fItem}`;

const LEADING_PUNCTUATION = /^[.,;:!?)]/;

/** The text after the highlighted word: punctuation hugs the word before it,
 *  any other continuation gets one space. */
function joinFeedTail(tail: string): string {
  return LEADING_PUNCTUATION.test(tail) ? tail : ` ${tail}`;
}

/** The Overview's live activity rail: the latest platform events, a link to
 *  the full log, and the transparency note as the panel's footer. */
export function AdminDashboardFeed({
  feed,
  loading = false,
}: {
  feed: FeedItem[];
  loading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <AdminPanel
      className={`${styles.feedPanel} ${styles.feedRail}`}
      title={t("admin:dashboard.feed.title")}
      actions={
        <span className={styles.live}>
          <span className={styles.liveDot} aria-hidden />
          {t("admin:dashboard.feed.live")}
        </span>
      }
      padding="flush"
    >
      <div className={styles.rowList}>
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={FEED_ROW_CLASS}>
                <SkeletonLine height={42} />
              </div>
            ))
          : feed.map(
              ({
                id,
                tone,
                icon: Icon,
                lead,
                body,
                em,
                bodyAfter,
                time,
                to,
              }) => (
                <Link key={id} to={to} className={FEED_ROW_CLASS}>
                  <span
                    className={[styles.fIco, styles[`tone_${tone}`]].join(" ")}
                  >
                    <Icon aria-hidden />
                  </span>
                  <span className={styles.fTx}>
                    <b>{lead}</b> {body} {em && <em>{em}</em>}
                    {bodyAfter ? joinFeedTail(bodyAfter) : ""}
                    <span className={styles.fTime}>{time}</span>
                  </span>
                </Link>
              ),
            )}
      </div>
      <div className={styles.feedAllRow}>
        <Link to={routes.adminLog} className={styles.textLink}>
          {t("admin:dashboard.feed.seeAllCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
      <p className={styles.transparency}>
        <FiInfo className={styles.transparencyIco} aria-hidden />
        <span>
          <Translation
            i18nKey="admin:dashboard.feed.transparency"
            components={{ strong: <b /> }}
          />{" "}
          <Link to={routes.adminLog} className={styles.textLink}>
            {t("admin:dashboard.feed.auditLinkCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </span>
      </p>
    </AdminPanel>
  );
}
