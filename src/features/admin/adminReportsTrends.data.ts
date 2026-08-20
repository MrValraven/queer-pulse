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

export const RANGE_OPTIONS: RangeOption[] = REPORT_RANGE_WEEKS.map(
  (weeks) => ({ value: String(weeks), weeks }),
);

/** Thins the line chart's x-axis date labels for the longer ranges — mirrors
 *  `adminReports.adapters.ts`'s live-mode `shouldLabelPoint`, so demo and
 *  live look the same at every range. */
function shouldLabelPoint(index: number, totalPoints: number): boolean {
  if (totalPoints <= 8) return true;
  const stride = totalPoints <= 12 ? 2 : 4;
  return index === totalPoints - 1 || index % stride === 0;
}

/**
 * Deterministic demo member-growth series for a given weekly range. There is
 * no backend in demo mode, so this generates a plausible, stable ramp with
 * one clear "spike" week rather than reshaping the fixed 10-point
 * `MEMBER_GROWTH` fixture (built for the Overview dashboard's own fixed
 * window) into ranges it was never shaped for.
 */
export function buildDemoGrowthPoints(weeks: number): GrowthPoint[] {
  const spikeIndex = Math.max(2, Math.floor(weeks * 0.7));
  const baseDate = new Date(2026, 0, 1);
  const points: GrowthPoint[] = [];
  for (let index = 0; index < weeks; index += 1) {
    const ramp = 140 + Math.round((260 * index) / Math.max(weeks - 1, 1));
    const wobble = Math.round(30 * Math.sin(index * 1.3));
    const joined = index === spikeIndex ? ramp + 220 : ramp + wobble;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + index * 7);
    points.push({
      date: shouldLabelPoint(index, weeks) ? date : null,
      joined,
      churned: null,
      spike: index === spikeIndex,
    });
  }
  return points;
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
