import { FiAlertTriangle, FiHeart } from "react-icons/fi";
import { Card, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip } from "./ui";
import { useAdminReportsCommunityHealth } from "./api/useAdminReportsCommunityHealth";
import styles from "./AdminReportsPage.module.css";

/**
 * A CURRENT community-health snapshot — average score, needing-support
 * count, and the per-community table — honestly labelled "as of {time}"
 * rather than a fabricated trend. There is no historical community-health
 * table anywhere on the platform (no cron writes one), so this section has
 * no range control and never will until that data exists.
 */
export function AdminReportsCommunityHealthSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data, isLoading } = useAdminReportsCommunityHealth();

  return (
    <Card className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>
            {t("admin:reports.communityHealth.title")}
          </h2>
          <p className={styles.cardSub}>
            {data
              ? t("admin:reports.communityHealth.asOfNow", {
                  time: fmt.date(new Date(data.generatedAt), {
                    hour: "numeric",
                    minute: "numeric",
                  }),
                })
              : t("admin:reports.communityHealth.sub")}
          </p>
        </div>
      </div>

      {isLoading || !data ? (
        <SkeletonLine height={200} style={{ borderRadius: 14 }} />
      ) : (
        <>
          <div className={styles.healthSummary}>
            <span className={styles.healthStat}>
              <FiHeart aria-hidden />
              {data.averageScore === null
                ? t("admin:reports.communityHealth.notMeasured")
                : t("admin:reports.communityHealth.averageScore", {
                    score: data.averageScore,
                  })}
            </span>
            <span className={styles.healthStat}>
              <FiAlertTriangle aria-hidden />
              {t("admin:reports.communityHealth.needingSupport", {
                count: data.needingSupportCount,
              })}
            </span>
          </div>

          <div className={styles.healthTable} role="table">
            <div className={styles.healthRowHead} role="row">
              <span role="columnheader">
                {t("admin:reports.communityHealth.columns.name")}
              </span>
              <span role="columnheader">
                {t("admin:reports.communityHealth.columns.score")}
              </span>
              <span role="columnheader">
                {t("admin:reports.communityHealth.columns.activity")}
              </span>
              <span role="columnheader">
                {t("admin:reports.communityHealth.columns.members")}
              </span>
              <span role="columnheader">
                {t("admin:reports.communityHealth.columns.openReports")}
              </span>
            </div>

            {data.communities.map((community) => (
              <div key={community.slug} className={styles.healthRow} role="row">
                <span role="cell">{community.name}</span>
                <span role="cell">{community.healthScore}</span>
                <span role="cell">{community.activityLabel}</span>
                <span role="cell">{fmt.number(community.memberCount)}</span>
                <span role="cell" className={styles.healthOpenReports}>
                  {community.openReportCount}
                  {community.needsSupport && (
                    <AdminChip tone="amber">
                      {t("admin:reports.communityHealth.needsSupportChip")}
                    </AdminChip>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
