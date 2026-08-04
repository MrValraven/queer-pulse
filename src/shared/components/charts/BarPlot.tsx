import type { CSSProperties, ReactNode } from "react";
import { localPoint } from "@visx/event";
import { CHART_INK } from "./chartColors";
import { linearScale, bandScale } from "./chartScales";
import { markFocusProps } from "./ChartTooltip";

/** The two tooltip controls a bar needs — a structural subset of what
 *  {@link useChartTooltip} returns, so the whole hook result is assignable. */
interface BarPlotTooltip<Datum> {
  showTooltip: (args: {
    tooltipLeft?: number;
    tooltipTop?: number;
    tooltipData?: Datum;
  }) => void;
  hideTooltip: () => void;
}

/** One `<rect>` inside a column. A single-bar chart gives a column one bar; a
 *  stacked-bar chart gives it several, each with its own `y`/`height`/`fill`. */
export interface BarPlotBar<Datum> {
  /** React key, unique within the column (e.g. the series index). */
  key: string | number;
  /** Top edge of the rect in SVG user units (`valueScale(value)`, or the running
   *  stack top for a stacked segment). */
  y: number;
  /** Rect height in SVG user units (`plotBottom - valueScale(value)`). */
  height: number;
  /** Series/bar fill — a token string like `"var(--jade)"` or a datum color. */
  fill?: string;
  opacity?: number;
  rx?: number;
  /** Bar class — the consumer's `styles.barSeg` plus the kit's `chartStyles.mark`
   *  for the focus ring and enter animation. */
  className?: string;
  /** Inline style, typically the stagger `{ animationDelay }`. */
  style?: CSSProperties;
  /** Tooltip payload shown on hover/focus. */
  datum: Datum;
  /** Accessible + focus-tooltip label for this bar. */
  ariaLabel: string;
}

/** One column of the plot: its bars plus the label drawn beneath it. */
export interface BarPlotColumn<Datum> {
  /** React key for the column group (e.g. `week.week` or `bucket.label`). */
  key: string | number;
  /** The bars stacked in this column (one for a simple bar chart). */
  bars: readonly BarPlotBar<Datum>[];
  /** Text drawn under the column; omit for none. */
  label?: ReactNode;
  /** Class for the column label (e.g. `styles.chLabel` or `styles.chLabelStrong`). */
  labelClassName?: string;
}

export interface BarPlotProps<Item, Datum> {
  /** Measured plot size from the {@link ResponsiveChart} render callback. */
  width: number;
  height: number;
  /** Vertical value axis from {@link linearScale}. */
  valueScale: ReturnType<typeof linearScale>;
  /** Horizontal band axis from {@link bandScale}; supplies each column's `x` and
   *  the shared `bandwidth()` bar width. */
  columnScale: ReturnType<typeof bandScale>;
  /** Value-axis grid tick values, e.g. `valueScale.ticks(3)`. */
  ticks: readonly number[];
  /** Left edge of the grid lines (the chart's `padLeft`). */
  gridLeft: number;
  /** Right edge of the grid lines. */
  gridRight: number;
  /** `y` for the column labels, e.g. `height - 10`. */
  labelY: number;
  /** The rows, one column each. */
  data: readonly Item[];
  /** Shared tooltip bundle from {@link useChartTooltip}. */
  tip: BarPlotTooltip<Datum>;
  /** `aria-label` on the `<svg>` group. */
  ariaLabel: string;
  /** Render callback: maps a datum to its bars + label. Receives the computed
   *  column `x` and the shared `barWidth` so stacked layouts can position
   *  segments without recomputing the scale. */
  column: (
    item: Item,
    index: number,
    geometry: { x: number; barWidth: number },
  ) => BarPlotColumn<Datum>;
  /** Label callback for one value-axis tick — placement differs per chart, so the
   *  caller returns the `<text>` (the grid `<line>` is drawn here). */
  axisLabel: (value: number, y: number) => ReactNode;
  /** Optional overlay drawn above the bars, e.g. an SLA threshold marker. */
  children?: ReactNode;
}

/**
 * The shared bar-plot body: value-axis grid + tick labels, band-scaled columns
 * of `<rect>` bars with hover/focus tooltip wiring, and a label under each
 * column — the ~60 lines every hand-rolled dashboard bar chart repeated. It
 * renders the `<svg>` against a measured `width`/`height`, so mount it inside a
 * {@link ResponsiveChart} render callback after computing the scales (the
 * caller keeps ownership of `chartMax`, tick counts, fills, and stacking). Extra
 * chart-specific overlays render as `children`.
 *
 * Both existing charts express through it:
 *
 * `ResponseTimeChart` (one bar per column):
 * ```tsx
 * <ResponsiveChart aspect={360 / 220}>
 *   {(width, height) => {
 *     if (buckets === null) return null;
 *     const padLeft = 8, padRight = 8, padTop = 14, padBottom = 30;
 *     const plotBottom = height - padBottom;
 *     const max = chartMax(buckets.map((bucket) => bucket.value));
 *     const valueScale = linearScale(max, padTop, plotBottom);
 *     const columnScale = bandScale(buckets.length, padLeft, width - padRight, 0.4);
 *     const slaIndex = buckets.findIndex((bucket) => bucket.overSla);
 *     return (
 *       <BarPlot<DistBucket, ResponseTip>
 *         width={width} height={height}
 *         valueScale={valueScale} columnScale={columnScale}
 *         ticks={valueScale.ticks(2)}
 *         gridLeft={padLeft} gridRight={width - padRight} labelY={height - 12}
 *         data={buckets} tip={tip}
 *         ariaLabel={t("admin:dashboard.charts.responseTime.ariaLabel")}
 *         axisLabel={(value, y) => (
 *           <text x={padLeft} y={y - 4} className={styles.chAxisSerif}>{value}</text>
 *         )}
 *         column={(bucket, _index, { x, barWidth }) => {
 *           const y = valueScale(bucket.value);
 *           const slaLabel = bucket.overSla
 *             ? t("admin:dashboard.charts.legend.overSla", { hours: "6h" })
 *             : t("admin:dashboard.charts.legend.withinSla");
 *           return {
 *             key: bucket.label,
 *             label: bucket.label,
 *             labelClassName: styles.chLabel,
 *             bars: [{
 *               key: bucket.label, y, height: plotBottom - y, rx: 6,
 *               fill: bucket.overSla ? "var(--amber)" : "var(--jade)",
 *               opacity: bucket.overSla ? 0.92 : 1,
 *               className: `${styles.barSeg} ${chartStyles.mark}`,
 *               style: { animationDelay: `${_index * 55}ms` },
 *               datum: { label: bucket.label, value: bucket.value, overSla: bucket.overSla },
 *               ariaLabel: `${bucket.label}: ${bucket.value} · ${slaLabel}`,
 *             }],
 *           };
 *         }}
 *       >
 *         {slaIndex >= 0 && slaMarkerNode}
 *       </BarPlot>
 *     );
 *   }}
 * </ResponsiveChart>
 * ```
 *
 * `ReportsByTypeChart` (stacked bars) uses the same shape, with the `column`
 * callback accumulating a running `stackTop` and returning one bar per non-zero
 * series value, and `axisLabel={(value, y) => (
 *   <text x={padLeft - 8} y={y + 4} textAnchor="end" className={styles.chAxisSerif}>{value}</text>
 * )}`.
 */
export function BarPlot<Item, Datum>({
  width,
  height,
  valueScale,
  columnScale,
  ticks,
  gridLeft,
  gridRight,
  labelY,
  data,
  tip,
  ariaLabel,
  column,
  axisLabel,
  children,
}: BarPlotProps<Item, Datum>) {
  const barWidth = columnScale.bandwidth();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="group"
      aria-label={ariaLabel}
    >
      {ticks.map((value) => {
        const y = valueScale(value);
        return (
          <g key={value}>
            <line
              x1={gridLeft}
              y1={y}
              x2={gridRight}
              y2={y}
              stroke={CHART_INK.grid}
              strokeWidth={1}
            />
            {axisLabel(value, y)}
          </g>
        );
      })}
      {data.map((item, index) => {
        const x = columnScale(index) ?? 0;
        const columnSpec = column(item, index, { x, barWidth });
        return (
          <g key={columnSpec.key}>
            {columnSpec.bars.map((bar) => (
              <rect
                key={bar.key}
                className={bar.className}
                x={x}
                y={bar.y}
                width={barWidth}
                height={bar.height}
                rx={bar.rx}
                fill={bar.fill}
                opacity={bar.opacity}
                style={bar.style}
                onMouseMove={(event) => {
                  const point = localPoint(event);
                  tip.showTooltip({
                    tooltipLeft: point?.x,
                    tooltipTop: point?.y,
                    tooltipData: bar.datum,
                  });
                }}
                onMouseLeave={tip.hideTooltip}
                {...markFocusProps(tip, {
                  label: bar.ariaLabel,
                  x: x + barWidth / 2,
                  y: bar.y + bar.height / 2,
                  datum: bar.datum,
                })}
              />
            ))}
            {columnSpec.label != null && (
              <text
                x={x + barWidth / 2}
                y={labelY}
                textAnchor="middle"
                className={columnSpec.labelClassName}
              >
                {columnSpec.label}
              </text>
            )}
          </g>
        );
      })}
      {children}
    </svg>
  );
}
