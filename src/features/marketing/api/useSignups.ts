import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSignups } from "./volunteering.api";
import { opportunityKeys } from "./opportunityKeys";
import { signupToRow, type SignupRow } from "./volunteering.adapters";
import { DEMO_POSTER_OPPORTUNITY_SLUG } from "../volunteerDemoPoster";
import { VOLUNTEER_APPLICANTS_DEMO } from "../volunteerApplicants.data";

/**
 * Poster-only signup roster (GET /volunteering/:slug/signups). Only enabled
 * when the viewer is the poster. Demo mode serves a static mock deck for the
 * one designated demo-poster opportunity (see `volunteerDemoPoster.ts`), so
 * the roster card and manage-applicants dashboard are reachable standalone;
 * every other slug resolves to an empty list.
 */
export function useSignups(slug: string | undefined, isPoster: boolean) {
  const { demoMode } = useDemoMode();
  return useQuery<SignupRow[]>({
    queryKey: opportunityKeys.signups(slug, demoMode),
    enabled: Boolean(slug) && isPoster,
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
