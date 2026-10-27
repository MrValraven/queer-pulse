import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { localPoint } from "@visx/event";
import { LinePath, AreaClosed } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import {
  ChartFrame,
  ChartLegend,
  ResponsiveChart,
  useChartTooltip,
  markFocusProps,
  linearScale,
  CHART_INK,
} from "../../shared/components/charts";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { GrowthPoint } from "./adminDashboard.data";
import { ChartTooltip } from "./AdminDashboardChartParts";
import {
  growthLegendItems,
  growthPointTip,
  type GrowthTip,
} from "./adminDashboardChart.helpers";
import { nearestPointIndex } from "./adminMemberGrowth.helpers";
import {
  MemberGrowthCrosshair,
  MemberGrowthMonthLabels,
} from "./AdminMemberGrowthParts";
import { chartMax } from "./api/adminOverview.adapters";
import dashboardStyles from "./AdminDashboardPage.module.css";
import styles from "./AdminMemberGrowthChart.module.css";
import chartStyles from "../../shared/components/charts/charts.module.css";

interface MemberGrowthChartProps {
  points: GrowthPoint[];
  loading?: boolean;
  /** Replaces the default "last 10 weeks" subtitle when the caller shows a
   *  different range (the Reports page's adjustable window, the dashboard
   *  card's own range toggle). */
  subtitle?: string;
  /** Drawn in the frame head beside the title, e.g. a range toggle. */
  headAction?: ReactNode;
  /** The previous range's line, dimmed while the next one loads. */
  isStale?: boolean;
  /** Replaces the plot with a message (a failed read). */
  empty?: ReactNode | false;
}

/**
 * Total members per week as a jade line over a soft area, with churn as a
 * dotted line once it is measured. Hovering (or dragging a finger) anywhere
 * over the plot reads the nearest week: a guide drops under it, a dot sits on
 * the line and the tooltip opens there. Keyboard users tab through the weeks
 * and get the same reading on focus.
 */
export function MemberGrowthChart({
  points,
  subtitle,
  headAction,
  isStale = false,
  empty = false,
  loading = false,
}: MemberGrowthChartProps) {
  const { t } = useTranslation();
  const tip = useChartTooltip<GrowthTip>();
  // The week the guide and dot sit on. It outlives the tooltip, so the marks
  // fade out where they were when the reading closes.
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);
  const hasChurnData = points.some((point) => point.churned !== null);

  return (
    <ChartFrame
      title={t("admin:dashboard.charts.memberGrowth.title")}
      subtitle={subtitle ?? t("admin:dashboard.charts.memberGrowth.sub")}
      legend={headAction}
      loading={loading}
      empty={empty}
      skeletonHeight={180}
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) so the plot area can open and close the reading; it never reads ref.current during render. */}
        <MemberGrowthPlotArea tip={tip} isStale={isStale}>
          <ResponsiveChart aspect={360 / 220}>
            {(width, height) => (
              <MemberGrowthPlot
                // A new range remounts the plot, so the line draws in again.
                key={points.length}
                points={points}
                width={width}
                height={height}
                tip={tip}
                crosshairIndex={crosshairIndex}
                onCrosshairChange={setCrosshairIndex}
              />
            )}
          </ResponsiveChart>
        </MemberGrowthPlotArea>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <MemberGrowthTooltip tip={tip} />
      </div>
      <ChartLegend items={growthLegendItems(hasChurnData, t)} />
    </ChartFrame>
  );
}

/** The plot's own box: dims the previous range while the next one loads,
 *  and closes a reading on a press outside it. A touch reading stays up after
 *  the finger lifts, so this is how it goes away. */
function MemberGrowthPlotArea({
  tip,
  isStale,
  children,
}: {
  tip: ReturnType<typeof useChartTooltip<GrowthTip>>;
  isStale: boolean;
  children: ReactNode;
}) {
  const plotAreaRef = useRef<HTMLDivElement>(null);
  useOutsideDismiss(tip.tooltipOpen, plotAreaRef, tip.hideTooltip);
  return (
    <div
      ref={plotAreaRef}
      className={[styles.plotBody, isStale && styles.stale]
        .filter(Boolean)
        .join(" ")}
      aria-busy={isStale || undefined}
    >
      {children}
    </div>
  );
}

function MemberGrowthTooltip({
  tip,
}: {
  tip: ReturnType<typeof useChartTooltip<GrowthTip>>;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <ChartTooltip tip={tip}>
      {(data) => (
        <>
          <div className={chartStyles.tipStrong}>{data.label}</div>
          {`${t("admin:dashboard.charts.memberGrowth.totalMembers")}: ${fmt.number(data.total)}`}
          <br />
          {`${t("admin:dashboard.charts.memberGrowth.joinedThatWeek")}: +${fmt.number(data.joined)}`}
          {data.churned !== null && (
            <>
              <br />
              {t("admin:dashboard.charts.legend.churned")}: {data.churned}
            </>
          )}
        </>
      )}
    </ChartTooltip>
  );
}

const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;

function MemberGrowthPlot({
  points,
  width,
  height,
  tip,
  crosshairIndex,
  onCrosshairChange,
}: {
  points: GrowthPoint[];
  width: number;
  height: number;
  tip: ReturnType<typeof useChartTooltip<GrowthTip>>;
  crosshairIndex: number | null;
  onCrosshairChange: (index: number) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const count = points.length;
  const plotBottom = height - PAD_BOTTOM;
  const plotRight = width - PAD_RIGHT;
  const knownChurned = points
    .map((point) => point.churned)
    .filter((value): value is number => value !== null);
  const max = chartMax([
    ...points.map((point) => point.total),
    ...knownChurned,
  ]);
  const valueScale = linearScale(max, PAD_TOP, plotBottom);
  // A line/area is continuous, so points sit flush to the plot edges (first
  // at PAD_LEFT, last at plotRight) where the bar charts centre their columns
  // in band slots.
  const plotWidth = plotRight - PAD_LEFT;
  const pointX = (index: number) =>
    PAD_LEFT + index * (plotWidth / Math.max(count - 1, 1));
  const crosshairPoint =
    crosshairIndex !== null ? points[crosshairIndex] : undefined;

  const readPointerPosition = (event: PointerEvent<SVGRectElement>) => {
    const local = localPoint(event);
    if (!local || count === 0) return;
    const index = nearestPointIndex(local.x, PAD_LEFT, plotWidth, count);
    const point = points[index]!;
    onCrosshairChange(index);
    tip.showTooltip({
      tooltipLeft: pointX(index),
      tooltipTop: valueScale(point.total),
      tooltipData: growthPointTip(point, fmt, t).datum,
    });
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="group"
      aria-label={t("admin:dashboard.charts.memberGrowth.ariaLabel")}
    >
      {valueScale.ticks(4).map((value) => (
        <line
          key={value}
          x1={PAD_LEFT}
          y1={valueScale(value)}
          x2={plotRight}
          y2={valueScale(value)}
          stroke={CHART_INK.grid}
          strokeWidth={1}
        />
      ))}
      {count > 0 && (
        <AreaClosed
          data={points}
          x={(_, index) => pointX(index)}
          y={(point) => valueScale(point.total)}
          yScale={valueScale}
          curve={curveMonotoneX}
          fill={CHART_INK.area}
        />
      )}
      {knownChurned.length > 0 && (
        <LinePath
          data={points.filter((point) => point.churned !== null)}
          x={(point) => pointX(points.indexOf(point))}
          y={(point) => valueScale(point.churned as number)}
          curve={curveMonotoneX}
          stroke="var(--accent-ink)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1 5"
        />
      )}
      {count > 0 && (
        <LinePath
          className={dashboardStyles.lineDraw}
          data={points}
          x={(_, index) => pointX(index)}
          y={(point) => valueScale(point.total)}
          curve={curveMonotoneX}
          pathLength={1}
          fill="none"
          stroke="var(--jade)"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {crosshairPoint && crosshairIndex !== null && (
        <MemberGrowthCrosshair
          x={pointX(crosshairIndex)}
          y={valueScale(crosshairPoint.total)}
          plotTop={PAD_TOP}
          plotBottom={plotBottom}
          isVisible={tip.tooltipOpen}
        />
      )}
      {/* Keyboard stops, one per week. They take no pointer events: the
          overlay below reads the pointer for the whole plot. */}
      {points.map((point, index) => {
        const { datum, ariaLabel } = growthPointTip(point, fmt, t);
        const focusProps = markFocusProps(tip, {
          label: ariaLabel,
          x: pointX(index),
          y: valueScale(point.total),
          datum,
        });
        return (
          <circle
            key={index}
            className={`${chartStyles.mark} ${styles.focusMark}`}
            cx={pointX(index)}
            cy={valueScale(point.total)}
            r={10}
            fill="transparent"
            pointerEvents="none"
            {...focusProps}
            onFocus={(event) => {
              focusProps.onFocus(event);
              onCrosshairChange(index);
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
        onPointerDown={readPointerPosition}
        onPointerMove={readPointerPosition}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") tip.hideTooltip();
        }}
        onPointerCancel={tip.hideTooltip}
      />
      <MemberGrowthMonthLabels
        points={points}
        pointX={pointX}
        plotLeft={PAD_LEFT}
        plotRight={plotRight}
        labelY={height - 8}
      />
    </svg>
  );
}
