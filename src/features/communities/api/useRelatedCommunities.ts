import { useCommunities } from "./useCommunities";
import type { Community } from "../../homepage/data/types";
import type { CommunityType } from "./communities.api";

/**
 * The "Related Communities" list shown in the detail sidebar: real communities
 * of the SAME type as the one being viewed. In demo mode `useCommunities`
 * returns the static registry (which already carries `type`); in live mode it
 * fetches `GET /communities?type=…`. Either way we then drop the current
 * community and any private ones and keep the first few.
 *
 * When no same-type peer exists the list is empty, and the sidebar hides the
 * card entirely rather than inventing communities that don't exist.
 */
export function useRelatedCommunities(
  currentSlug: string | undefined,
  type: CommunityType | undefined,
  limit = 3,
): Community[] {
  const { items } = useCommunities(
    type ? { type } : {},
    { enabled: Boolean(type) },
  );
  if (!type) return [];
  return items
    .filter(
      (community) =>
        community.type === type &&
        community.slug !== currentSlug &&
        !community.privateBadge,
    )
    .slice(0, limit);
}
