import { FiAlertTriangle, FiHeart } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  AdminChip,
  AdminPanel,
  AdminStat,
  AdminStatTiles,
  AdminTable,
  adminTableClasses,
} from "./ui";
import { useAdminReportsCommunityHealth } from "./api/useAdminReportsCommunityHealth";
import styles from "./AdminReportsPage.module.css";

/**
 * A CURRENT community-health snapshot (average score, needing-support
 * count, and the per-community table), honestly labelled "as of {time}"
 * and shown as a single reading with no trend line. There is no historical community-health
 * table anywhere on the platform (no cron writes one), so this section has
 * no range control and never will until that data exists.
 */
export function AdminReportsCommunityHealthSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data, isLoading } = useAdminReportsCommunityHealth();

  return (
    <AdminPanel
      title={t("admin:reports.communityHealth.title")}
      description={
        data
          ? t("admin:reports.communityHealth.asOfNow", {
              time: fmt.date(new Date(data.generatedAt), {
                hour: "numeric",
                minute: "numeric",
              }),
            })
          : t("admin:reports.communityHealth.sub")
      }
      padding="flush"
    >
      {isLoading || !data ? (
        <div className={styles.healthBand}>
          <SkeletonLine height={200} style={{ borderRadius: 14 }} />
        </div>
      ) : (
        <>
          <div className={styles.healthBand}>
            <AdminStatTiles columns={2}>
              <AdminStat
                icon={FiHeart}
                label={t("admin:reports.communityHealth.stat.averageScore")}
                value={
                  data.averageScore === null ? (
                    // Never a measured zero: muted italic, like the
                    // Overview's unmeasured tiles.
                    <span className={styles.notMeasured}>
                      {t("admin:reports.communityHealth.notMeasured")}
                    </span>
                  ) : (
                    fmt.number(data.averageScore)
                  )
                }
              />
              <AdminStat
                icon={FiAlertTriangle}
                tone={data.needingSupportCount > 0 ? "warn" : "default"}
                label={t("admin:reports.communityHealth.stat.needingSupport")}
                value={fmt.number(data.needingSupportCount)}
              />
            </AdminStatTiles>
          </div>

          <AdminTable
            label={t("admin:reports.communityHealth.tableLabel")}
            isBare
          >
            <thead>
              <tr>
                <th scope="col">
                  {t("admin:reports.communityHealth.columns.name")}
                </th>
                <th scope="col" className={adminTableClasses.numeric}>
                  {t("admin:reports.communityHealth.columns.score")}
                </th>
                <th scope="col">
                  {t("admin:reports.communityHealth.columns.activity")}
                </th>
                <th scope="col" className={adminTableClasses.numeric}>
                  {t("admin:reports.communityHealth.columns.members")}
                </th>
                <th scope="col" className={adminTableClasses.numeric}>
                  {t("admin:reports.communityHealth.columns.openReports")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.communities.map((community) => (
                <tr key={community.slug}>
                  <th scope="row">{community.name}</th>
                  <td className={adminTableClasses.numeric}>
                    {community.healthScore}
                  </td>
                  <td>{community.activityLabel}</td>
                  <td className={adminTableClasses.numeric}>
                    {fmt.number(community.memberCount)}
                  </td>
                  <td className={adminTableClasses.numeric}>
                    <span className={styles.healthOpenReports}>
                      {community.needsSupport && (
                        <AdminChip tone="amber">
                          {t("admin:reports.communityHealth.needsSupportChip")}
                        </AdminChip>
                      )}
                      {community.openReportCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </>
      )}
    </AdminPanel>
  );
}
