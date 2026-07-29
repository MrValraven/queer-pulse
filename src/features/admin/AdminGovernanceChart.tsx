import { useMemo, useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminSeg, type AdminSegOption } from "./ui";
import { QUARTER_RANGE_IDS, type QuarterRangeId } from "./adminGovernance.data";
import type { AdminFinanceHistoryPoint } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernancePage.module.css";

const W = 720;
const H = 260;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 34;

interface ChartQuarterPoint {
  label: string;
  /** €k income. */
  income: number;
  /** €k spending. */
  spend: number;
}

function toChartPoints(
  history: AdminFinanceHistoryPoint[],
): ChartQuarterPoint[] {
  return history.map((point) => ({
    label: point.quarter,
    income: point.incomeTotal / 1000,
    spend: point.expenseTotal / 1000,
  }));
}

/** Smallest multiple-of-5 €k axis top that fits every bar, so the chart
 *  scales to whatever range of figures the backend publishes rather than a
 *  fixed historical max. */
function computeAxisMax(data: ChartQuarterPoint[]): number {
  const values = data.flatMap((point) => [point.income, point.spend]);
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

  const axisMax = computeAxisMax(data);
  const gridlines = [0, 0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.round(axisMax * fraction),
  );

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const groupW = data.length > 0 ? plotW / data.length : plotW;
  const barW = Math.min(26, groupW * 0.3);
  const gap = 6;
  const y = (v: number) => PAD_T + plotH - (v / axisMax) * plotH;

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
        <svg
          className={styles.chartSvg}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t("admin:governance.chart.ariaLabel")}
          preserveAspectRatio="xMidYMid meet"
        >
          {gridlines.map((g) => (
            <g key={g}>
              <line
                className={styles.chartGrid}
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y(g)}
                y2={y(g)}
              />
              <text
                className={styles.chartAxis}
                x={PAD_L - 8}
                y={y(g) + 3}
                textAnchor="end"
              >
                {g}
              </text>
            </g>
          ))}

          {data.map((q, i) => {
            const cx = PAD_L + groupW * i + groupW / 2;
            const incX = cx - barW - gap / 2;
            const spX = cx + gap / 2;
            return (
              <g key={q.label}>
                <rect
                  className={`${styles.chartBar} ${styles.barIncome}`}
                  x={incX}
                  y={y(q.income)}
                  width={barW}
                  height={PAD_T + plotH - y(q.income)}
                  rx={4}
                  style={{ animationDelay: `${i * 60}ms` }}
                />
                <rect
                  className={`${styles.chartBar} ${styles.barSpend}`}
                  x={spX}
                  y={y(q.spend)}
                  width={barW}
                  height={PAD_T + plotH - y(q.spend)}
                  rx={4}
                  style={{ animationDelay: `${i * 60 + 30}ms` }}
                />
                <text
                  className={styles.chartLabel}
                  x={cx}
                  y={H - 12}
                  textAnchor="middle"
                >
                  {q.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
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
