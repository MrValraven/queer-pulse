import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WeekBar } from "./adminDashboard.data";
import { ColumnHitArea, type TooltipControls } from "./adminBarChartParts";
import { useAdminWeekLabels } from "./useAdminWeekLabels";
import type { ReportSeriesItem } from "./ReportsByTypeLegend";
import type { ReportTip, ReportTipRow } from "./reportsByTypeTypes";
import styles from "./AdminBarCharts.module.css";

const STACK_RADIUS = 6;

interface ReportsWeekColumnProps {
  week: WeekBar;
  weekIndex: number;
  series: readonly ReportSeriesItem[];
  hiddenIds: ReadonlySet<string>;
  gradientPrefix: string;
  /** Column left edge, bar width and column step in SVG user units. */
  x: number;
  barWidth: number;
  step: number;
  plotTop: number;
  plotBottom: number;
  labelY: number;
  total: number;
  valueOf: (value: number) => number;
  activeIndex: number | null;
  isLabelled: boolean;
  isRecent: boolean;
  shouldShowTotal: boolean;
  staggerDelay: number;
  tip: TooltipControls<ReportTip>;
  onActiveChange: (columnIndex: number | null) => void;
}

export function ReportsWeekColumn(props: ReportsWeekColumnProps) {
  const { week, weekIndex, series, hiddenIds, gradientPrefix, x, barWidth } =
    props;
  const { step, plotTop, plotBottom, total, valueOf, activeIndex } = props;
  const { t } = useTranslation();
  const weekLabels = useAdminWeekLabels();
  const centerX = x + barWidth / 2;
  const bandInset = (step - barWidth) / 2;
  const stackTop = valueOf(total);
  const isActive = activeIndex === weekIndex;
  const dimmedClass = activeIndex !== null && !isActive ? styles.dimmed : "";
  const longLabel = weekLabels.longLabel(week.week);
  const rows: ReportTipRow[] = series
    .map((seriesItem, seriesIndex) => ({
      id: seriesItem.id,
      label: t(seriesItem.labelKey),
      color: seriesItem.color,
      value: week.values[seriesIndex]!,
    }))
    .filter((row) => !hiddenIds.has(row.id));
  const breakdown = rows.map((row) => `${row.label} ${row.value}`).join(", ");
  const clipId = `${gradientPrefix}-clip-${weekIndex}`;
  const visibleValues = series.map((seriesItem, seriesIndex) =>
    hiddenIds.has(seriesItem.id) ? 0 : week.values[seriesIndex]!,
  );

  return (
    <g>
      <rect
        className={`${styles.hoverBand} ${isActive ? styles.hoverBandOn : ""}`}
        x={x - bandInset + 1}
        y={plotTop - 6}
        width={step - 2}
        height={plotBottom - plotTop + 6}
        rx={10}
      />
      {total === 0 ? (
        <rect
          className={`${styles.zeroStub} ${dimmedClass}`}
          x={x}
          y={plotBottom - 3}
          width={barWidth}
          height={3}
          rx={1.5}
        />
      ) : (
        <g
          className={styles.barSegEnter}
          style={{ animationDelay: `${props.staggerDelay}ms` }}
        >
          <g className={`${styles.stack} ${dimmedClass}`}>
            <clipPath id={clipId}>
              <rect
                className={styles.geometry}
                x={x}
                width={barWidth}
                rx={STACK_RADIUS}
                y={stackTop}
                height={plotBottom - stackTop + STACK_RADIUS}
                style={{
                  y: `${stackTop}px`,
                  height: `${plotBottom - stackTop + STACK_RADIUS}px`,
                }}
              />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              {series.map((seriesItem, seriesIndex) => {
                if (hiddenIds.has(seriesItem.id)) return null;
                const valueBelow = visibleValues
                  .slice(0, seriesIndex)
                  .reduce((sum, value) => sum + value, 0);
                const segmentTop = valueOf(
                  valueBelow + visibleValues[seriesIndex]!,
                );
                const segmentHeight = valueOf(valueBelow) - segmentTop;
                return (
                  <rect
                    key={seriesItem.id}
                    className={styles.geometry}
                    x={x}
                    width={barWidth}
                    y={segmentTop}
                    height={segmentHeight}
                    style={{
                      y: `${segmentTop}px`,
                      height: `${segmentHeight}px`,
                    }}
                    fill={`url(#${gradientPrefix}-${seriesItem.id})`}
                    stroke="var(--paper)"
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
          </g>
        </g>
      )}
      {total > 0 && (
        <text
          className={`${styles.totalLabel} ${props.shouldShowTotal || isActive ? styles.totalLabelShown : ""} ${isActive ? styles.totalLabelActive : ""}`}
          x={0}
          y={0}
          textAnchor="middle"
          style={{ transform: `translate(${centerX}px, ${stackTop - 6}px)` }}
        >
          {total}
        </text>
      )}
      {props.isLabelled && (
        <text
          x={centerX}
          y={props.labelY}
          textAnchor="middle"
          className={
            props.isRecent || isActive ? styles.axisWeekStrong : styles.axisWeek
          }
        >
          {weekLabels.axisLabel(week.week)}
        </text>
      )}
      <ColumnHitArea<ReportTip>
        columnIndex={weekIndex}
        x={x - bandInset}
        y={plotTop - 6}
        width={step}
        height={plotBottom - plotTop + 6}
        ariaLabel={t("admin:dashboard.charts.reportsByType.columnAria", {
          week: longLabel,
          breakdown,
          total,
        })}
        datum={{ weekLabel: longLabel, rows, total }}
        tip={props.tip}
        onActiveChange={props.onActiveChange}
      />
    </g>
  );
}
