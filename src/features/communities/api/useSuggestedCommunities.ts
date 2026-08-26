import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useConnections } from "../../../app/providers/useConnections";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Community } from "../../homepage/data/types";
import { demoSuggestedCommunities } from "../suggestedCommunities.demo";
import { cardDtoToCommunity } from "./communities.adapters";
import { getSuggestedCommunities } from "./communities.api";

export interface UseSuggestedCommunitiesResult {
  communities: Community[];
  isLoading: boolean;
}

/** Stable empty list so a consumer never sees a new array identity per render. */
const EMPTY: Community[] = [];

/**
 * "Suggested for you": up to 6 communities the viewer has NOT joined where
 * people they are connected to already are, most-connected-in first
 * (`GET /communities/suggested`, see `CommunitiesService.suggestedCommunities`).
 *
 * The endpoint always answers with an array, never null, so this is a plain
 * `apiGet` rather than `apiGetNullable`. An empty array is the NORMAL answer
 * for a member with no connections, which is why the calling section renders
 * nothing at all rather than an empty state.
 *
 * Demo mode never touches the network: it computes the same ranking from the
 * fixtures the prototype already ships (`suggestedCommunities.demo.ts`), so
 * the band is demonstrable without a backend and can never leak demo people
 * into a live surface.
 *
 * Mapped outside `queryFn` (same as `useSimilarCommunities`), so a language
 * switch re-labels the cached DTOs with no refetch and `language` stays out of
 * the query key.
 */
export function useSuggestedCommunities(): UseSuggestedCommunitiesResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { isMember } = useCommunityMembership();
  const { connected } = useConnections();

  const query = useQuery({
    queryKey: ["communities", "suggested"],
    enabled: !demoMode,
    queryFn: getSuggestedCommunities,
  });

  const demoSuggestions = useMemo(
    () => (demoMode ? demoSuggestedCommunities(connected, isMember) : EMPTY),
    [demoMode, connected, isMember],
  );

  if (demoMode) {
    return { communities: demoSuggestions, isLoading: false };
  }
  if (!query.data) {
    return { communities: EMPTY, isLoading: query.isLoading };
  }
  return {
    communities: query.data.map((card) => cardDtoToCommunity(card, t)),
    isLoading: false,
  };
}
