import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ClassifiedFeature } from "./api/adminFeatureUsage.api";
import type { FeatureUsageWindow } from "./featureUsageRange";
import {
  compareReach,
  comparisonDirection,
  medianNoteText,
  medianStanding,
  reachComparisonText,
} from "./featureUsageReach.helpers";
import { FeatureUsageReachBars } from "./FeatureUsageReachBars";
import styles from "./FeatureUsageReachCell.module.css";

const DIRECTION_CLASS = {
  up: styles.comparison_up,
  down: styles.comparison_down,
  flat: undefined,
} as const;

/**
 * The content of one Reach cell (the row owns the `<td>`): the period's
 * reach with its daily bars beside it, a comparison line against the
 * previous window (the column header names its dates once), and a quiet note
 * on where the feature sits against the launched-feature median.
 *
 * When only part of the previous window is still kept, the comparison runs
 * low, so the line stays neutral and a muted note under it says why.
 *
 * The median note stays off when the classifier had no reach signal, for a
 * feature that has not launched (it is outside the median by definition),
 * and when there is no median or no reach to place against it.
 */
export function FeatureUsageReachCell({
  feature,
  window,
  reachMedian,
  hasReachSignal,
}: {
  feature: ClassifiedFeature;
  window: FeatureUsageWindow;
  reachMedian: number;
  hasReachSignal: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const comparison = compareReach(feature.reach, feature.reachPrevious);
  const direction = comparisonDirection(
    comparison,
    window.isPreviousRangePartial,
  );
  const TrendIcon =
    direction === "up"
      ? FiTrendingUp
      : direction === "down"
        ? FiTrendingDown
        : null;
  const standing =
    hasReachSignal && feature.isLaunched
      ? medianStanding(feature.reach, reachMedian)
      : null;

  return (
    <div className={styles.cell}>
      <div className={styles.headline}>
        <span className={styles.value}>{fmt.number(feature.reach)}</span>
        <FeatureUsageReachBars
          currentDaily={feature.reachDaily}
          previousDaily={feature.reachPreviousDaily}
        />
      </div>
      <p
        className={[styles.comparison, DIRECTION_CLASS[direction]]
          .filter(Boolean)
          .join(" ")}
      >
        {TrendIcon ? (
          <TrendIcon className={styles.comparisonIcon} aria-hidden />
        ) : null}
        <span>{reachComparisonText(comparison, fmt, t)}</span>
      </p>
      {window.isPreviousRangePartial ? (
        <p className={styles.partialNote}>
          {t("admin:featureUsage.reachCompare.partial")}
        </p>
      ) : null}
      {standing ? (
        <p className={styles.median}>{medianNoteText(standing, fmt, t)}</p>
      ) : null}
    </div>
  );
}
