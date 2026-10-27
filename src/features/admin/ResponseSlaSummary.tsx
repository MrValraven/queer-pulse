import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminBarCharts.module.css";

interface ResponseSlaSummaryProps {
  withinCount: number;
  totalCount: number;
  slaHours: string;
}

/** Headline above the response-time bars: the share answered inside the SLA,
 *  with the counts behind it. Numbers roll when the data changes. */
export function ResponseSlaSummary({
  withinCount,
  totalCount,
  slaHours,
}: ResponseSlaSummaryProps) {
  const { t } = useTranslation();
  if (totalCount === 0) {
    return (
      <p className={styles.slaSummary}>
        {t("admin:dashboard.charts.responseTime.noResponses")}
      </p>
    );
  }
  const percent = Math.round((withinCount / totalCount) * 100);
  const isHealthy = percent >= 80;
  return (
    <div className={styles.slaSummary}>
      <span
        className={`${styles.slaPercent} ${isHealthy ? styles.slaHealthy : styles.slaWarning}`}
      >
        <RollingNumber
          value={`${percent}%`}
          numericValue={percent}
          revealFrom={{ value: "0%", numericValue: 0 }}
        />
      </span>
      <span className={styles.slaSentence}>
        <Translation
          i18nKey="admin:dashboard.charts.responseTime.summary"
          values={{ within: withinCount, total: totalCount, hours: slaHours }}
          slots={{
            within: (
              <RollingNumber
                value={String(withinCount)}
                numericValue={withinCount}
              />
            ),
            total: (
              <RollingNumber
                value={String(totalCount)}
                numericValue={totalCount}
              />
            ),
          }}
        />
      </span>
    </div>
  );
}
