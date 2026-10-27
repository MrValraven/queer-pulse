import { useRef, type ReactNode } from "react";
import { CHART_INK, type linearScale } from "../../shared/components/charts";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useFormat } from "../../shared/i18n/format";
import { isDayLabelled } from "./featureUsageDetail.helpers";
import dashboardStyles from "./AdminDashboardPage.module.css";
import {
  DETAIL_CHART_PAD_LEFT,
  DETAIL_CHART_PAD_RIGHT,
  axisTickLabel,
  columnCentre,
  type detailColumnScale,
} from "./adminChartAxis.helpers";
import styles from "./FeatureUsageDetailPanel.module.css";

/** The plot's own box in a detail chart. A touch reading stays up after the
 *  finger lifts, so a press outside the box is what closes it. */
export function DetailPlotArea({
  tip,
  children,
}: {
  tip: { tooltipOpen: boolean; hideTooltip: () => void };
  children: ReactNode;
}) {
  const plotAreaRef = useRef<HTMLDivElement>(null);
  useOutsideDismiss(tip.tooltipOpen, plotAreaRef, tip.hideTooltip);
  return (
    <div ref={plotAreaRef} className={styles.plotBody}>
      {children}
    </div>
  );
}

/** Day labels under a line plot, on the same columns the reach bars use, so
 *  the created chart lines up day for day with the reach chart above it.
 *  The newest day is labelled in the strong style and anchored to its end. */
export function DetailDayLabels({
  dayLabels,
  columnScale,
  labelStep,
  labelY,
}: {
  dayLabels: readonly string[];
  columnScale: ReturnType<typeof detailColumnScale>;
  labelStep: number;
  labelY: number;
}) {
  const lastIndex = dayLabels.length - 1;
  return (
    <g aria-hidden>
      {dayLabels.map((dayLabel, index) =>
        isDayLabelled(index, lastIndex, labelStep) ? (
          <text
            key={index}
            x={columnCentre(columnScale, index)}
            y={labelY}
            textAnchor="middle"
            className={
              index === lastIndex
                ? dashboardStyles.chLabelStrong
                : dashboardStyles.chLabel
            }
          >
            {dayLabel}
          </text>
        ) : null,
      )}
    </g>
  );
}

/** The value gridlines and their compact labels for a hand-drawn detail
 *  plot (the bar plot draws its own through `BarPlot`). */
export function DetailValueGrid({
  ticks,
  valueScale,
  width,
}: {
  ticks: readonly number[];
  valueScale: ReturnType<typeof linearScale>;
  width: number;
}) {
  const fmt = useFormat();
  return (
    <>
      {ticks.map((value) => (
        <g key={value}>
          <line
            x1={DETAIL_CHART_PAD_LEFT}
            y1={valueScale(value)}
            x2={width - DETAIL_CHART_PAD_RIGHT}
            y2={valueScale(value)}
            stroke={CHART_INK.grid}
            strokeWidth={1}
          />
          <text
            x={DETAIL_CHART_PAD_LEFT - 8}
            y={valueScale(value) + 4}
            textAnchor="end"
            className={dashboardStyles.chAxisSerif}
          >
            {axisTickLabel(value, fmt)}
          </text>
        </g>
      ))}
    </>
  );
}
