import type { TFunction } from "../../shared/i18n/types";
import type { GrowthPoint } from "./adminDashboard.data";
import { startsNewMonth } from "./adminDashboardChart.helpers";
import { YEAR_RANGE_WEEKS } from "./adminReportsTrends.data";

/* Pure helpers for the member-growth line chart (AdminMemberGrowthChart.tsx),
 * kept out of the component files so they only export components
 * (react-refresh/only-export-components). */

/** A short month name at the chart's 11px label size is about this wide, in
 *  SVG user units (which equal pixels, since the viewBox matches the render). */
const MONTH_LABEL_WIDTH = 28;
/** The least space kept between two month labels. */
const MONTH_LABEL_GAP = 8;

export interface MonthTick {
  index: number;
  anchor: "start" | "middle" | "end";
}

/** The point nearest a pointer's x, for a series spread flush across
 *  `plotLeft … plotLeft + plotWidth`. A pointer past either edge clamps to
 *  the first or last point, so the whole plot answers. */
export function nearestPointIndex(
  pointerX: number,
  plotLeft: number,
  plotWidth: number,
  count: number,
): number {
  if (count <= 1) return 0;
  const step = plotWidth / (count - 1);
  const index = Math.round((pointerX - plotLeft) / step);
  return Math.min(Math.max(index, 0), count - 1);
}

function placeTick(
  index: number,
  pointX: (index: number) => number,
  plotLeft: number,
  plotRight: number,
): MonthTick {
  const centre = pointX(index);
  if (centre - MONTH_LABEL_WIDTH / 2 < plotLeft)
    return { index, anchor: "start" };
  if (centre + MONTH_LABEL_WIDTH / 2 > plotRight)
    return { index, anchor: "end" };
  return { index, anchor: "middle" };
}

function tickExtent(
  tick: MonthTick,
  pointX: (index: number) => number,
): [left: number, right: number] {
  const anchorX = pointX(tick.index);
  if (tick.anchor === "start") return [anchorX, anchorX + MONTH_LABEL_WIDTH];
  if (tick.anchor === "end") return [anchorX - MONTH_LABEL_WIDTH, anchorX];
  return [anchorX - MONTH_LABEL_WIDTH / 2, anchorX + MONTH_LABEL_WIDTH / 2];
}

function ticksFit(
  ticks: MonthTick[],
  pointX: (index: number) => number,
): boolean {
  return ticks.every((tick, position) => {
    const previous = ticks[position - 1];
    if (!previous) return true;
    const [, previousRight] = tickExtent(previous, pointX);
    const [left] = tickExtent(tick, pointX);
    return left - previousRight >= MONTH_LABEL_GAP;
  });
}

/**
 * The month labels the x-axis prints: each month once, under the week it
 * starts in. Edge labels anchor inside the plot so neither end is clipped.
 * When a long range packs the months too tightly, every second (third, …)
 * month is kept so the labels stay evenly spaced and legible. A first label
 * crowding the next one belongs to a month the range only clips the end of,
 * so it gives way first.
 */
export function monthTicks(
  points: GrowthPoint[],
  pointX: (index: number) => number,
  plotLeft: number,
  plotRight: number,
): MonthTick[] {
  const place = (index: number) =>
    placeTick(index, pointX, plotLeft, plotRight);
  let monthStarts = points
    .map((_, index) => index)
    .filter((index) => startsNewMonth(points, index));
  if (
    monthStarts.length > 1 &&
    !ticksFit(monthStarts.slice(0, 2).map(place), pointX)
  ) {
    monthStarts = monthStarts.slice(1);
  }
  for (let stride = 1; stride <= monthStarts.length; stride += 1) {
    const ticks = monthStarts
      .filter((_, position) => position % stride === 0)
      .map(place);
    if (ticksFit(ticks, pointX)) return ticks;
  }
  return monthStarts.slice(0, 1).map(place);
}

/** The label a weekly-range preset carries on a range toggle: "4w", "26w",
 *  and a year for the 52-week preset. */
export function reportRangeLabel(weeks: number, t: TFunction): string {
  return weeks === YEAR_RANGE_WEEKS
    ? t("admin:reports.trends.rangeYear")
    : t("admin:reports.trends.rangeWeeks", { count: weeks });
}
