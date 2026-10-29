import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { LandingVisitPage } from "../../homepage/api/landingVisitBeacon";
import { demoLandingVisits } from "../adminLandingVisits.data";
import {
  getAdminLandingVisits,
  type AdminLandingVisitsDTO,
  type LandingVisitsRangeDays,
} from "./adminLandingVisits.api";

const ADMIN_LANDING_VISITS_KEY = "admin-landing-visits";

/**
 * Daily anonymous visits to one page (`GET /admin/landing/visits?rangeDays=&page=`).
 * Demo mode returns the colocated fixture for the chosen range and never
 * reaches the network, mirroring `useAdminFeatureUsage`. Live mode fetches the
 * DTO as-is; the backend already zero-fills the days and ranks the sources.
 *
 * The placeholder holds the 30-day answer on screen while the 90-day one
 * loads (and back), so switching the range does not drop the card to a
 * skeleton. It only carries over an answer for the same mode and the same
 * page: after the demo toggle flips the fixture never stands in for live
 * numbers (or the reverse), and switching the page carries no data across,
 * so one page's counts never stand in for another's.
 * The query result is returned whole so the card can read
 * `hasFailedWithoutData` / `isRetryingFailedRead` and hand `error` to
 * `describeError`.
 */
export function useAdminLandingVisits(
  rangeDays: LandingVisitsRangeDays,
  page: LandingVisitPage,
) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminLandingVisitsDTO>({
    queryKey: [ADMIN_LANDING_VISITS_KEY, demoMode, rangeDays, page],
    initialData: demoMode ? demoLandingVisits(rangeDays, page) : undefined,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === demoMode &&
      previousQuery.queryKey[3] === page
        ? previousData
        : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(demoLandingVisits(rangeDays, page))
        : getAdminLandingVisits(rangeDays, page),
  });
}
