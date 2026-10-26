import type { GrowthPoint, WeekBar } from "./adminDashboard.data";

/** The same weekly-range presets the backend allowlists
 *  (`admin-reports-response.ts`'s `REPORT_WEEK_RANGES`). */
export const REPORT_RANGE_WEEKS = [4, 8, 12, 26] as const;
export type ReportRangeWeeks = (typeof REPORT_RANGE_WEEKS)[number];

export const DEFAULT_REPORT_RANGE_WEEKS: ReportRangeWeeks = 8;

export interface RangeOption {
  value: string;
  weeks: ReportRangeWeeks;
}

export const RANGE_OPTIONS: RangeOption[] = REPORT_RANGE_WEEKS.map((weeks) => ({
  value: String(weeks),
  weeks,
}));

/** The running member total the demo series lands on, matching the Overview
 *  dashboard's `MEMBER_GROWTH` fixture and active-members tile. */
const DEMO_LATEST_TOTAL = 8412;

/**
 * Deterministic demo member-growth series for a given weekly range. There is
 * no backend in demo mode, so this generates a plausible, stable run of
 * weekly joins and a steadily rising running total rather than reshaping the
 * fixed 10-point `MEMBER_GROWTH` fixture (built for the Overview dashboard's
 * own fixed window) into ranges it was never shaped for.
 */
export function buildDemoGrowthPoints(weeks: number): GrowthPoint[] {
  const latestWeekStart = new Date(2026, 9, 19);
  const weeklyJoins = Array.from(
    { length: weeks },
    (_, index) => 80 + Math.round(14 * Math.sin(index * 1.3)),
  );
  const joinsInRange = weeklyJoins.reduce((sum, joined) => sum + joined, 0);
  let runningTotal = DEMO_LATEST_TOTAL - joinsInRange;
  return weeklyJoins.map((joined, index) => {
    runningTotal += joined;
    const date = new Date(latestWeekStart);
    date.setDate(date.getDate() - (weeks - 1 - index) * 7);
    return { date, joined, total: runningTotal, churned: null };
  });
}

/** Deterministic demo reports-by-type series for a given weekly range — same
 *  rationale as `buildDemoGrowthPoints`. */
export function buildDemoReportWeeks(weeks: number): WeekBar[] {
  const bars: WeekBar[] = [];
  for (let index = 0; index < weeks; index += 1) {
    const week =
      index === weeks - 1
        ? "this"
        : index === weeks - 2
          ? "last"
          : String(index - (weeks - 1));
    const cycle = index % 5;
    bars.push({
      week,
      values: [
        cycle === 0 ? 2 : 1,
        3 + (cycle % 3),
        1 + (cycle % 2),
        1 + ((index + 1) % 3),
      ],
    });
  }
  return bars;
}
