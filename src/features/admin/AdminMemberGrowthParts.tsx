import { CHART_INK } from "../../shared/components/charts";
import { useFormat } from "../../shared/i18n/format";
import type { GrowthPoint } from "./adminDashboard.data";
import { monthTicks } from "./adminMemberGrowth.helpers";
import dashboardStyles from "./AdminDashboardPage.module.css";
import styles from "./AdminMemberGrowthChart.module.css";

/**
 * The reading's marks: a hairline guide from the plot top to the baseline
 * under the active point, and a jade dot on the line at its value. The group
 * moves by transform, so sliding from one week to the next is a short
 * transition, and it fades in place when the reading closes.
 */
export function MemberGrowthCrosshair({
  x,
  y,
  plotTop,
  plotBottom,
  isVisible,
}: {
  x: number;
  y: number;
  plotTop: number;
  plotBottom: number;
  isVisible: boolean;
}) {
  return (
    <g
      className={[styles.crosshair, isVisible && styles.crosshairVisible]
        .filter(Boolean)
        .join(" ")}
      style={{ transform: `translateX(${x}px)` }}
      aria-hidden
    >
      <line
        x1={0}
        y1={plotTop}
        x2={0}
        y2={plotBottom}
        stroke={CHART_INK.guide}
        strokeWidth={1}
      />
      <circle
        className={styles.crosshairDot}
        style={{ transform: `translateY(${y}px)` }}
        cx={0}
        cy={0}
        r={4.5}
        fill="var(--jade)"
        stroke="var(--paper)"
        strokeWidth={2}
      />
    </g>
  );
}

/** The month names under the x-axis, thinned on a long range and anchored
 *  inside the plot at both edges (see `monthTicks`). */
export function MemberGrowthMonthLabels({
  points,
  pointX,
  plotLeft,
  plotRight,
  labelY,
}: {
  points: GrowthPoint[];
  pointX: (index: number) => number;
  plotLeft: number;
  plotRight: number;
  labelY: number;
}) {
  const fmt = useFormat();
  return (
    <>
      {monthTicks(points, pointX, plotLeft, plotRight).map((tick) => (
        <text
          key={tick.index}
          x={pointX(tick.index)}
          y={labelY}
          textAnchor={tick.anchor}
          className={dashboardStyles.chLabel}
        >
          {fmt.date(points[tick.index]!.date, { month: "short" })}
        </text>
      ))}
    </>
  );
}
