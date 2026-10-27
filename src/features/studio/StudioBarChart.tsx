import type { ReactNode } from "react";
import {
  BarPlot,
  ChartFrame,
  ChartTooltip,
  ResponsiveChart,
  bandScale,
  linearScale,
  useChartTooltip,
  wholeNumberTicks,
} from "../../shared/components/charts";
import chartStyles from "../../shared/components/charts/charts.module.css";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioBarChartTable } from "./StudioBarChartTable";
import {
  barAxisMaximumOf,
  isBucketWithheld,
  type StudioBarBucket,
} from "./studioBarBuckets";
import styles from "./StudioDashboardActivityChart.module.css";

// The left pad is the value-axis gutter: its labels sit at x=0, clear of
// the first bar.
const CHART_PAD = { left: 28, right: 8, top: 14, bottom: 28 };
const MINIMUM_BAR_HEIGHT = 3;
const DEFAULT_ASPECT = 360 / 200;

/** Every line of copy a Studio bar chart shows, already translated. */
export interface StudioBarChartLabels {
  title: string;
  subtitle: string;
  ariaLabel: string;
  tableCaption: string;
  bucketColumn: string;
  countColumn: string;
  showTable: string;
  hideTable: string;
}

interface StudioBarTip {
  bucketLabel: string;
  countLabel: string;
}

/** A Studio bar chart: one bar per bucket, oldest first, the current bucket
 *  in jade. A count under `floor` reads "Fewer than 5" and draws as the empty
 *  bar, so its height cannot reveal the exact figure. Every bar is a focusable
 *  mark with a text label, and a data table mirrors the series. `footer`
 *  closes the card under the plot. */
export function StudioBarChart({
  buckets,
  floor,
  labels,
  bucketLabelOf,
  axisLabelOf,
  legend,
  isLoading,
  empty = false,
  footer,
  aspect = DEFAULT_ASPECT,
  minimumPlotHeight,
}: {
  buckets: StudioBarBucket[];
  /** Counts under it read "Fewer than 5" and draw as the empty bar; null draws every count. */
  floor: number | null;
  labels: StudioBarChartLabels;
  bucketLabelOf: (bucket: StudioBarBucket) => string;
  axisLabelOf: (bucket: StudioBarBucket, index: number) => string | undefined;
  legend?: ReactNode;
  isLoading: boolean;
  empty?: ReactNode | false;
  footer?: ReactNode;
  /** Plot width over height. Defaults to 360/200. */
  aspect?: number;
  /** Keeps a wide aspect from flattening the plot on a narrow column. */
  minimumPlotHeight?: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<StudioBarTip>();

  const countLabelOf = (bucket: StudioBarBucket) =>
    isBucketWithheld(bucket, floor)
      ? t("studio:numbers.fewerThanFive")
      : fmt.number(bucket.count);

  return (
    <ChartFrame
      title={labels.title}
      subtitle={labels.subtitle}
      legend={legend}
      loading={isLoading}
      empty={empty}
      skeletonHeight={200}
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ResponsiveChart aspect={aspect} minHeight={minimumPlotHeight}>
          {(width, height) => {
            const plotBottom = height - CHART_PAD.bottom;
            const valueScale = linearScale(
              barAxisMaximumOf(buckets, floor),
              CHART_PAD.top,
              plotBottom,
            );
            const columnScale = bandScale(
              buckets.length,
              CHART_PAD.left,
              width - CHART_PAD.right,
              0.35,
            );
            return (
              <BarPlot<StudioBarBucket, StudioBarTip>
                width={width}
                height={height}
                valueScale={valueScale}
                columnScale={columnScale}
                ticks={wholeNumberTicks(valueScale, 3)}
                gridLeft={CHART_PAD.left}
                gridRight={width - CHART_PAD.right}
                labelY={height - 9}
                data={buckets}
                tip={tip}
                ariaLabel={labels.ariaLabel}
                axisLabel={(value, axisY) => (
                  <text x={0} y={axisY + 4} className={styles.axisLabel}>
                    {value}
                  </text>
                )}
                column={(bucket, index) => {
                  const barTop = isBucketWithheld(bucket, floor)
                    ? plotBottom
                    : valueScale(bucket.count);
                  const barHeight = Math.max(
                    plotBottom - barTop,
                    MINIMUM_BAR_HEIGHT,
                  );
                  const datum = {
                    bucketLabel: bucketLabelOf(bucket),
                    countLabel: countLabelOf(bucket),
                  };
                  return {
                    key: bucket.key,
                    label: axisLabelOf(bucket, index),
                    labelClassName: bucket.isCurrent
                      ? styles.columnLabelToday
                      : styles.columnLabel,
                    bars: [
                      {
                        key: bucket.key,
                        y: plotBottom - barHeight,
                        height: barHeight,
                        rx: 4,
                        fill: bucket.isCurrent
                          ? "var(--jade)"
                          : "var(--accent)",
                        className: `${chartStyles.mark} ${styles.bar}`,
                        datum,
                        ariaLabel: `${datum.bucketLabel}: ${datum.countLabel}`,
                      },
                    ],
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
              <div className={chartStyles.tipStrong}>{data.bucketLabel}</div>
              {data.countLabel}
            </>
          )}
        </ChartTooltip>
      </div>
      <StudioBarChartTable
        buckets={buckets}
        labels={labels}
        bucketLabelOf={bucketLabelOf}
        countLabelOf={countLabelOf}
      />
      {footer}
    </ChartFrame>
  );
}
