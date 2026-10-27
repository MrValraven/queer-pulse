import { FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FeatureUsageDetailSummary } from "./FeatureUsageDetailSummary";
import { FeatureUsageReachChart } from "./FeatureUsageReachChart";
import { FeatureUsageCreatedChart } from "./FeatureUsageCreatedChart";
import { FeatureUsageDrillDown } from "./FeatureUsageDrillDown";
import {
  hasFeatureUsageDrillDown,
  isReachZeroInBothPeriods,
} from "./featureUsageDetail.helpers";
import type {
  FeatureUsageRangeSelection,
  FeatureUsageWindow,
} from "./featureUsageRange";
import type {
  AdminFeatureUsageDTO,
  ClassifiedFeature,
} from "./api/adminFeatureUsage.api";
import styles from "./FeatureUsageDetailPanel.module.css";

/**
 * One feature's open row: a time-range read of its reach and, where members
 * author rows, of what they created. Top to bottom: the summary strip, reach
 * per day against the previous period, created per day (lazy, and only for
 * a feature with depth, so `feed`, `content` and `cinema` never fetch), the
 * partial-history note, and the drill-down counts for the three features
 * that have them.
 *
 * When both periods had no requests at all, one quiet line stands for the
 * summary and the charts. While the table above still shows the previous
 * range (`isStale`), the created chart holds its loading state, so its
 * subtitle and its series always describe the same range.
 *
 * Mounted inside the row's `Collapse`, so nothing here renders or fetches
 * until the row opens. A not-launched feature opens too and reads as zeros.
 */
export function FeatureUsageDetailPanel({
  feature,
  featureName,
  window,
  selection,
  drillDowns,
  isStale,
}: {
  feature: ClassifiedFeature;
  featureName: string;
  window: FeatureUsageWindow;
  selection: FeatureUsageRangeSelection;
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
  isStale: boolean;
}) {
  const { t } = useTranslation();
  const isQuietInBothPeriods = isReachZeroInBothPeriods(
    feature.reachDaily,
    feature.reachPreviousDaily,
  );

  return (
    <div
      role="region"
      aria-label={t("admin:featureUsage.detail.regionLabel", {
        feature: featureName,
      })}
      className={styles.panel}
    >
      {isQuietInBothPeriods ? (
        <p className={styles.emptyBoth}>
          {t("admin:featureUsage.detail.emptyBoth")}
        </p>
      ) : (
        <>
          <FeatureUsageDetailSummary
            reachDaily={feature.reachDaily}
            rangeStart={window.rangeStart}
          />
          <FeatureUsageReachChart
            feature={feature}
            featureName={featureName}
            window={window}
          />
          {feature.depth !== null && (
            <FeatureUsageCreatedChart
              feature={feature}
              featureName={featureName}
              window={window}
              selection={selection}
              isStale={isStale}
            />
          )}
        </>
      )}
      {window.isPreviousRangePartial && (
        <p className={styles.partialNote}>
          <FiInfo aria-hidden />
          {t("admin:featureUsage.detail.previousPartial")}
        </p>
      )}
      {hasFeatureUsageDrillDown(feature.featureKey) && (
        <section className={styles.drillDown}>
          <h2 className={styles.drillDownTitle}>
            {t("admin:featureUsage.detail.drillDownTitle")}
          </h2>
          <FeatureUsageDrillDown
            featureKey={feature.featureKey}
            drillDowns={drillDowns}
          />
        </section>
      )}
    </div>
  );
}
