import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { localPoint } from "@visx/event";
import { LinePath } from "@visx/shape";
import {
  BarPlot,
  CHART_INK,
  linearScale,
  type useChartTooltip,
} from "../../shared/components/charts";
import { useFormat } from "../../shared/i18n/format";
import {
  niceAxis,
  nextBarIndex,
  DETAIL_CHART_PAD_LEFT,
  DETAIL_CHART_PAD_RIGHT,
  axisTickLabel,
  columnCentre,
  detailColumnScale,
  nearestColumnIndex,
} from "./adminChartAxis.helpers";
import {
  isDayLabelled,
  labelStepForWidth,
  staggerMsFor,
  type ReachDay,
  type ReachDayTip,
} from "./featureUsageDetail.helpers";
import dashboardStyles from "./AdminDashboardPage.module.css";
import chartStyles from "../../shared/components/charts/charts.module.css";
import styles from "./FeatureUsageDetailPanel.module.css";

const PAD_TOP = 12;
const PAD_BOTTOM = 30;

type ReachTooltip = ReturnType<typeof useChartTooltip<ReachDayTip>>;

/**
 * The reach chart's SVG: accent bars per day, the previous period as a
 * dashed line over the same column centres, a faint guide behind the bars
 * at the day being read, and a transparent layer on top that reads the
 * pointer across the whole plot (hairline bars on a 365-day range are too
 * thin to hover).
 * The bars share one tab stop; the arrow keys, Home and End move it.
 */
export function FeatureUsageReachPlot({
  days,
  width,
  height,
  tip,
  ariaLabel,
}: {
  days: ReachDay[];
  width: number;
  height: number;
  tip: ReachTooltip;
  ariaLabel: string;
}) {
  const fmt = useFormat();
  const lastIndex = days.length - 1;
  const [focusedIndex, setFocusedIndex] = useState(lastIndex);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const tabbableIndex = Math.min(focusedIndex, lastIndex);
  const plotBottom = height - PAD_BOTTOM;
  const { max, ticks } = niceAxis(
    Math.max(0, ...days.flatMap((day) => [day.value, day.previousValue])),
  );
  const valueScale = linearScale(max, PAD_TOP, plotBottom);
  const columnScale = detailColumnScale(days.length, width);
  const barWidth = columnScale.bandwidth();
  const labelStep = labelStepForWidth(days.length, columnScale.step());
  const staggerMs = staggerMsFor(days.length);
  // The guide spans the whole column step, gap included, centred on the bar.
  const guideLeft = (index: number) =>
    (columnScale(index) ?? 0) - (columnScale.step() - barWidth) / 2;
  const readingTop = (day: ReachDay) =>
    valueScale(Math.max(day.value, day.previousValue));

  const moveFocus = (event: KeyboardEvent<SVGRectElement>, index: number) => {
    const nextIndex = nextBarIndex(event.key, index, lastIndex);
    if (nextIndex === null) return;
    event.preventDefault();
    const bars =
      event.currentTarget.ownerSVGElement?.querySelectorAll<SVGRectElement>(
        'rect[role="img"]',
      );
    bars?.[nextIndex]?.focus();
  };

  const readPointer = (event: PointerEvent<SVGRectElement>) => {
    const point = localPoint(event);
    if (!point || days.length === 0) return;
    const index = nearestColumnIndex(columnScale, point.x, days.length);
    const day = days[index]!;
    setActiveIndex(index);
    tip.showTooltip({
      tooltipLeft: columnCentre(columnScale, index),
      tooltipTop: readingTop(day),
      tooltipData: day.tip,
    });
  };

  return (
    <BarPlot<ReachDay, ReachDayTip>
      width={width}
      height={height}
      valueScale={valueScale}
      columnScale={columnScale}
      ticks={ticks}
      gridLeft={DETAIL_CHART_PAD_LEFT}
      gridRight={width - DETAIL_CHART_PAD_RIGHT}
      labelY={height - 10}
      data={days}
      tip={tip}
      ariaLabel={ariaLabel}
      axisLabel={(value, axisY) => (
        <text
          x={DETAIL_CHART_PAD_LEFT - 8}
          y={axisY + 4}
          textAnchor="end"
          className={dashboardStyles.chAxisSerif}
        >
          {axisTickLabel(value, fmt)}
        </text>
      )}
      column={(day, index) => {
        const barTop = valueScale(day.value);
        return {
          key: day.day,
          label: isDayLabelled(index, lastIndex, labelStep)
            ? day.dayLabel
            : undefined,
          labelClassName:
            index === lastIndex
              ? dashboardStyles.chLabelStrong
              : dashboardStyles.chLabel,
          bars: [
            {
              key: day.day,
              y: barTop,
              height: plotBottom - barTop,
              rx: Math.min(2, barWidth / 2),
              fill: "var(--accent)",
              className: `${dashboardStyles.barSeg} ${chartStyles.mark}`,
              style: { animationDelay: `${index * staggerMs}ms` },
              datum: day.tip,
              ariaLabel: day.ariaLabel,
              tabIndex: index === tabbableIndex ? 0 : -1,
              onFocus: () => {
                setFocusedIndex(index);
                setActiveIndex(index);
              },
              onKeyDown: (event) => moveFocus(event, index),
            },
          ],
        };
      }}
      underlay={
        activeIndex !== null && (
          <rect
            className={[
              styles.columnGuide,
              tip.tooltipOpen && styles.columnGuideVisible,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ transform: `translateX(${guideLeft(activeIndex)}px)` }}
            x={0}
            y={PAD_TOP}
            width={columnScale.step()}
            height={plotBottom - PAD_TOP}
            fill={CHART_INK.grid}
            aria-hidden
          />
        )
      }
    >
      <LinePath
        className={styles.previousLine}
        data={days}
        x={(_day, index) => columnCentre(columnScale, index)}
        y={(day) => valueScale(day.previousValue)}
        fill="none"
        stroke="var(--ink-40)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        className={styles.pointerLayer}
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        aria-hidden
        onPointerDown={readPointer}
        onPointerMove={readPointer}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") tip.hideTooltip();
        }}
        onPointerCancel={tip.hideTooltip}
      />
    </BarPlot>
  );
}
