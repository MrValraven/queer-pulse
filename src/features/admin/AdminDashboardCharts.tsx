import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  WEEK_LABEL_KEYS,
  type WeekBar,
  type GrowthPoint,
  type DistBucket,
} from "./adminDashboard.data";
import { chartMax } from "./api/adminOverview.adapters";
import styles from "./AdminDashboardPage.module.css";

interface ReportSeriesItem {
  id: string;
  labelKey: string;
  color: string;
}

/** Evenly-spaced "nice" gridline values from 0 up to `count * round(max/count)`
 *  — reproduces the fixture's own hand-picked ticks (0/4/8/12, 0/140/.../560,
 *  0/40/80) exactly when fed the fixture's hardcoded max, and generalizes the
 *  same shape to a live `chartMax(...)` axis. */
function axisTicks(max: number, count: number): number[] {
  const step = Math.round(max / count);
  return Array.from({ length: count + 1 }, (_, index) => step * index);
}

type ChartProps = { loading?: boolean };

// ── 1 · Reports by type (stacked bar) ───────────────────────────────────────

interface ReportsByTypeChartProps extends ChartProps {
  weeks: WeekBar[];
  series: readonly ReportSeriesItem[];
}

export function ReportsByTypeChart({
  weeks,
  series,
  loading = false,
}: ReportsByTypeChartProps) {
  const { t } = useTranslation();
  const W = 640,
    H = 240,
    padL = 34,
    padB = 30,
    padT = 12;
  const gw = W - padL - 10,
    gh = H - padB - padT;
  const max = chartMax(weeks.flatMap((wk) => wk.values));
  const ticks = axisTicks(max, 3);
  const colW = gw / Math.max(weeks.length, 1);
  const bw = colW * 0.52;

  return (
    <figure className={styles.chartCard}>
      <div className={styles.chHead}>
        <div>
          <div className={styles.chTitle}>
            {t("admin:dashboard.charts.reportsByType.title")}
          </div>
          <div className={styles.chSub}>
            {t("admin:dashboard.charts.reportsByType.sub")}
          </div>
        </div>
        <div className={styles.chLegend}>
          {series.map((seriesItem) => (
            <span key={seriesItem.id} className={styles.chLeg}>
              <span
                className={styles.chSw}
                style={{ background: seriesItem.color }}
              />
              {t(seriesItem.labelKey)}
            </span>
          ))}
        </div>
      </div>
      {loading ? (
        <SkeletonLine height={200} style={{ borderRadius: 14, marginTop: 8 }} />
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={t("admin:dashboard.charts.reportsByType.ariaLabel")}
        >
          {ticks.map((v) => {
            const y = padT + gh - (v / max) * gh;
            return (
              <g key={v}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - 6}
                  y2={y}
                  stroke="rgba(45,27,61,.08)"
                  strokeWidth={1}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  className={styles.chAxisSerif}
                >
                  {v}
                </text>
              </g>
            );
          })}
          {weeks.map((wk, i) => {
            const x = padL + (i + 0.5) * colW - bw / 2;
            let acc = 0;
            const recent = i >= weeks.length - 2;
            return (
              <g key={wk.week}>
                {wk.values.map((val, si) => {
                  if (val === 0) return null;
                  const bh = (val / max) * gh;
                  const y = padT + gh - acc - bh;
                  acc += bh;
                  return (
                    <rect
                      key={si}
                      className={styles.barSeg}
                      x={x}
                      y={y}
                      width={bw}
                      height={bh}
                      fill={series[si]?.color}
                      style={{ animationDelay: `${i * 55 + si * 20}ms` }}
                    />
                  );
                })}
                <text
                  x={padL + (i + 0.5) * colW}
                  y={H - 10}
                  textAnchor="middle"
                  className={recent ? styles.chLabelStrong : styles.chLabel}
                >
                  {WEEK_LABEL_KEYS[wk.week] ? t(WEEK_LABEL_KEYS[wk.week]!) : wk.week}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </figure>
  );
}

// ── 2 · Member growth (line) ────────────────────────────────────────────────

function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!;
    const [x1, y1] = pts[i]!;
    const mx = (x0 + x1) / 2;
    d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
  }
  return d;
}

interface MemberGrowthChartProps extends ChartProps {
  points: GrowthPoint[];
}

export function MemberGrowthChart({
  points,
  loading = false,
}: MemberGrowthChartProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const W = 360,
    H = 220,
    padL = 8,
    padR = 8,
    padT = 14,
    padB = 26;
  const gw = W - padL - padR,
    gh = H - padT - padB;
  const knownChurned = points
    .map((p) => p.churned)
    .filter((v): v is number => v !== null);
  const max = chartMax([...points.map((p) => p.joined), ...knownChurned]);
  const n = points.length;
  const px = (i: number) => padL + i * (gw / Math.max(n - 1, 1));
  const py = (v: number) => padT + gh - (v / max) * gh;
  const joined = points.map((p, i): [number, number] => [px(i), py(p.joined)]);
  const churnedPoints = points
    .map((point, index): [number, number] | null =>
      point.churned === null ? null : [px(index), py(point.churned)],
    )
    .filter((point): point is [number, number] => point !== null);
  const hasChurnData = churnedPoints.length > 0;
  const area =
    n > 0
      ? `${smoothPath(joined)} L${joined[n - 1]![0]} ${padT + gh} L${joined[0]![0]} ${padT + gh} Z`
      : "";
  const spikeIdx = points.findIndex((p) => p.spike);
  const spike = joined[spikeIdx];
  const ticks = axisTicks(max, 4);

  return (
    <figure className={styles.chartCard}>
      <div className={styles.chTitle}>
        {t("admin:dashboard.charts.memberGrowth.title")}
      </div>
      <div className={styles.chSub}>
        {t("admin:dashboard.charts.memberGrowth.sub")}
      </div>
      {loading ? (
        <SkeletonLine height={180} style={{ borderRadius: 14, marginTop: 8 }} />
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={t("admin:dashboard.charts.memberGrowth.ariaLabel")}
        >
          {ticks.map((v) => (
            <line
              key={v}
              x1={padL}
              y1={py(v)}
              x2={W - padR}
              y2={py(v)}
              stroke="rgba(45,27,61,.07)"
              strokeWidth={1}
            />
          ))}
          {n > 0 && <path d={area} fill="rgba(var(--jade-rgb),.10)" />}
          {hasChurnData && (
            <path
              d={smoothPath(churnedPoints)}
              fill="none"
              stroke="var(--accent-ink)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 5"
            />
          )}
          {n > 0 && (
            <path
              className={styles.lineDraw}
              d={smoothPath(joined)}
              pathLength={1}
              fill="none"
              stroke="var(--jade)"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {spike && (
            <>
              <circle
                cx={spike[0]}
                cy={spike[1]}
                r={5}
                fill="var(--accent)"
                stroke="var(--paper)"
                strokeWidth={2}
              />
              <text
                x={spike[0]}
                y={spike[1] - 12}
                textAnchor="middle"
                className={styles.chSpike}
              >
                {t("admin:dashboard.charts.memberGrowth.spike")}
              </text>
            </>
          )}
          {points.map((p, i) =>
            p.date ? (
              <text
                key={i}
                x={px(i)}
                y={H - 8}
                textAnchor="middle"
                className={styles.chLabel}
              >
                {fmt.date(p.date, { month: "short" })}
              </text>
            ) : null,
          )}
        </svg>
      )}
      <div className={styles.chLegend}>
        <span className={styles.chLeg}>
          <span
            className={styles.chSwDot}
            style={{ background: "var(--jade)" }}
          />
          {t("admin:dashboard.charts.legend.joined")}
        </span>
        {hasChurnData ? (
          <span className={styles.chLeg}>
            <span
              className={styles.chSwDot}
              style={{ background: "var(--accent-ink)" }}
            />
            {t("admin:dashboard.charts.legend.churned")}
          </span>
        ) : (
          <span className={styles.chLegMuted}>
            {t("admin:dashboard.charts.legend.churned")} ·{" "}
            {t("admin:dashboard.notMeasuredYet")}
          </span>
        )}
      </div>
    </figure>
  );
}

// ── 3 · Response time (distribution) ────────────────────────────────────────

interface ResponseTimeChartProps extends ChartProps {
  buckets: DistBucket[] | null;
}

export function ResponseTimeChart({
  buckets,
  loading = false,
}: ResponseTimeChartProps) {
  const { t } = useTranslation();
  const W = 360,
    H = 220,
    padL = 8,
    padR = 8,
    padT = 14,
    padB = 30;
  const gw = W - padL - padR,
    gh = H - padT - padB;
  const max = buckets ? chartMax(buckets.map((b) => b.value)) : 0;
  const ticks = axisTicks(max, 2);
  const slaIdx = buckets?.findIndex((b) => b.overSla) ?? -1;
  const colW = gw / Math.max(buckets?.length ?? 1, 1);
  const bw = colW * 0.6;
  const slaX = padL + slaIdx * colW;

  return (
    <figure className={styles.chartCard}>
      <div className={styles.chTitle}>
        {t("admin:dashboard.charts.responseTime.title")}
      </div>
      <div className={styles.chSub}>
        {t("admin:dashboard.charts.responseTime.sub")}
      </div>
      {loading ? (
        <SkeletonLine height={180} style={{ borderRadius: 14, marginTop: 8 }} />
      ) : buckets === null ? (
        <p className={styles.chNotMeasured}>
          {t("admin:dashboard.notMeasuredYet")}
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={t("admin:dashboard.charts.responseTime.ariaLabel")}
        >
          {ticks.map((v) => {
            const y = padT + gh - (v / max) * gh;
            return (
              <g key={v}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke="rgba(45,27,61,.07)"
                  strokeWidth={1}
                />
                <text x={padL} y={y - 4} className={styles.chAxisSerif}>
                  {v}
                </text>
              </g>
            );
          })}
          {buckets.map((b, i) => {
            const bh = (b.value / max) * gh;
            const x = padL + (i + 0.5) * colW - bw / 2;
            const y = padT + gh - bh;
            return (
              <g key={b.label}>
                <rect
                  className={styles.barSeg}
                  x={x}
                  y={y}
                  width={bw}
                  height={bh}
                  rx={6}
                  fill={b.overSla ? "var(--amber)" : "var(--jade)"}
                  opacity={b.overSla ? 0.92 : 1}
                  style={{ animationDelay: `${i * 55}ms` }}
                />
                <text
                  x={padL + (i + 0.5) * colW}
                  y={H - 12}
                  textAnchor="middle"
                  className={styles.chLabel}
                >
                  {b.label}
                </text>
              </g>
            );
          })}
          {slaIdx >= 0 && (
            <>
              <line
                x1={slaX}
                y1={padT - 2}
                x2={slaX}
                y2={padT + gh}
                stroke="var(--danger)"
                strokeWidth={1.4}
                strokeDasharray="4 4"
                opacity={0.6}
              />
              <text x={slaX + 5} y={padT + 8} className={styles.chSla}>
                {t("admin:dashboard.charts.responseTime.slaLabel", {
                  hours: "6h",
                })}
              </text>
            </>
          )}
        </svg>
      )}
      {buckets !== null && (
        <div className={styles.chLegend}>
          <span className={styles.chLeg}>
            <span
              className={styles.chSw}
              style={{ background: "var(--jade)" }}
            />
            {t("admin:dashboard.charts.legend.withinSla")}
          </span>
          <span className={styles.chLeg}>
            <span
              className={styles.chSw}
              style={{ background: "var(--amber)" }}
            />
            {t("admin:dashboard.charts.legend.overSla", { hours: "6h" })}
          </span>
        </div>
      )}
    </figure>
  );
}
