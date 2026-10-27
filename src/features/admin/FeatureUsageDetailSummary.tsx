import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatShortDay } from "./featureUsageRange";
import { summarizeDaily } from "./featureUsageDetail.helpers";
import styles from "./FeatureUsageDetailPanel.module.css";

/**
 * Three readings of one feature's reach over the selected range: its busiest
 * day, the average per day, and how many days had no requests at all. A
 * description list, so a screen reader hears each label with its value.
 */
export function FeatureUsageDetailSummary({
  reachDaily,
  rangeStart,
}: {
  reachDaily: readonly number[];
  rangeStart: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const summary = summarizeDaily(reachDaily, rangeStart);

  return (
    <dl className={styles.summary}>
      <div className={styles.summaryItem}>
        <dt className={styles.summaryLabel}>
          {t("admin:featureUsage.detail.summary.peak")}
        </dt>
        {summary.peak ? (
          <dd className={styles.summaryValue}>
            {t("admin:featureUsage.detail.summary.peakValue", {
              countLabel: t("admin:featureUsage.detail.tip.requests", {
                count: summary.peak.value,
                countLabel: fmt.number(summary.peak.value),
              }),
              day: formatShortDay(summary.peak.day, fmt),
            })}
          </dd>
        ) : (
          <dd className={`${styles.summaryValue} ${styles.summaryValueMuted}`}>
            {t("admin:featureUsage.detail.summary.peakNone")}
          </dd>
        )}
      </div>
      <div className={styles.summaryItem}>
        <dt className={styles.summaryLabel}>
          {t("admin:featureUsage.detail.summary.average")}
        </dt>
        <dd className={styles.summaryValue}>
          {fmt.number(summary.averagePerDay, { maximumFractionDigits: 1 })}
        </dd>
      </div>
      <div className={styles.summaryItem}>
        <dt className={styles.summaryLabel}>
          {t("admin:featureUsage.detail.summary.zeroDays")}
        </dt>
        <dd className={styles.summaryValue}>
          {t("admin:featureUsage.detail.summary.zeroDaysValue", {
            zeroDays: fmt.number(summary.zeroDays),
            totalDays: fmt.number(summary.totalDays),
          })}
        </dd>
      </div>
    </dl>
  );
}
