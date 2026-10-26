import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { demoLandingVisits } from "../adminLandingVisits.data";
import {
  getAdminLandingVisits,
  type AdminLandingVisitsDTO,
  type LandingVisitsRangeDays,
} from "./adminLandingVisits.api";

const ADMIN_LANDING_VISITS_KEY = "admin-landing-visits";

/**
 * Daily anonymous landing visits (`GET /admin/landing/visits?rangeDays=`).
 * Demo mode returns the colocated fixture for the chosen range and never
 * reaches the network, mirroring `useAdminFeatureUsage`. Live mode fetches the
 * DTO as-is; the backend already zero-fills the days and ranks the sources.
 *
 * The placeholder holds the 30-day answer on screen while the 90-day one
 * loads (and back), so switching the range does not drop the card to a
 * skeleton. It only carries over an answer from the same mode: after the demo
 * toggle flips, the fixture never stands in for live numbers (or the reverse).
 * The query result is returned whole so the card can read
 * `hasFailedWithoutData` / `isRetryingFailedRead` and hand `error` to
 * `describeError`.
 */
export function useAdminLandingVisits(rangeDays: LandingVisitsRangeDays) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminLandingVisitsDTO>({
    queryKey: [ADMIN_LANDING_VISITS_KEY, demoMode, rangeDays],
    initialData: demoMode ? demoLandingVisits(rangeDays) : undefined,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === demoMode ? previousData : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(demoLandingVisits(rangeDays))
        : getAdminLandingVisits(rangeDays),
  });
}
