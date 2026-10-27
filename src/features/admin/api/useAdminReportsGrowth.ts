import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { GrowthPoint } from "../adminDashboard.data";
import {
  buildDemoGrowthPoints,
  type ReportRangeWeeks,
} from "../adminReportsTrends.data";
import { growthToPoints } from "./adminReports.adapters";
import { getAdminReportsGrowth } from "./adminReports.api";

const ADMIN_REPORTS_GROWTH_KEY = "admin-reports-growth";

/**
 * Member growth alone over an adjustable weekly range
 * (`GET /admin/reports/growth?weeks=`), for the Overview dashboard's growth
 * card. The Reports page keeps `useAdminReportsTrends`, which fetches growth
 * and reports-by-type together because they share one range control there.
 * Demo mode builds the deterministic series for the chosen range and never
 * reaches the network.
 *
 * The placeholder holds the previous range's line on screen while the next
 * one loads, so switching the range does not drop the card to a skeleton. It
 * only carries over an answer from the same mode, mirroring
 * `useAdminLandingVisits`: after the demo toggle flips, the fixture never
 * stands in for live numbers (or the reverse). The query result is returned
 * whole so the card can read `hasFailedWithoutData` / `isRetryingFailedRead`.
 */
export function useAdminReportsGrowth(weeks: ReportRangeWeeks) {
  const { demoMode } = useDemoMode();
  return useQuery<GrowthPoint[]>({
    queryKey: [ADMIN_REPORTS_GROWTH_KEY, demoMode, weeks],
    initialData: demoMode ? () => buildDemoGrowthPoints(weeks) : undefined,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === demoMode ? previousData : undefined,
    queryFn: async () =>
      demoMode
        ? buildDemoGrowthPoints(weeks)
        : growthToPoints(await getAdminReportsGrowth(weeks)),
  });
}
