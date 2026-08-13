import { useMemo, useState, type MouseEvent } from "react";
import { localPoint } from "@visx/event";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  ResponsiveChart,
  useChartTooltip,
  markFocusProps,
  linearScale,
  bandScale,
} from "../../shared/components/charts";
import { ChartTooltip } from "./AdminDashboardChartParts";
import { AdminSeg, type AdminSegOption } from "./ui";
import { QUARTER_RANGE_IDS, type QuarterRangeId } from "./adminGovernance.data";
import type { AdminFinanceHistoryPoint } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernancePage.module.css";
import chartStyles from "../../shared/components/charts/charts.module.css";

const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 34;
/** Width ÷ height. The plot container reserves this ratio in CSS
 *  (`.chartPlot`), and ResponsiveChart derives the SVG height from it so the
 *  viewBox matches the rendered pixels (keeping tooltip coordinates exact). */
const CHART_ASPECT = 720 / 300;

interface ChartQuarterPoint {
  label: string;
  /** €k income, used for bar geometry against the €k axis. */
  incomeK: number;
  /** €k spending, used for bar geometry against the €k axis. */
  spendK: number;
  /** Raw € income, shown precisely in the tooltip. */
  incomeTotal: number;
  /** Raw € spending, shown precisely in the tooltip. */
  spendTotal: number;
}

/** The quarter figures surfaced when a bar is hovered or focused. */
interface QuarterTip {
  label: string;
  income: number;
  spend: number;
  surplus: number;
}

function toChartPoints(
  history: AdminFinanceHistoryPoint[],
): ChartQuarterPoint[] {
  return history.map((point) => ({
    label: point.quarter,
    incomeK: point.incomeTotal / 1000,
    spendK: point.expenseTotal / 1000,
    incomeTotal: point.incomeTotal,
    spendTotal: point.expenseTotal,
  }));
}

/** Smallest multiple-of-5 €k axis top that fits every bar, so the chart
 *  scales to whatever range of figures the backend publishes rather than a
 *  fixed historical max. */
function computeAxisMax(data: ChartQuarterPoint[]): number {
  const values = data.flatMap((point) => [point.incomeK, point.spendK]);
  const rawMax = Math.max(...values, 1);
  return Math.ceil(rawMax / 5) * 5 || 5;
}

export function AdminGovernanceChart({
  history,
}: {
  history: AdminFinanceHistoryPoint[];
}) {
  const { t } = useTranslation();
  const [range, setRange] = useState<QuarterRangeId>("6q");
  const rangeOptions: AdminSegOption[] = QUARTER_RANGE_IDS.map((id) => ({
    value: id,
    label: t(`admin:governance.chart.range.${id}`),
  }));

  const points = useMemo(() => toChartPoints(history), [history]);
  const data = useMemo(
    () => (range === "4q" ? points.slice(-4) : points),
    [points, range],
  );

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <div>
          <h2 className={styles.cardTitle}>
            <Translation
              i18nKey="admin:governance.chart.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.cardSub}>{t("admin:governance.chart.sub")}</p>
        </div>
        <AdminSeg
          options={rangeOptions}
          value={range}
          onChange={(v) => setRange(v as QuarterRangeId)}
        />
      </div>

      <div className={styles.chartLegend}>
        <Legend
          swatch={styles.legIncome!}
          label={t("admin:governance.chart.legend.income")}
        />
        <Legend
          swatch={styles.legSpend!}
          label={t("admin:governance.chart.legend.spending")}
        />
        <Legend
          swatch={styles.legReserve!}
          label={t("admin:governance.chart.legend.surplus")}
          dashed
        />
      </div>

      {data.length === 0 ? (
        <p className={styles.cardSub}>{t("admin:governance.finances.empty")}</p>
      ) : (
        <GovernanceChartPlot data={data} />
      )}
    </div>
  );
}

/** The visx bar plot itself: grouped income/spend bars per quarter, a dashed
 *  surplus band over each spending bar, and a hover/focus tooltip breaking the
 *  quarter into income, spending, and surplus. Split from the shell above to
 *  keep each component under the 200-line limit. */
function GovernanceChartPlot({ data }: { data: ChartQuarterPoint[] }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<QuarterTip>();

  const axisMax = computeAxisMax(data);
  // Same "nice" fractions the hand-rolled chart used (0, 1, 3, 4, 5 for a max
  // of 5), so the axis reads identically to before.
  const gridlines = [0, 0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.round(axisMax * fraction),
  );

  return (
    // eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render.
    <div ref={tip.containerRef} className={styles.chartPlot}>
      <ResponsiveChart aspect={CHART_ASPECT}>
        {(width, height) => {
          const plotBottom = height - PAD_B;
          const valueScale = linearScale(axisMax, PAD_T, plotBottom);
          const columnScale = bandScale(data.length, PAD_L, width - PAD_R, 0.34);
          const bandW = columnScale.bandwidth();
          const innerGap = Math.min(6, bandW * 0.08);
          const barW = Math.max(4, (bandW - innerGap) / 2);

          return (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              role="img"
              aria-label={t("admin:governance.chart.ariaLabel")}
            >
              {gridlines.map((value) => {
                const gy = valueScale(value);
                return (
                  <g key={value}>
                    <line
                      className={styles.chartGrid}
                      x1={PAD_L}
                      x2={width - PAD_R}
                      y1={gy}
                      y2={gy}
                    />
                    <text
                      className={styles.chartAxis}
                      x={PAD_L - 8}
                      y={gy + 3}
                      textAnchor="end"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {data.map((quarter, index) => {
                const x = columnScale(index) ?? 0;
                const incomeX = x;
                const spendX = x + barW + innerGap;
                const incomeY = valueScale(quarter.incomeK);
                const spendY = valueScale(quarter.spendK);
                const surplus = quarter.incomeTotal - quarter.spendTotal;
                const datum: QuarterTip = {
                  label: quarter.label,
                  income: quarter.incomeTotal,
                  spend: quarter.spendTotal,
                  surplus,
                };
                const show = (event: MouseEvent<SVGRectElement>) => {
                  const point = localPoint(event);
                  tip.showTooltip({
                    tooltipLeft: point?.x,
                    tooltipTop: point?.y,
                    tooltipData: datum,
                  });
                };
                return (
                  <g key={quarter.label}>
                    <rect
                      className={`${styles.chartBar} ${styles.barIncome} ${chartStyles.mark}`}
                      x={incomeX}
                      y={incomeY}
                      width={barW}
                      height={plotBottom - incomeY}
                      rx={4}
                      style={{ animationDelay: `${index * 60}ms` }}
                      onMouseMove={show}
                      onMouseLeave={tip.hideTooltip}
                      {...markFocusProps(tip, {
                        label: `${quarter.label} · ${t("admin:governance.chart.legend.income")}: ${fmt.currency(quarter.incomeTotal)}`,
                        x: incomeX + barW / 2,
                        y: incomeY + (plotBottom - incomeY) / 2,
                        datum,
                      })}
                    />
                    {/* Surplus = the gap the spending bar leaves under income.
                        Only drawn when income clears spending. */}
                    {surplus > 0 && (
                      <rect
                        className={styles.surplusBand}
                        x={spendX}
                        y={incomeY}
                        width={barW}
                        height={spendY - incomeY}
                        rx={4}
                        pointerEvents="none"
                        aria-hidden
                      />
                    )}
                    <rect
                      className={`${styles.chartBar} ${styles.barSpend} ${chartStyles.mark}`}
                      x={spendX}
                      y={spendY}
                      width={barW}
                      height={plotBottom - spendY}
                      rx={4}
                      style={{ animationDelay: `${index * 60 + 30}ms` }}
                      onMouseMove={show}
                      onMouseLeave={tip.hideTooltip}
                      {...markFocusProps(tip, {
                        label: `${quarter.label} · ${t("admin:governance.chart.legend.spending")}: ${fmt.currency(quarter.spendTotal)}`,
                        x: spendX + barW / 2,
                        y: spendY + (plotBottom - spendY) / 2,
                        datum,
                      })}
                    />
                    <text
                      className={styles.chartLabel}
                      x={x + bandW / 2}
                      y={height - 12}
                      textAnchor="middle"
                    >
                      {quarter.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          );
        }}
      </ResponsiveChart>
      {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
      <ChartTooltip tip={tip}>
        {(active) => (
          <>
            <div className={chartStyles.tipStrong}>{active.label}</div>
            {t("admin:governance.chart.legend.income")}:{" "}
            {fmt.currency(active.income)}
            <br />
            {t("admin:governance.chart.legend.spending")}:{" "}
            {fmt.currency(active.spend)}
            <br />
            {t("admin:governance.chart.legend.surplus")}:{" "}
            {fmt.currency(active.surplus)}
          </>
        )}
      </ChartTooltip>
    </div>
  );
}

function Legend({
  swatch,
  label,
  dashed = false,
}: {
  swatch: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className={styles.legItem}>
      <span
        className={[styles.legSwatch, swatch, dashed && styles.legDashed]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
      {label}
    </span>
  );
}
