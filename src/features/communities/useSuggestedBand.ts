import { useMemo } from "react";
import type { Community } from "../homepage/data/types";
import { useSuggestedCommunities } from "./api/useSuggestedCommunities";

export interface SuggestedBand {
  communities: Community[];
  isShowingBand: boolean;
}

/**
 * The single source of truth for what the "Suggested for you" band shows.
 * `SuggestedCommunitiesSection` renders it and `CommunitiesGrid` drops the same
 * communities from the browse grid, so the band and the grid can never
 * disagree about which communities are suggested.
 *
 * `excludeSlug` is the featured community, which already sits directly above
 * the band. The filtered list is memoised so its identity only changes when
 * the suggestions or the featured slug do.
 */
export function useSuggestedBand(excludeSlug?: string): SuggestedBand {
  const { communities, isLoading } = useSuggestedCommunities();

  const shownCommunities = useMemo(
    () =>
      excludeSlug
        ? communities.filter((community) => community.slug !== excludeSlug)
        : communities,
    [communities, excludeSlug],
  );

  return {
    communities: shownCommunities,
    isShowingBand: !isLoading && shownCommunities.length > 0,
  };
}
