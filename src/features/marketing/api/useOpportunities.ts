import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getOpportunities, type Cause, type Commit } from "./volunteering.api";
import { cardToOpportunity } from "./volunteering.adapters";
import {
  VOLUNTEER_OPPORTUNITIES,
  type VolunteerOpportunity,
} from "../volunteerOpportunities";

export interface OpportunitiesResult {
  items: VolunteerOpportunity[];
  total: number;
}

/**
 * Volunteer opportunities list source. Demo mode returns the page's own
 * `VOLUNTEER_OPPORTUNITIES` registry (full fidelity for the filter chips, which
 * run client-side); live mode calls GET /volunteering?cause=&commit= and adapts
 * each card to the same `VolunteerOpportunity` view-model.
 *
 * `cause` is lowercase on the wire; the page Title-cases it for display. In demo
 * mode the params are ignored — the page's own chips do the client-side split.
 */
export function useOpportunities(
  params: { cause?: Cause; commit?: Commit; page?: number } = {},
) {
  const { demoMode } = useDemoMode();
  return useQuery<OpportunitiesResult>({
    queryKey: ["opportunities", demoMode, params],
    queryFn: async () => {
      if (demoMode) {
        return {
          items: VOLUNTEER_OPPORTUNITIES,
          total: VOLUNTEER_OPPORTUNITIES.length,
        };
      }
      const res = await getOpportunities(params);
      return { items: res.items.map(cardToOpportunity), total: res.total };
    },
  });
}
