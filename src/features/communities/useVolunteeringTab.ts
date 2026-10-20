import { useCommunityOpportunities } from "../marketing/api/useCommunityOpportunities";
import type { VolunteerOpportunity } from "../marketing/volunteerOpportunities";
import type { LivingCommunity } from "./community.model";

/** One shared empty list, so a tab the viewer may not read hands its
 *  renderer the same reference on every render. */
const NO_OPPORTUNITIES: VolunteerOpportunity[] = [];

export interface VolunteeringTabOptions {
  living: LivingCommunity;
  /** Whether the viewer is on this community's roster. */
  isMember: boolean;
  /** Whether the viewer owns, co-owns or moderates this community. */
  isStaff: boolean;
  /** True when the URL asks for this tab (`?tab=volunteering`). */
  isRequestedTab: boolean;
}

/**
 * Everything the community page needs to offer its Volunteering tab: whether
 * the tab shows, its count and the open opportunities it lists.
 *
 * - A space (subcommunity) never offers the tab, and fetches nothing.
 * - A roster member reads the board, and so does a signed-in visitor of a
 *   `public`-tier community. A gated-tier visitor already gets the gate card,
 *   and the backend answers them 404, so the query stays off for them.
 * - Members and visitors see the tab only once there is something to sign up
 *   for, so it stays hidden while loading and on error (no flash of an empty
 *   tab). Staff always see it, with the post call to action.
 * - A deep link to `?tab=volunteering` (the detail page's back link lands
 *   there) keeps the tab while the first load runs, so the page does not
 *   bounce to Pulse before the answer arrives.
 * - While the viewer may not read the board, the hook reports an empty,
 *   settled tab. A disabled query still hands back whatever it cached, and
 *   the key carries no viewer, so a member who leaves a gated community
 *   mid-session would otherwise keep seeing its opportunities.
 */
export function useVolunteeringTab({
  living,
  isMember,
  isStaff,
  isRequestedTab,
}: VolunteeringTabOptions) {
  const isSpace = Boolean(living.parent);
  const hasReadAccess = isMember || living.accessTier === "public";
  const shouldFetch = !isSpace && hasReadAccess;
  const query = useCommunityOpportunities(living.slug, {
    enabled: shouldFetch,
  });
  const opportunities = shouldFetch ? query.opportunities : NO_OPPORTUNITIES;
  const total = shouldFetch ? query.total : 0;
  const isLoading = shouldFetch && query.isLoading;
  const isError = shouldFetch && query.isError;
  const isFetching = shouldFetch && query.isFetching;
  const isVisible =
    !isSpace && (isStaff || total > 0 || (isRequestedTab && isLoading));

  return {
    isVisible,
    opportunities,
    total,
    isLoading,
    isError,
    isFetching,
    refetch: query.refetch,
  };
}

export type VolunteeringTabState = ReturnType<typeof useVolunteeringTab>;
