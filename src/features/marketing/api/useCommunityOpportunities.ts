import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunityOpportunities } from "./volunteering.api";
import { opportunityKeys } from "./opportunityKeys";
import { cardToOpportunity } from "./volunteering.adapters";
import type { VolunteerOpportunity } from "../volunteerOpportunities";

export interface CommunityOpportunitiesResult {
  /** The newest open opportunities attributed to the community. */
  opportunities: VolunteerOpportunity[];
  /** Every open opportunity the community has, which can exceed
   *  `opportunities.length` when the server caps the page. */
  total: number;
  isLoading: boolean;
  /** Branch on this before an empty list: an outage shown as "no open
   *  opportunities" tells people nobody needs a hand. */
  isError: boolean;
  /** True while any request is in flight, a retry after an error included,
   *  so a retry button can show that it is working. */
  isFetching: boolean;
  refetch: () => void;
}

interface CommunityOpportunitiesVM {
  opportunities: VolunteerOpportunity[];
  total: number;
}

/** Reads a mock "18 / 24" spots string and reports the opportunity full
 *  once the filled count reaches a positive total. A string without that
 *  pattern counts as open. */
function isMockOpportunityFull(opportunity: VolunteerOpportunity): boolean {
  const match = /(\d+)\s*\/\s*(\d+)/.exec(opportunity.spotsFilled);
  if (!match) return false;
  const spotsTotal = Number(match[2]);
  return spotsTotal > 0 && Number(match[1]) >= spotsTotal;
}

/**
 * One community's open volunteer opportunities, for its Volunteering tab.
 *
 * Live mode calls GET /communities/:slug/volunteering, which answers only the
 * open, unfilled, unmoderated ones, newest first, with the full `total`.
 *
 * Demo mode reads the shared `VOLUNTEER_OPPORTUNITIES` registry (the same one
 * the board and the detail page read, so all three agree) and keeps the ones
 * attributed to this community that still have a spot. The mock view model
 * carries no closed status, so every mock entry counts as open.
 */
export function useCommunityOpportunities(
  slug: string,
  options: { enabled: boolean },
): CommunityOpportunitiesResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<CommunityOpportunitiesVM>({
    queryKey: opportunityKeys.community(slug, demoMode),
    enabled: options.enabled && Boolean(slug),
    queryFn: async () => {
      if (demoMode) {
        const { VOLUNTEER_OPPORTUNITIES } =
          await import("../volunteerOpportunities");
        const opportunities = VOLUNTEER_OPPORTUNITIES.filter(
          (opportunity) =>
            opportunity.community?.slug === slug &&
            !isMockOpportunityFull(opportunity),
        );
        return { opportunities, total: opportunities.length };
      }
      const response = await getCommunityOpportunities(slug);
      return {
        opportunities: response.items.map(cardToOpportunity),
        total: response.total,
      };
    },
  });

  return {
    opportunities: query.data?.opportunities ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: () => void query.refetch(),
  };
}
