import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunities, type CommunitiesQuery } from "./communities.api";
import { cardDtoToCommunity } from "./communities.adapters";
import { communities } from "../../homepage/data/communities";
import type { Community } from "../../homepage/data/types";

export interface CommunitiesResult {
  items: Community[];
  total: number;
}

/**
 * Discover-grid source. Demo mode returns the page's own static `communities`
 * registry (full fidelity for the type chips + living-card stats); live mode
 * calls GET /communities?filter=… and adapts each card to the same view-model.
 *
 * The page's category chips still filter client-side, so demo behaviour is
 * byte-for-byte today's. Live mode hides private communities from non-members
 * (the API omits them from the list).
 */
export function useCommunities(params: CommunitiesQuery = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<CommunitiesResult>({
    queryKey: ["communities", demoMode, params],
    queryFn: async () => {
      if (demoMode) return { items: communities, total: communities.length };
      const res = await getCommunities(params);
      return { items: res.items.map(cardDtoToCommunity), total: res.total };
    },
  });
}
