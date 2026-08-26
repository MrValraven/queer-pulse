import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyContribution } from "./volunteering.api";
import type { MyVolunteerContributionDTO } from "./volunteering.api";
import { opportunityKeys } from "./opportunityKeys";
import { VOLUNTEER_CONTRIBUTION_DEMO } from "../volunteerApplicants.data";

/**
 * The viewer's OWN confirmed volunteer sessions and hours
 * (GET /volunteering/me/contribution). Sessions here are ones a poster
 * confirmed, never self-declared, which is what makes the number worth
 * showing back.
 *
 * `enabled` exists because the endpoint sits behind `ActiveMemberGuard` and
 * would 401 for a signed-out visitor, exactly as `useMyOpportunities` handles
 * the same problem.
 *
 * Demo mode serves a static stand-in and never touches the network.
 */
export function useMyContribution(options: { enabled?: boolean } = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<MyVolunteerContributionDTO>({
    queryKey: opportunityKeys.contribution(demoMode),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      if (demoMode) return VOLUNTEER_CONTRIBUTION_DEMO;
      return getMyContribution();
    },
  });
}
