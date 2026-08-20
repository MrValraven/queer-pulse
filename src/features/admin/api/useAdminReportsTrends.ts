import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { GrowthPoint, WeekBar } from "../adminDashboard.data";
import {
  buildDemoGrowthPoints,
  buildDemoReportWeeks,
  type ReportRangeWeeks,
} from "../adminReportsTrends.data";
import { growthToPoints, reportsByTypeToWeekBars } from "./adminReports.adapters";
import { getAdminReportsByType, getAdminReportsGrowth } from "./adminReports.api";

const ADMIN_REPORTS_TRENDS_KEY = "admin-reports-trends";

export interface AdminReportsTrendsData {
  growth: GrowthPoint[];
  reportWeeks: WeekBar[];
}

/**
 * Data source for the `/admin/reports` growth + reports-by-type section
 * (ADM-17): both series share the same adjustable weekly range, so one hook
 * fetches them together rather than two independently-keyed queries that
 * would refetch out of step with each other on a range change.
 */
export function useAdminReportsTrends(weeks: ReportRangeWeeks) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminReportsTrendsData>({
    queryKey: [ADMIN_REPORTS_TRENDS_KEY, demoMode, weeks],
    queryFn: async () => {
      if (demoMode) {
        return {
          growth: buildDemoGrowthPoints(weeks),
          reportWeeks: buildDemoReportWeeks(weeks),
        };
      }
      const [growthDto, reportsByTypeDto] = await Promise.all([
        getAdminReportsGrowth(weeks),
        getAdminReportsByType(weeks),
      ]);
      return {
        growth: growthToPoints(growthDto),
        reportWeeks: reportsByTypeToWeekBars(reportsByTypeDto),
      };
    },
  });
}
