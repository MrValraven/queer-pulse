import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { buildDemoCommunityHealth } from "../adminReportsCommunityHealth.data";
import {
  getAdminReportsCommunityHealth,
  type AdminReportsCommunityHealthDTO,
} from "./adminReports.api";

const ADMIN_REPORTS_COMMUNITY_HEALTH_KEY = "admin-reports-community-health";

/**
 * Data source for the `/admin/reports` community-health section: a CURRENT
 * snapshot (average score, needing-support count, per-community table) —
 * there is no historical table on the platform, so this never carries a time
 * range the way the growth/reports-by-type section does.
 */
export function useAdminReportsCommunityHealth() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminReportsCommunityHealthDTO>({
    queryKey: [ADMIN_REPORTS_COMMUNITY_HEALTH_KEY, demoMode],
    queryFn: async () =>
      demoMode ? buildDemoCommunityHealth() : getAdminReportsCommunityHealth(),
  });
}
