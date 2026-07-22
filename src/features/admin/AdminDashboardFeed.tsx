import { Link } from "react-router-dom";
import { FiInfo } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { FeedItem } from "./adminDashboard.data";
import { routes } from "../../app/routeMap";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardFeed({
  feed,
  loading = false,
}: {
  feed: FeedItem[];
  loading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.feedRail}>
      <div className={styles.feedCard}>
        <div className={styles.feedHead}>
          <span className={styles.feedTitle}>
            {t("admin:dashboard.feed.title")}
          </span>
          <span className={styles.live}>
            <span className={styles.liveDot} aria-hidden />
            {t("admin:dashboard.feed.live")}
          </span>
        </div>
        <div className={styles.feed}>
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={styles.fItem}>
                  <SkeletonLine height={42} style={{ borderRadius: 11 }} />
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
                  <Link key={id} to={to} className={styles.fItem}>
                    <span
                      className={[styles.fIco, styles[`fIco_${tone}`]].join(
                        " ",
                      )}
                    >
                      <Icon aria-hidden />
                    </span>
                    <span className={styles.fTx}>
                      <b>{lead}</b> {body} {em && <em>{em}</em>}
                      {bodyAfter ? ` ${bodyAfter}` : ""}
                      <span className={styles.fTime}>{time}</span>
                    </span>
                  </Link>
                ),
              )}
        </div>
      </div>

      <div className={styles.transpCard}>
        <FiInfo className={styles.transpIco} aria-hidden />
        <span>
          <Translation
            i18nKey="admin:dashboard.feed.transparency"
            components={{ strong: <b /> }}
          />{" "}
          <Link to={routes.adminGovernance} className={styles.transpLink}>
            {t("admin:dashboard.feed.auditLinkCta")} →
          </Link>
        </span>
      </div>
    </div>
  );
}
