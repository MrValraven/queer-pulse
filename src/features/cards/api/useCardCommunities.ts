import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyCommunityCardPrograms } from "./cards.api";
import { DEMO_CARD_COMMUNITIES } from "../cards.data";

/** A community the member belongs to that issues membership cards. */
export interface CardIssuingCommunity {
  slug: string;
  name: string;
}

/**
 * The communities the member belongs to that actually run a live card
 * programme, for the wallet's empty state.
 *
 * One request. `hasCardProgram` rides along on `GET /me/communities` (see
 * `CommunitiesService.myCommunities`), so this replaces what would otherwise
 * be a `GET /communities/:slug/card` per community.
 *
 * `isError` is returned rather than swallowed: an empty list and a failed
 * fetch mean completely different things to a member, and the empty state
 * must not tell someone "none of your communities issue cards" on the
 * strength of a request that never landed.
 */
export function useCardCommunities(): {
  communities: CardIssuingCommunity[];
  isLoading: boolean;
  isError: boolean;
} {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    // Its own key rather than the communities feature's `["my-communities"]`:
    // that cache holds the membership map keyed by slug, a different shape
    // over the same endpoint, and sharing a key would have the two overwrite
    // each other.
    queryKey: ["card-communities", demoMode],
    enabled: !demoMode,
    queryFn: getMyCommunityCardPrograms,
  });

  const communities = useMemo(
    () =>
      (query.data ?? [])
        .filter((community) => community.hasCardProgram)
        .map(({ slug, name }) => ({ slug, name })),
    [query.data],
  );

  if (demoMode) {
    return {
      communities: DEMO_CARD_COMMUNITIES,
      isLoading: false,
      isError: false,
    };
  }
  return { communities, isLoading: query.isLoading, isError: query.isError };
}
