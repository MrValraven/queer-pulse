import type { GrowthPoint, WeekBar } from "../adminDashboard.data";
import type { AdminReportsByTypeDTO, AdminReportsGrowthDTO } from "./adminReports.api";

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

export function reportsByTypeToWeekBars(
  dto: AdminReportsByTypeDTO,
): WeekBar[] {
  const totalWeeks = dto.weeks.length;
  return dto.weeks.map((week, index) => ({
    week: weekLabelForIndex(index, totalWeeks),
    values: week.values,
  }));
}

/** Thins the line chart's x-axis date labels for the longer ranges so a
 *  26-week line doesn't crowd every tick — every point still contributes to
 *  the line and its tooltip, only the visible label is sparsified. */
function shouldLabelPoint(index: number, totalPoints: number): boolean {
  if (totalPoints <= 8) return true;
  const stride = totalPoints <= 12 ? 2 : 4;
  return index === totalPoints - 1 || index % stride === 0;
}

export function growthToPoints(dto: AdminReportsGrowthDTO): GrowthPoint[] {
  const totalPoints = dto.points.length;
  return dto.points.map((point, index) => ({
    date: shouldLabelPoint(index, totalPoints) ? new Date(point.at) : null,
    joined: point.joined,
    churned: point.churned,
    spike: point.spike,
  }));
}
