import type { GrowthPoint, WeekBar } from "../adminDashboard.data";
import type {
  AdminReportsByTypeDTO,
  AdminReportsGrowthDTO,
} from "./adminReports.api";

/**
 * Maps the `/admin/reports` growth / reports-by-type DTOs onto the SAME
 * `GrowthPoint`/`WeekBar` view models `AdminDashboardCharts.tsx` already
 * renders (`MemberGrowthChart`/`ReportsByTypeChart`) — this page reuses those
 * chart components verbatim rather than building new ones. Mirrors
 * `adminOverview.adapters.ts`'s own reports-by-type / member-growth mappers,
 * generalized to whatever weekly range the caller asked for.
 */

/** Only the last two weeks are real words ("last"/"this"); every earlier
 *  week is a bare numeric offset — matches `REPORT_WEEKS`'s own id scheme
 *  regardless of how many weeks the caller-adjustable range currently asks
 *  for (mirrors `adminOverview.adapters.ts`'s `weekLabelForIndex`). */
function weekLabelForIndex(index: number, totalWeeks: number): string {
  if (index === totalWeeks - 1) return "this";
  if (index === totalWeeks - 2) return "last";
  return String(index - (totalWeeks - 1));
}

export function reportsByTypeToWeekBars(dto: AdminReportsByTypeDTO): WeekBar[] {
  const totalWeeks = dto.weeks.length;
  return dto.weeks.map((week, index) => ({
    week: weekLabelForIndex(index, totalWeeks),
    values: week.values,
  }));
}

/** GET /admin/reports/growth → the member-growth line points. The line plots
 *  `total` (running member count per week) and the tooltip adds that week's
 *  `joined`, the same mapping `adminOverview.adapters.ts` uses. Every point
 *  keeps its date; the chart decides which ones get a month label. */
export function growthToPoints(dto: AdminReportsGrowthDTO): GrowthPoint[] {
  return dto.points.map((point) => ({
    date: new Date(point.at),
    joined: point.joined,
    total: point.total,
    churned: point.churned,
  }));
}
