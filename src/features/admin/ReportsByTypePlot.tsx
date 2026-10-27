import { useId, useState } from "react";
import {
  CHART_INK,
  ResponsiveChart,
  bandScale,
  linearScale,
  wholeNumberTicks,
} from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WeekBar } from "./adminDashboard.data";
import { chartMax } from "./api/adminOverview.adapters";
import type { TooltipControls } from "./adminBarChartParts";
import type { ReportSeriesItem } from "./ReportsByTypeLegend";
import { ReportsWeekColumn } from "./ReportsByTypeColumn";
import type { ReportTip } from "./reportsByTypeTypes";
import styles from "./AdminBarCharts.module.css";

const PAD_LEFT = 36;
const PAD_BOTTOM = 30;
const PAD_TOP = 22;
/** Narrowest column step that still fits a total above every column. */
const TOTAL_LABEL_MIN_STEP = 26;
const WEEK_LABEL_MIN_SPACING = 34;

interface ReportsByTypePlotProps {
  weeks: WeekBar[];
  series: readonly ReportSeriesItem[];
  hiddenIds: ReadonlySet<string>;
  aspect: number;
  tip: TooltipControls<ReportTip>;
}

export function ReportsByTypePlot({
  weeks,
  series,
  hiddenIds,
  aspect,
  tip,
}: ReportsByTypePlotProps) {
  const { t } = useTranslation();
  const gradientPrefix = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <ResponsiveChart aspect={aspect} minHeight={210}>
      {(width, height) => {
        const plotBottom = height - PAD_BOTTOM;
        const visibleTotals = weeks.map((week) =>
          week.values.reduce(
            (sum, value, seriesIndex) =>
              hiddenIds.has(series[seriesIndex]!.id) ? sum : sum + value,
            0,
          ),
        );
        const valueScale = linearScale(
          chartMax(visibleTotals),
          PAD_TOP,
          plotBottom,
        );
        const columnScale = bandScale(weeks.length, PAD_LEFT, width - 8, 0.42);
        const step = columnScale.step();
        const labelStride = Math.max(
          1,
          Math.ceil(WEEK_LABEL_MIN_SPACING / step),
        );
        const staggerStep = Math.min(55, 900 / Math.max(weeks.length, 1));

        return (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            role="group"
            aria-label={t("admin:dashboard.charts.reportsByType.ariaLabel")}
          >
            <defs>
              {series.map((seriesItem) => (
                <linearGradient
                  key={seriesItem.id}
                  id={`${gradientPrefix}-${seriesItem.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={seriesItem.color}
                    stopOpacity={0.96}
                  />
                  <stop
                    offset="100%"
                    stopColor={seriesItem.color}
                    stopOpacity={0.7}
                  />
                </linearGradient>
              ))}
            </defs>
            {wholeNumberTicks(valueScale, 4).map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  x2={width - 6}
                  y1={valueScale(tick)}
                  y2={valueScale(tick)}
                  stroke={CHART_INK.grid}
                  strokeDasharray={tick === 0 ? undefined : "2 5"}
                />
                <text
                  x={PAD_LEFT - 9}
                  y={valueScale(tick) + 4}
                  textAnchor="end"
                  className={styles.axisValue}
                >
                  {tick}
                </text>
              </g>
            ))}
            {weeks.map((week, weekIndex) => (
              <ReportsWeekColumn
                key={week.week}
                week={week}
                weekIndex={weekIndex}
                series={series}
                hiddenIds={hiddenIds}
                gradientPrefix={gradientPrefix}
                x={columnScale(weekIndex) ?? 0}
                barWidth={columnScale.bandwidth()}
                step={step}
                plotTop={PAD_TOP}
                plotBottom={plotBottom}
                labelY={height - 10}
                total={visibleTotals[weekIndex]!}
                valueOf={valueScale}
                activeIndex={activeIndex}
                isLabelled={(weeks.length - 1 - weekIndex) % labelStride === 0}
                isRecent={weekIndex >= weeks.length - 2}
                shouldShowTotal={step >= TOTAL_LABEL_MIN_STEP}
                staggerDelay={weekIndex * staggerStep}
                tip={tip}
                onActiveChange={setActiveIndex}
              />
            ))}
          </svg>
        );
      }}
    </ResponsiveChart>
  );
}
