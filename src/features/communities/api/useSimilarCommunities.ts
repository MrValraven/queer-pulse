import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Community } from "../../homepage/data/types";
import { cardDtoToCommunity } from "./communities.adapters";
import { getRelatedCommunities } from "./communities.api";

export interface UseSimilarCommunitiesResult {
  communities: Community[];
  isLoading: boolean;
}

/**
 * Up to 4 communities ranked by shared curated-tag overlap with the one
 * being viewed (`GET /communities/:slug/related`) — the "Similar
 * communities" section on the detail page. Distinct from the sidebar's own
 * `useRelatedCommunities` (a same-`type` client-side filter that already
 * works in demo mode): this ranking is server-computed from the real curated
 * tag vocabulary, which the demo fixture has no equivalent for, so — like
 * `useCommunityPulse`'s threads/opportunities — it always resolves empty in
 * demo mode and the section simply doesn't render there.
 *
 * A plain `useQuery` (not gating the page's own loading state): the caller
 * renders its own section only once this settles, so the community detail
 * page's primary content never waits on it.
 */
export function useSimilarCommunities(
  slug: string | undefined,
): UseSimilarCommunitiesResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["community-related", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getRelatedCommunities(slug!),
  });

  if (demoMode || !query.data) {
    return { communities: [], isLoading: !demoMode && query.isLoading };
  }
  // Mapped outside `queryFn`, so a language switch re-renders the labels
  // straight off the cached DTOs with no refetch.
  return {
    communities: query.data.map((card) => cardDtoToCommunity(card, t)),
    isLoading: false,
  };
}
