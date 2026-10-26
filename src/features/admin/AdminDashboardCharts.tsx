import { localPoint } from "@visx/event";
import { LinePath, AreaClosed } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import {
  BarPlot,
  ChartFrame,
  ChartLegend,
  ResponsiveChart,
  useChartTooltip,
  markFocusProps,
  linearScale,
  bandScale,
  wholeNumberTicks,
  CHART_INK,
  type LegendItem,
  type BarPlotBar,
} from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  WEEK_LABEL_KEYS,
  type WeekBar,
  type GrowthPoint,
  type DistBucket,
} from "./adminDashboard.data";
import { ChartTooltip } from "./AdminDashboardChartParts";
import {
  growthLegendItems,
  growthPointTip,
  startsNewMonth,
  type GrowthTip,
} from "./adminDashboardChart.helpers";
import { chartMax } from "./api/adminOverview.adapters";
import styles from "./AdminDashboardPage.module.css";
import chartStyles from "../../shared/components/charts/charts.module.css";

interface ReportSeriesItem {
  id: string;
  labelKey: string;
  color: string;
}

type ChartProps = { loading?: boolean };

// ── 1 · Reports by type (stacked bar) ───────────────────────────────────────

interface ReportsByTypeChartProps extends ChartProps {
  weeks: WeekBar[];
  series: readonly ReportSeriesItem[];
}

interface ReportTip {
  weekLabel: string;
  seriesLabel: string;
  value: number;
}

export function ReportsByTypeChart({
  weeks,
  series,
  loading = false,
}: ReportsByTypeChartProps) {
  const { t } = useTranslation();
  const tip = useChartTooltip<ReportTip>();

  const legend = (
    <ChartLegend
      items={series.map((seriesItem): LegendItem => ({
        color: seriesItem.color,
        label: t(seriesItem.labelKey),
      }))}
    />
  );

  const weekLabel = (week: string) =>
    WEEK_LABEL_KEYS[week] ? t(WEEK_LABEL_KEYS[week]) : week;

  return (
    <ChartFrame
      title={t("admin:dashboard.charts.reportsByType.title")}
      subtitle={t("admin:dashboard.charts.reportsByType.sub")}
      legend={legend}
      loading={loading}
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ResponsiveChart aspect={640 / 240}>
          {(width, height) => {
            const padLeft = 34;
            const padBottom = 30;
            const padTop = 12;
            const plotRight = width - 10;
            const plotBottom = height - padBottom;
            const max = chartMax(weeks.flatMap((week) => week.values));
            const valueScale = linearScale(max, padTop, plotBottom);
            const columnScale = bandScale(
              weeks.length,
              padLeft,
              plotRight,
              0.48,
            );

            return (
              <BarPlot<WeekBar, ReportTip>
                width={width}
                height={height}
                valueScale={valueScale}
                columnScale={columnScale}
                ticks={wholeNumberTicks(valueScale, 3)}
                gridLeft={padLeft}
                gridRight={width - 6}
                labelY={height - 10}
                data={weeks}
                tip={tip}
                ariaLabel={t("admin:dashboard.charts.reportsByType.ariaLabel")}
                axisLabel={(value, axisY) => (
                  <text
                    x={padLeft - 8}
                    y={axisY + 4}
                    textAnchor="end"
                    className={styles.chAxisSerif}
                  >
                    {value}
                  </text>
                )}
                column={(week, weekIndex) => {
                  const recent = weekIndex >= weeks.length - 2;
                  let stackTop = plotBottom;
                  const bars: BarPlotBar<ReportTip>[] = [];
                  week.values.forEach((value, seriesIndex) => {
                    if (value === 0) return;
                    const segmentHeight = plotBottom - valueScale(value);
                    stackTop -= segmentHeight;
                    const datum: ReportTip = {
                      weekLabel: weekLabel(week.week),
                      seriesLabel: t(series[seriesIndex]!.labelKey),
                      value,
                    };
                    bars.push({
                      key: seriesIndex,
                      y: stackTop,
                      height: segmentHeight,
                      fill: series[seriesIndex]?.color,
                      className: `${styles.barSeg} ${chartStyles.mark}`,
                      style: {
                        animationDelay: `${weekIndex * 55 + seriesIndex * 20}ms`,
                      },
                      datum,
                      ariaLabel: `${datum.weekLabel} · ${datum.seriesLabel}: ${value}`,
                    });
                  });
                  return {
                    key: week.week,
                    label: weekLabel(week.week),
                    labelClassName: recent
                      ? styles.chLabelStrong
                      : styles.chLabel,
                    bars,
                  };
                }}
              />
            );
          }}
        </ResponsiveChart>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.weekLabel}</div>
              {data.seriesLabel}: {data.value}
            </>
          )}
        </ChartTooltip>
      </div>
    </ChartFrame>
  );
}

// ── 2 · Member growth (line) ────────────────────────────────────────────────

interface MemberGrowthChartProps extends ChartProps {
  points: GrowthPoint[];
  /** Replaces the default "last 10 weeks" subtitle when the caller shows a
   *  different range (the Reports page's adjustable window). */
  subtitle?: string;
}

export function MemberGrowthChart({
  points,
  subtitle,
  loading = false,
}: MemberGrowthChartProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<GrowthTip>();

  const knownChurned = points
    .map((point) => point.churned)
    .filter((value): value is number => value !== null);
  const hasChurnData = knownChurned.length > 0;

  const legend = <ChartLegend items={growthLegendItems(hasChurnData, t)} />;

  return (
    <ChartFrame
      title={t("admin:dashboard.charts.memberGrowth.title")}
      subtitle={subtitle ?? t("admin:dashboard.charts.memberGrowth.sub")}
      loading={loading}
      skeletonHeight={180}
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ResponsiveChart aspect={360 / 220}>
          {(width, height) => {
            const padLeft = 8;
            const padRight = 8;
            const padTop = 14;
            const padBottom = 26;
            const count = points.length;
            const max = chartMax([
              ...points.map((point) => point.total),
              ...knownChurned,
            ]);
            const valueScale = linearScale(max, padTop, height - padBottom);
            // A line/area is continuous, so points sit flush to the plot edges
            // (first at padLeft, last at width - padRight) rather than centred in
            // band slots the way the bar charts' columns are.
            const plotWidth = width - padLeft - padRight;
            const pointX = (index: number) =>
              padLeft + index * (plotWidth / Math.max(count - 1, 1));
            const ticks = valueScale.ticks(4);

            return (
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                role="group"
                aria-label={t("admin:dashboard.charts.memberGrowth.ariaLabel")}
              >
                {ticks.map((value) => (
                  <line
                    key={value}
                    x1={padLeft}
                    y1={valueScale(value)}
                    x2={width - padRight}
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
                {hasChurnData && (
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
                    className={styles.lineDraw}
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
                {points.map((point, index) => {
                  const { datum, ariaLabel } = growthPointTip(point, fmt, t);
                  return (
                    <circle
                      key={index}
                      className={chartStyles.mark}
                      cx={pointX(index)}
                      cy={valueScale(point.total)}
                      r={10}
                      fill="transparent"
                      onMouseMove={(event) => {
                        const local = localPoint(event);
                        tip.showTooltip({
                          tooltipLeft: local?.x,
                          tooltipTop: local?.y,
                          tooltipData: datum,
                        });
                      }}
                      onMouseLeave={tip.hideTooltip}
                      {...markFocusProps(tip, {
                        label: ariaLabel,
                        x: pointX(index),
                        y: valueScale(point.total),
                        datum,
                      })}
                    />
                  );
                })}
                {points.map((point, index) =>
                  startsNewMonth(points, index) ? (
                    <text
                      key={index}
                      x={pointX(index)}
                      y={height - 8}
                      textAnchor="middle"
                      className={styles.chLabel}
                    >
                      {fmt.date(point.date, { month: "short" })}
                    </text>
                  ) : null,
                )}
              </svg>
            );
          }}
        </ResponsiveChart>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
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
      </div>
      {legend}
    </ChartFrame>
  );
}

// ── 3 · Response time (distribution) ────────────────────────────────────────

interface ResponseTimeChartProps extends ChartProps {
  buckets: DistBucket[] | null;
}

interface ResponseTip {
  label: string;
  value: number;
  overSla: boolean;
}

export function ResponseTimeChart({
  buckets,
  loading = false,
}: ResponseTimeChartProps) {
  const { t } = useTranslation();
  const tip = useChartTooltip<ResponseTip>();

  const legend =
    buckets === null ? null : (
      <ChartLegend
        items={[
          {
            color: "var(--jade)",
            label: t("admin:dashboard.charts.legend.withinSla"),
          },
          {
            color: "var(--amber)",
            label: t("admin:dashboard.charts.legend.overSla", { hours: "6h" }),
          },
        ]}
      />
    );

  return (
    <ChartFrame
      title={t("admin:dashboard.charts.responseTime.title")}
      subtitle={t("admin:dashboard.charts.responseTime.sub")}
      loading={loading}
      skeletonHeight={180}
      empty={buckets === null ? t("admin:dashboard.notMeasuredYet") : false}
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ResponsiveChart aspect={360 / 220}>
          {(width, height) => {
            if (buckets === null) return null;
            // A left gutter for the value labels (as in ReportsByTypeChart), so
            // no bar can paint over a tick label at any value.
            const padLeft = 34;
            const padRight = 8;
            const padTop = 14;
            const padBottom = 30;
            const plotBottom = height - padBottom;
            const max = chartMax(buckets.map((bucket) => bucket.value));
            const valueScale = linearScale(max, padTop, plotBottom);
            const columnScale = bandScale(
              buckets.length,
              padLeft,
              width - padRight,
              0.4,
            );
            const slaIndex = buckets.findIndex((bucket) => bucket.overSla);

            return (
              <BarPlot<DistBucket, ResponseTip>
                width={width}
                height={height}
                valueScale={valueScale}
                columnScale={columnScale}
                ticks={wholeNumberTicks(valueScale, 2)}
                gridLeft={padLeft}
                gridRight={width - padRight}
                labelY={height - 12}
                data={buckets}
                tip={tip}
                ariaLabel={t("admin:dashboard.charts.responseTime.ariaLabel")}
                axisLabel={(value, axisY) => (
                  <text
                    x={padLeft - 8}
                    y={axisY + 4}
                    textAnchor="end"
                    className={styles.chAxisSerif}
                  >
                    {value}
                  </text>
                )}
                column={(bucket, index) => {
                  const y = valueScale(bucket.value);
                  const datum: ResponseTip = {
                    label: bucket.label,
                    value: bucket.value,
                    overSla: bucket.overSla,
                  };
                  const slaLabel = bucket.overSla
                    ? t("admin:dashboard.charts.legend.overSla", {
                        hours: "6h",
                      })
                    : t("admin:dashboard.charts.legend.withinSla");
                  return {
                    key: bucket.label,
                    label: bucket.label,
                    labelClassName: styles.chLabel,
                    bars: [
                      {
                        key: bucket.label,
                        y,
                        height: plotBottom - y,
                        rx: 6,
                        fill: bucket.overSla ? "var(--amber)" : "var(--jade)",
                        opacity: bucket.overSla ? 0.92 : 1,
                        className: `${styles.barSeg} ${chartStyles.mark}`,
                        style: { animationDelay: `${index * 55}ms` },
                        datum,
                        ariaLabel: `${bucket.label}: ${bucket.value} · ${slaLabel}`,
                      },
                    ],
                  };
                }}
              >
                {slaIndex >= 0 && (
                  <>
                    <line
                      x1={columnScale(slaIndex) ?? 0}
                      y1={padTop - 2}
                      x2={columnScale(slaIndex) ?? 0}
                      y2={plotBottom}
                      stroke="var(--danger)"
                      strokeWidth={1.4}
                      strokeDasharray="4 4"
                      opacity={0.6}
                    />
                    <text
                      x={(columnScale(slaIndex) ?? 0) + 5}
                      y={padTop + 8}
                      className={styles.chSla}
                    >
                      {t("admin:dashboard.charts.responseTime.slaLabel", {
                        hours: "6h",
                      })}
                    </text>
                  </>
                )}
              </BarPlot>
            );
          }}
        </ResponsiveChart>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.label}</div>
              {data.value}{" "}
              {data.overSla
                ? t("admin:dashboard.charts.legend.overSla", { hours: "6h" })
                : t("admin:dashboard.charts.legend.withinSla")}
            </>
          )}
        </ChartTooltip>
      </div>
      {legend}
    </ChartFrame>
  );
}
