import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { localPoint } from "@visx/event";
import { AreaClosed, LinePath } from "@visx/shape";
import {
  CHART_INK,
  linearScale,
  markFocusProps,
  type useChartTooltip,
} from "../../shared/components/charts";
import {
  niceAxis,
  nextBarIndex,
  CREATED_CHART_HEIGHT,
  columnCentre,
  detailColumnScale,
  nearestColumnIndex,
} from "./adminChartAxis.helpers";
import { MemberGrowthCrosshair } from "./AdminMemberGrowthParts";
import {
  DetailDayLabels,
  DetailValueGrid,
} from "./FeatureUsageDetailChartParts";
import {
  labelStepForWidth,
  type CreatedDay,
} from "./featureUsageDetail.helpers";
import dashboardStyles from "./AdminDashboardPage.module.css";
import chartStyles from "../../shared/components/charts/charts.module.css";
import styles from "./FeatureUsageDetailPanel.module.css";

const PAD_TOP = 12;
const PAD_BOTTOM = 30;

type CreatedTooltip = ReturnType<typeof useChartTooltip<CreatedDay>>;

/**
 * The created chart's SVG: a jade line over a soft area, one point per day
 * on the same column centres the reach bars use. The pointer layer reads
 * the nearest day anywhere over the plot; a guide and dot mark it. The days
 * share one tab stop (a roving tabindex) that the arrow keys, Home and End
 * move, and the focused day opens the same reading.
 */
export function FeatureUsageCreatedPlot({
  days,
  width,
  tip,
  ariaLabel,
}: {
  days: CreatedDay[];
  width: number;
  tip: CreatedTooltip;
  ariaLabel: string;
}) {
  const height = CREATED_CHART_HEIGHT;
  const lastIndex = days.length - 1;
  const [focusedIndex, setFocusedIndex] = useState(lastIndex);
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);
  const tabbableIndex = Math.min(focusedIndex, lastIndex);
  const plotBottom = height - PAD_BOTTOM;
  const { max, ticks } = niceAxis(Math.max(0, ...days.map((day) => day.value)));
  const valueScale = linearScale(max, PAD_TOP, plotBottom);
  const columnScale = detailColumnScale(days.length, width);
  const pointX = (index: number) => columnCentre(columnScale, index);
  const crosshairDay =
    crosshairIndex !== null ? days[crosshairIndex] : undefined;

  const readPointer = (event: PointerEvent<SVGRectElement>) => {
    const point = localPoint(event);
    if (!point || days.length === 0) return;
    const index = nearestColumnIndex(columnScale, point.x, days.length);
    const day = days[index]!;
    setCrosshairIndex(index);
    tip.showTooltip({
      tooltipLeft: pointX(index),
      tooltipTop: valueScale(day.value),
      tooltipData: day,
    });
  };

  const moveFocus = (event: KeyboardEvent<SVGCircleElement>, index: number) => {
    const nextIndex = nextBarIndex(event.key, index, lastIndex);
    if (nextIndex === null) return;
    event.preventDefault();
    const points =
      event.currentTarget.ownerSVGElement?.querySelectorAll<SVGCircleElement>(
        'circle[role="img"]',
      );
    points?.[nextIndex]?.focus();
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="group"
      aria-label={ariaLabel}
    >
      <DetailValueGrid ticks={ticks} valueScale={valueScale} width={width} />
      {days.length > 1 && (
        <>
          <AreaClosed
            data={days}
            x={(_day, index) => pointX(index)}
            y={(day) => valueScale(day.value)}
            yScale={valueScale}
            fill={CHART_INK.area}
          />
          <LinePath
            className={dashboardStyles.lineDraw}
            data={days}
            x={(_day, index) => pointX(index)}
            y={(day) => valueScale(day.value)}
            pathLength={1}
            fill="none"
            stroke="var(--jade)"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {days.length === 1 && (
        <circle
          cx={pointX(0)}
          cy={valueScale(days[0]!.value)}
          r={3.5}
          fill="var(--jade)"
        />
      )}
      {crosshairDay && crosshairIndex !== null && (
        <MemberGrowthCrosshair
          x={pointX(crosshairIndex)}
          y={valueScale(crosshairDay.value)}
          plotTop={PAD_TOP}
          plotBottom={plotBottom}
          isVisible={tip.tooltipOpen}
        />
      )}
      {days.map((day, index) => {
        const focusProps = markFocusProps(tip, {
          label: day.ariaLabel,
          x: pointX(index),
          y: valueScale(day.value),
          datum: day,
        });
        return (
          <circle
            key={day.day}
            className={`${chartStyles.mark} ${styles.focusMark}`}
            cx={pointX(index)}
            cy={valueScale(day.value)}
            r={8}
            fill="transparent"
            pointerEvents="none"
            {...focusProps}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onFocus={(event) => {
              focusProps.onFocus(event);
              setFocusedIndex(index);
              setCrosshairIndex(index);
            }}
            onKeyDown={(event) => {
              focusProps.onKeyDown(event);
              moveFocus(event, index);
            }}
          />
        );
      })}
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
      <DetailDayLabels
        dayLabels={days.map((day) => day.dayLabel)}
        columnScale={columnScale}
        labelStep={labelStepForWidth(days.length, columnScale.step())}
        labelY={height - 10}
      />
    </svg>
  );
}
