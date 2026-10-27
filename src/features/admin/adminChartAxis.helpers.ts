import { bandScale } from "../../shared/components/charts/chartScales";
import type { Formatters } from "../../shared/i18n/format";
import { nearestPointIndex } from "./adminMemberGrowth.helpers";

/* Value-axis and roving-focus helpers shared by the admin bar charts
 * (AdminLandingVisitsChart, FeatureUsageReachPlot, FeatureUsageCreatedPlot),
 * plus the column geometry the two feature usage detail charts share, kept
 * out of the component files so they only export components. */

/** How many gridline intervals the value axis aims for. */
const AXIS_INTERVALS = 4;
/** Step sizes the axis may use within each power of ten. */
const NICE_STEP_FACTORS = [1, 2, 2.5, 5, 10] as const;

/**
 * A value axis that ends on the first whole step at or above the busiest
 * day, so the bars use the plot height and the top gridline marks the max.
 * Steps are 1, 2, 2.5 or 5 times a power of ten, kept to whole visits.
 */
export function niceAxis(peak: number): { max: number; ticks: number[] } {
  if (peak <= 0) return { max: 1, ticks: [0, 1] };
  const rawStep = peak / AXIS_INTERVALS;
  let step = 1;
  if (rawStep > 1) {
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const factor =
      NICE_STEP_FACTORS.find(
        (candidate) =>
          candidate * magnitude >= rawStep &&
          Number.isInteger(candidate * magnitude),
      ) ?? 10;
    step = factor * magnitude;
  }
  const max = Math.ceil(peak / step) * step;
  const ticks = Array.from(
    { length: max / step + 1 },
    (_, index) => index * step,
  );
  return { max, ticks };
}

/** The bar a roving-focus key moves to, or null for any other key. */
export function nextBarIndex(
  key: string,
  index: number,
  lastIndex: number,
): number | null {
  if (key === "ArrowLeft") return Math.max(0, index - 1);
  if (key === "ArrowRight") return Math.min(lastIndex, index + 1);
  if (key === "Home") return 0;
  if (key === "End") return lastIndex;
  return null;
}

/** A value-axis tick as a short label ("1.2K"), so a busy feature's axis
 *  still fits the narrow left gutter. */
export function axisTickLabel(value: number, fmt: Formatters): string {
  return fmt.number(value, { notation: "compact", maximumFractionDigits: 1 });
}

/** Plot gutters shared by the reach and created charts, so the two stack
 *  with every day in the same column. The left one fits a compact axis
 *  label; the right one fits half of the newest day's centred label. */
export const DETAIL_CHART_PAD_LEFT = 38;
export const DETAIL_CHART_PAD_RIGHT = 22;

/** The day columns of a detail chart. Long ranges close the gaps between
 *  bars, so a 365-day range keeps visible bars on a phone. */
export function detailColumnScale(count: number, width: number) {
  return bandScale(
    count,
    DETAIL_CHART_PAD_LEFT,
    width - DETAIL_CHART_PAD_RIGHT,
    count > 120 ? 0.12 : 0.28,
  );
}

/** The centre of a day column. */
export function columnCentre(
  columnScale: ReturnType<typeof bandScale>,
  index: number,
): number {
  return (columnScale(index) ?? 0) + columnScale.bandwidth() / 2;
}

/** The day column nearest a pointer's x, clamped to the first and last. */
export function nearestColumnIndex(
  columnScale: ReturnType<typeof bandScale>,
  pointerX: number,
  count: number,
): number {
  const firstCentre = columnCentre(columnScale, 0);
  const lastCentre = columnCentre(columnScale, Math.max(count - 1, 0));
  return nearestPointIndex(
    pointerX,
    firstCentre,
    lastCentre - firstCentre,
    count,
  );
}

/** The created chart's fixed height in pixels. Fixed so its loading
 *  skeleton matches it exactly and the open panel never jumps when the
 *  lazy series lands. */
export const CREATED_CHART_HEIGHT = 168;
