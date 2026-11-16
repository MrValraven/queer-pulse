import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatShortDay } from "./featureUsageRange";
import { summarizeDaily } from "./featureUsageDetail.helpers";
import { AdminStat, AdminStatTiles } from "./ui";
import styles from "./FeatureUsageDetailPanel.module.css";

/**
 * Three readings of one feature's reach over the selected range: its busiest
 * day, the average per day, and how many days had no requests at all. Kit
 * stat tiles, so a screen reader hears each label with its value. The figures
 * sit a step under the page's headline tiles, since the peak is a phrase
 * ("412 requests on 4 Nov") and the panel is narrower than the page.
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
    <AdminStatTiles columns={3}>
      <AdminStat
        label={t("admin:featureUsage.detail.summary.peak")}
        value={
          summary.peak ? (
            <span className={styles.summaryValue}>
              {t("admin:featureUsage.detail.summary.peakValue", {
                countLabel: t("admin:featureUsage.detail.tip.requests", {
                  count: summary.peak.value,
                  countLabel: fmt.number(summary.peak.value),
                }),
                day: formatShortDay(summary.peak.day, fmt),
              })}
            </span>
          ) : (
            <span
              className={`${styles.summaryValue} ${styles.summaryValueMuted}`}
            >
              {t("admin:featureUsage.detail.summary.peakNone")}
            </span>
          )
        }
      />
      <AdminStat
        label={t("admin:featureUsage.detail.summary.average")}
        value={
          <span className={styles.summaryValue}>
            {fmt.number(summary.averagePerDay, { maximumFractionDigits: 1 })}
          </span>
        }
      />
      <AdminStat
        label={t("admin:featureUsage.detail.summary.zeroDays")}
        value={
          <span className={styles.summaryValue}>
            {t("admin:featureUsage.detail.summary.zeroDaysValue", {
              zeroDays: fmt.number(summary.zeroDays),
              totalDays: fmt.number(summary.totalDays),
            })}
          </span>
        }
      />
    </AdminStatTiles>
  );
}
