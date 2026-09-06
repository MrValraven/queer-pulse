import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSignups } from "./volunteering.api";
import { opportunityKeys } from "./opportunityKeys";
import { signupToRow, type SignupRow } from "./volunteering.adapters";
import { DEMO_POSTER_OPPORTUNITY_SLUG } from "../volunteerDemoPoster";
import { VOLUNTEER_APPLICANTS_DEMO } from "../volunteerApplicants.data";

/**
 * The applicant roster (GET /volunteering/:slug/signups). Only enabled for the
 * review tier — the poster, or an owner/mod of the community the opportunity
 * is attributed to (`OpportunityDetailDTO.canReviewApplicants`), which is the
 * same tier the endpoint itself guards on. Demo mode serves a static mock deck
 * for the one designated demo-poster opportunity (see `volunteerDemoPoster.ts`),
 * so the roster card and manage-applicants dashboard are reachable standalone;
 * every other slug resolves to an empty list.
 */
export function useSignups(
  slug: string | undefined,
  canReviewApplicants: boolean,
) {
  const { demoMode } = useDemoMode();
  return useQuery<SignupRow[]>({
    queryKey: opportunityKeys.signups(slug, demoMode),
    enabled: Boolean(slug) && canReviewApplicants,
    queryFn: async () => {
      if (demoMode) {
        if (slug !== DEMO_POSTER_OPPORTUNITY_SLUG) return [];
        return VOLUNTEER_APPLICANTS_DEMO.map(signupToRow);
      }
      if (!slug) return [];
      const rows = await getSignups(slug);
      return rows.map(signupToRow);
    },
  });
}
