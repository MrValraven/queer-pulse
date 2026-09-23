import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SpaceCardModel } from "../community.model";
import { DEMO_SPACES_BY_PARENT } from "../spaces.data";
import { spaceCardDtoToModel } from "./communities.adapters";
import { getSubcommunities } from "./communities.api";

/** One shared empty list, so a consumer memoising on `spaces` stays stable
 *  while the query has no data. */
const NO_SPACES: SpaceCardModel[] = [];

export interface SubcommunitiesResult {
  spaces: SpaceCardModel[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * The spaces (subcommunities) under `slug`, as discover-grid cards. Demo reads
 * the spaces fixtures; live calls `GET /communities/:slug/subcommunities`,
 * whose cards carry the viewer's effective role as `myRole` and their own
 * roster row as `isMember`. Demo reads `isMember` off the session membership
 * store, so a space joined this session shows as joined.
 *
 * `language` closes the key because the card adapter resolves catalog copy
 * (member counts, the join label), the same reason `useCommunity` keys on it.
 * Invalidating the `["subcommunities"]` prefix still reaches every entry.
 */
export function useSubcommunities(
  slug: string | undefined,
  options: { enabled: boolean },
): SubcommunitiesResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const { isMember } = useCommunityMembership();
  const query = useQuery({
    queryKey: ["subcommunities", demoMode, slug, language],
    enabled: options.enabled && Boolean(slug),
    queryFn: async (): Promise<SpaceCardModel[]> => {
      if (!slug) return [];
      if (demoMode) return [...(DEMO_SPACES_BY_PARENT[slug] ?? [])];
      const response = await getSubcommunities(slug);
      return response.items.map((card) => spaceCardDtoToModel(card, t));
    },
  });
  const loadedSpaces = query.data ?? NO_SPACES;
  const spaces = useMemo(
    () =>
      demoMode
        ? loadedSpaces.map((space) => ({
            ...space,
            isMember: space.slug ? isMember(space.slug) : space.isMember,
          }))
        : loadedSpaces,
    [demoMode, loadedSpaces, isMember],
  );
  return {
    spaces,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
