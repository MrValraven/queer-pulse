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
  bandScale,
  CHART_INK,
  type LegendItem,
} from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import {
  WEEK_LABEL_KEYS,
  type WeekBar,
  type GrowthPoint,
  type DistBucket,
} from "./adminDashboard.data";
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
      items={series.map(
        (seriesItem): LegendItem => ({
          color: seriesItem.color,
          label: t(seriesItem.labelKey),
        }),
      )}
    />
  );

  const weekLabel = (week: string) =>
    WEEK_LABEL_KEYS[week] ? t(WEEK_LABEL_KEYS[week]!) : week;

  return (
    <ChartFrame
      title={t("admin:dashboard.charts.reportsByType.title")}
      subtitle={t("admin:dashboard.charts.reportsByType.sub")}
      legend={legend}
      loading={loading}
    >
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
            const barWidth = columnScale.bandwidth();
            const ticks = valueScale.ticks(3);

            return (
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                role="group"
                aria-label={t(
                  "admin:dashboard.charts.reportsByType.ariaLabel",
                )}
              >
                {ticks.map((value) => {
                  const y = valueScale(value);
                  return (
                    <g key={value}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={width - 6}
                        y2={y}
                        stroke={CHART_INK.grid}
                        strokeWidth={1}
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className={styles.chAxisSerif}
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}
                {weeks.map((week, weekIndex) => {
                  const x = columnScale(weekIndex) ?? 0;
                  const recent = weekIndex >= weeks.length - 2;
                  let stackTop = plotBottom;
                  return (
                    <g key={week.week}>
                      {week.values.map((value, seriesIndex) => {
                        if (value === 0) return null;
                        const segmentHeight =
                          plotBottom - valueScale(value);
                        stackTop -= segmentHeight;
                        const y = stackTop;
                        const datum: ReportTip = {
                          weekLabel: weekLabel(week.week),
                          seriesLabel: t(series[seriesIndex]!.labelKey),
                          value,
                        };
                        return (
                          <rect
                            key={seriesIndex}
                            className={`${styles.barSeg} ${chartStyles.mark}`}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={segmentHeight}
                            fill={series[seriesIndex]?.color}
                            style={{
                              animationDelay: `${weekIndex * 55 + seriesIndex * 20}ms`,
                            }}
                            onMouseMove={(event) => {
                              const point = localPoint(event);
                              tip.showTooltip({
                                tooltipLeft: point?.x,
                                tooltipTop: point?.y,
                                tooltipData: datum,
                              });
                            }}
                            onMouseLeave={tip.hideTooltip}
                            {...markFocusProps(tip, {
                              label: `${datum.weekLabel} · ${datum.seriesLabel}: ${value}`,
                              x: x + barWidth / 2,
                              y: y + segmentHeight / 2,
                              datum,
                            })}
                          />
                        );
                      })}
                      <text
                        x={x + barWidth / 2}
                        y={height - 10}
                        textAnchor="middle"
                        className={recent ? styles.chLabelStrong : styles.chLabel}
                      >
                        {weekLabel(week.week)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          }}
        </ResponsiveChart>
        {tip.tooltipOpen && tip.tooltipData && (
          <tip.TooltipInPortal
            top={tip.tooltipTop}
            left={tip.tooltipLeft}
            className={chartStyles.tip}
            unstyled
          >
            <div className={chartStyles.tipStrong}>{tip.tooltipData.weekLabel}</div>
            {tip.tooltipData.seriesLabel}: {tip.tooltipData.value}
          </tip.TooltipInPortal>
        )}
      </div>
    </ChartFrame>
  );
}

// ── 2 · Member growth (line) ────────────────────────────────────────────────

interface MemberGrowthChartProps extends ChartProps {
  points: GrowthPoint[];
}

interface GrowthTip {
  label: string;
  joined: number;
  churned: number | null;
}

/** Builds the member-growth legend items — joined (always) plus churned,
 *  which falls back to a muted "not measured yet" entry when no churn
 *  data is available yet. Extracted to keep MemberGrowthChart under the
 *  200-line component limit. */
function growthLegendItems(
  hasChurnData: boolean,
  t: TFunction,
): LegendItem[] {
  return [
    {
      color: "var(--jade)",
      label: t("admin:dashboard.charts.legend.joined"),
      dot: true,
    },
    hasChurnData
      ? {
          color: "var(--accent-ink)",
          label: t("admin:dashboard.charts.legend.churned"),
          dot: true,
        }
      : {
          color: "",
          muted: true,
          label: `${t("admin:dashboard.charts.legend.churned")} · ${t("admin:dashboard.notMeasuredYet")}`,
        },
  ];
}

/** Builds a growth point's tooltip datum plus the aria-label announced when a
 *  keyboard user focuses that point. Extracted to keep MemberGrowthChart under
 *  the 200-line component limit. */
function growthPointTip(
  point: GrowthPoint,
  fmt: ReturnType<typeof useFormat>,
  t: TFunction,
): { datum: GrowthTip; ariaLabel: string } {
  const datum: GrowthTip = {
    label: point.date
      ? fmt.date(point.date, { month: "short" })
      : t("admin:dashboard.charts.memberGrowth.title"),
    joined: point.joined,
    churned: point.churned,
  };
  const ariaLabel =
    `${datum.label}: ${t("admin:dashboard.charts.legend.joined")} ${point.joined}` +
    (point.churned !== null
      ? `, ${t("admin:dashboard.charts.legend.churned")} ${point.churned}`
      : "");
  return { datum, ariaLabel };
}

export function MemberGrowthChart({
  points,
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
      subtitle={t("admin:dashboard.charts.memberGrowth.sub")}
      loading={loading}
      skeletonHeight={180}
    >
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ResponsiveChart aspect={360 / 220}>
          {(width, height) => {
            const padLeft = 8;
            const padRight = 8;
            const padTop = 14;
            const padBottom = 26;
            const count = points.length;
            const max = chartMax([
              ...points.map((point) => point.joined),
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
            const spikeIndex = points.findIndex((point) => point.spike);

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
                    y={(point) => valueScale(point.joined)}
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
                    y={(point) => valueScale(point.joined)}
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
                      cy={valueScale(point.joined)}
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
                        y: valueScale(point.joined),
                        datum,
                      })}
                    />
                  );
                })}
                {spikeIndex >= 0 && (
                  <>
                    <circle
                      cx={pointX(spikeIndex)}
                      cy={valueScale(points[spikeIndex]!.joined)}
                      r={5}
                      fill="var(--accent)"
                      stroke="var(--paper)"
                      strokeWidth={2}
                    />
                    <text
                      x={pointX(spikeIndex)}
                      y={valueScale(points[spikeIndex]!.joined) - 12}
                      textAnchor="middle"
                      className={styles.chSpike}
                    >
                      {t("admin:dashboard.charts.memberGrowth.spike")}
                    </text>
                  </>
                )}
                {points.map((point, index) =>
                  point.date ? (
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
        {tip.tooltipOpen && tip.tooltipData && (
          <tip.TooltipInPortal
            top={tip.tooltipTop}
            left={tip.tooltipLeft}
            className={chartStyles.tip}
            unstyled
          >
            <div className={chartStyles.tipStrong}>{tip.tooltipData.label}</div>
            {t("admin:dashboard.charts.legend.joined")}: {tip.tooltipData.joined}
            {tip.tooltipData.churned !== null && (
              <>
                <br />
                {t("admin:dashboard.charts.legend.churned")}:{" "}
                {tip.tooltipData.churned}
              </>
            )}
          </tip.TooltipInPortal>
        )}
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
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ResponsiveChart aspect={360 / 220}>
          {(width, height) => {
            if (buckets === null) return null;
            const padLeft = 8;
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
            const barWidth = columnScale.bandwidth();
            const ticks = valueScale.ticks(2);
            const slaIndex = buckets.findIndex((bucket) => bucket.overSla);

            return (
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                role="group"
                aria-label={t("admin:dashboard.charts.responseTime.ariaLabel")}
              >
                {ticks.map((value) => (
                  <g key={value}>
                    <line
                      x1={padLeft}
                      y1={valueScale(value)}
                      x2={width - padRight}
                      y2={valueScale(value)}
                      stroke={CHART_INK.grid}
                      strokeWidth={1}
                    />
                    <text
                      x={padLeft}
                      y={valueScale(value) - 4}
                      className={styles.chAxisSerif}
                    >
                      {value}
                    </text>
                  </g>
                ))}
                {buckets.map((bucket, index) => {
                  const x = columnScale(index) ?? 0;
                  const y = valueScale(bucket.value);
                  const datum: ResponseTip = {
                    label: bucket.label,
                    value: bucket.value,
                    overSla: bucket.overSla,
                  };
                  const slaLabel = bucket.overSla
                    ? t("admin:dashboard.charts.legend.overSla", { hours: "6h" })
                    : t("admin:dashboard.charts.legend.withinSla");
                  return (
                    <g key={bucket.label}>
                      <rect
                        className={`${styles.barSeg} ${chartStyles.mark}`}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={plotBottom - y}
                        rx={6}
                        fill={bucket.overSla ? "var(--amber)" : "var(--jade)"}
                        opacity={bucket.overSla ? 0.92 : 1}
                        style={{ animationDelay: `${index * 55}ms` }}
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
                          label: `${bucket.label}: ${bucket.value} · ${slaLabel}`,
                          x: x + barWidth / 2,
                          y: y + (plotBottom - y) / 2,
                          datum,
                        })}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={height - 12}
                        textAnchor="middle"
                        className={styles.chLabel}
                      >
                        {bucket.label}
                      </text>
                    </g>
                  );
                })}
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
              </svg>
            );
          }}
        </ResponsiveChart>
        {tip.tooltipOpen && tip.tooltipData && (
          <tip.TooltipInPortal
            top={tip.tooltipTop}
            left={tip.tooltipLeft}
            className={chartStyles.tip}
            unstyled
          >
            <div className={chartStyles.tipStrong}>{tip.tooltipData.label}</div>
            {tip.tooltipData.value}{" "}
            {tip.tooltipData.overSla
              ? t("admin:dashboard.charts.legend.overSla", { hours: "6h" })
              : t("admin:dashboard.charts.legend.withinSla")}
          </tip.TooltipInPortal>
        )}
      </div>
      {legend}
    </ChartFrame>
  );
}
