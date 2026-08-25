import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyOpportunities } from "./volunteering.api";
import { MY_OPPORTUNITIES_DEMO } from "../myOpportunities.data";

/**
 * Opportunities the viewer can review applicants for (their own, plus any
 * attributed to a community they own or moderate), with pending/accepted
 * applicant counts — backs the manage-applicants dashboard's opportunity list. Demo
 * mode returns the single designated demo-poster opportunity (see
 * `volunteerDemoPoster.ts`); live mode calls GET /volunteering/mine.
 *
 * `enabled` exists so surfaces that only need "does the viewer post at all?"
 * (the /volunteer hero's manage CTA) can skip the request for signed-out
 * visitors: GET /volunteering/mine is behind `ActiveMemberGuard` and would
 * 401 for them.
 */
export function useMyOpportunities(options: { enabled?: boolean } = {}) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: ["my-opportunities", demoMode],
    enabled: options.enabled ?? true,
    queryFn: async () => {
      if (demoMode) return MY_OPPORTUNITIES_DEMO;
      return getMyOpportunities();
    },
  });
}
