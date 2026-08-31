import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminGuideFeedback,
  type AdminGuideRatingDTO,
} from "./adminGuideFeedback.api";

/**
 * Sorted worst-ratio-first guide-feedback list for the `Guide Feedback`
 * admin page (CNT-18). Demo mode reads the colocated fixture (already
 * sorted, mirroring the server's `ORDER BY`); live mode calls `GET
 * /admin/resources/guide-ratings` (admin-only — see
 * `AdminResourceGuideRatingsController`).
 */
export function useAdminGuideFeedback() {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminGuideRatingDTO[]>({
    queryKey: ["admin-guide-feedback", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { ADMIN_GUIDE_FEEDBACK } =
          await import("../adminGuideFeedback.data");
        return ADMIN_GUIDE_FEEDBACK;
      }
      return getAdminGuideFeedback();
    },
  });
  return {
    rows: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
