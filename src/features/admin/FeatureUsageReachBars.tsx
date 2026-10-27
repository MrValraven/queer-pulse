import { CHART_INK } from "../../shared/components/charts/chartColors";
import {
  REACH_BARS_BASELINE_Y,
  REACH_BARS_HEIGHT,
  buildReachBarsGeometry,
} from "./featureUsageReachBars.helpers";
import styles from "./FeatureUsageReachCell.module.css";

/**
 * The Reach cell's mini chart: one slot per day, oldest on the left, or
 * one per 7-day bucket once the range passes 60 days. The
 * previous period sits behind as faint full-width bars and this period
 * stands on top as accent bars, so a slot that was busier last time
 * shows a ghost rising past its bar. Decorative: the comparison line beside
 * it carries the numbers, so the mark is `aria-hidden`.
 *
 * The viewBox is one unit wide per slot and stretched to the CSS box with
 * `preserveAspectRatio="none"`, so 7 days and 365 days fill the same 120px.
 */
export function FeatureUsageReachBars({
  currentDaily,
  previousDaily,
}: {
  currentDaily: number[];
  previousDaily: number[];
}) {
  const { slotCount, previousPath, currentPath } = buildReachBarsGeometry(
    currentDaily,
    previousDaily,
  );

  return (
    <svg
      className={styles.bars}
      viewBox={`0 0 ${slotCount} ${REACH_BARS_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      {previousPath ? (
        <path className={styles.previousBars} d={previousPath} />
      ) : null}
      {currentPath ? (
        <path className={styles.currentBars} d={currentPath} />
      ) : null}
      <line
        x1={0}
        x2={slotCount}
        y1={REACH_BARS_BASELINE_Y + 0.5}
        y2={REACH_BARS_BASELINE_Y + 0.5}
        stroke={CHART_INK.grid}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
