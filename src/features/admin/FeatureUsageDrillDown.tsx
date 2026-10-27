import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { AdminFeatureUsageDTO } from "./api/adminFeatureUsage.api";
import styles from "./FeatureUsageDetailPanel.module.css";

function FeatureUsageDetailItem({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailValue}>{value}</span>
      <span className={styles.detailLabel}>{label}</span>
    </div>
  );
}

/** One drill-down's inline content. `communities`'s `stillPostingThisWeek` is
 *  a rolling 7-day count regardless of the range selector above the table, so
 *  its note is the one thing here that cannot be left implicit. */
export function FeatureUsageDrillDown({
  featureKey,
  drillDowns,
}: {
  featureKey: string;
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (featureKey === "housingListings") {
    const data = drillDowns.housingListings;
    return (
      <div className={styles.detailGrid}>
        <FeatureUsageDetailItem
          value={fmt.number(data.listings)}
          label={t("admin:featureUsage.drillDown.housingListings.listings")}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.savedSearches)}
          label={t(
            "admin:featureUsage.drillDown.housingListings.savedSearches",
          )}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.viewings)}
          label={t("admin:featureUsage.drillDown.housingListings.viewings")}
        />
      </div>
    );
  }

  if (featureKey === "forum") {
    const data = drillDowns.forum;
    return (
      <div className={styles.detailGrid}>
        <FeatureUsageDetailItem
          value={fmt.number(data.threads)}
          label={t("admin:featureUsage.drillDown.forum.threads")}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.replies)}
          label={t("admin:featureUsage.drillDown.forum.replies")}
        />
      </div>
    );
  }

  if (featureKey === "communities") {
    const data = drillDowns.communities;
    return (
      <div className={styles.detailGrid}>
        <FeatureUsageDetailItem
          value={fmt.number(data.created)}
          label={t("admin:featureUsage.drillDown.communities.created")}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.stillPostingThisWeek)}
          label={t(
            "admin:featureUsage.drillDown.communities.stillPostingThisWeek",
          )}
        />
        <p className={styles.detailNote}>
          {t("admin:featureUsage.drillDown.communities.stillPostingNote")}
        </p>
      </div>
    );
  }

  return null;
}
