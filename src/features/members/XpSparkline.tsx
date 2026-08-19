import { localPoint } from "@visx/event";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { curveMonotoneX } from "@visx/curve";
import { AreaClosed, LinePath } from "@visx/shape";
import { useChartTooltip, markFocusProps, ChartTooltip } from "../../shared/components/charts";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import chartStyles from "../../shared/components/charts/charts.module.css";
import type { XpLedgerEntry } from "./badges.data";
import styles from "./BadgesPage.module.css";

interface SparkPoint {
  date: string;
  total: number;
}

/** Oldest → newest running-total series for the receipts chart. `entries` are
 *  newest-first (ledger display order); walk backward from the latest running
 *  total to recover chronological totals. */
function chronologicalTotals(
  entries: XpLedgerEntry[],
  formatDate: (value: Date) => string,
): SparkPoint[] {
  const points: SparkPoint[] = [];
  let total = entries.reduce((sum, entry) => sum + entry.xp, 0);
  entries.forEach((entry) => {
    points.push({ date: formatDate(new Date(entry.createdAt)), total });
    total -= entry.xp;
  });
  return points.reverse();
}

/** The "Receipts" mini area chart above the ledger table: XP running total
 *  over time, with a per-point hover/focus tooltip. Reads the same
 *  `xpLedger` the table below renders. Renders nothing below two points
 *  (nothing to draw a line between). */
export function XpSparkline({ entries }: { entries: XpLedgerEntry[] }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<SparkPoint>();
  const points = chronologicalTotals(entries, (value) =>
    fmt.date(value, { day: "numeric", month: "short", year: "numeric" }),
  );
  if (points.length < 2) return null;
  const latest = points[points.length - 1]!.total;

  return (
    <div className={styles.spark}>
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={styles.sparkChart}>
        <ParentSize>
          {({ width, height }) => {
            if (width <= 0 || height <= 0) return null;
            const padX = 4;
            const padY = 6;
            const max = Math.max(...points.map((point) => point.total), 1);
            const valueScale = scaleLinear<number>({
              domain: [0, max],
              range: [height - padY, padY],
            });
            const plotWidth = width - padX * 2;
            const pointX = (index: number) =>
              padX + index * (plotWidth / Math.max(points.length - 1, 1));

            return (
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                height="100%"
                role="img"
                aria-label={t("members:badges.ledger.sparkAriaLabel", {
                  xp: latest.toLocaleString(),
                })}
              >
                <AreaClosed
                  data={points}
                  x={(_, index) => pointX(index)}
                  y={(point) => valueScale(point.total)}
                  yScale={valueScale}
                  curve={curveMonotoneX}
                  fill="rgba(var(--accent-rgb), .12)"
                />
                <LinePath
                  data={points}
                  x={(_, index) => pointX(index)}
                  y={(point) => valueScale(point.total)}
                  curve={curveMonotoneX}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, index) => (
                  <circle
                    key={index}
                    className={chartStyles.mark}
                    cx={pointX(index)}
                    cy={valueScale(point.total)}
                    r={8}
                    fill="transparent"
                    onMouseMove={(event) => {
                      const local = localPoint(event);
                      tip.showTooltip({
                        tooltipLeft: local?.x,
                        tooltipTop: local?.y,
                        tooltipData: point,
                      });
                    }}
                    onMouseLeave={tip.hideTooltip}
                    {...markFocusProps(tip, {
                      label: `${point.date}: ${t("members:badges.ledger.sparkXp", { xp: point.total.toLocaleString() })}`,
                      x: pointX(index),
                      y: valueScale(point.total),
                      datum: point,
                    })}
                  />
                ))}
              </svg>
            );
          }}
        </ParentSize>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.date}</div>
              {t("members:badges.ledger.sparkXp", { xp: data.total.toLocaleString() })}
            </>
          )}
        </ChartTooltip>
      </div>
      <span className={styles.sparkLabel}>
        {t("members:badges.ledger.sparkXp", { xp: latest.toLocaleString() })}
      </span>
    </div>
  );
}
