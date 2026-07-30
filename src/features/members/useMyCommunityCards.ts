import { useMemo } from "react";
import { useMyCommunities } from "../communities/api/useMyCommunities";
import { useCommunities } from "../communities/api/useCommunities";
import type { FeaturedCommunityRef } from "./profileCommunities.types";

/**
 * The viewer's own communities that are eligible to feature on a profile:
 * every community they belong to EXCEPT private-tier ones. Joins the
 * authoritative membership map (slug → role) against the loaded community
 * registry for display metadata. A membership whose community is not loaded
 * (or is private) is skipped — a ref needs a name/tagline to render.
 */
/**
 * PERF (over-fetch fix): the caller passes `enabled` so this hook's two live
 * reads (`GET /me/communities`, `GET /communities`) only fire when their result
 * is actually consumed. On another member's profile the sole consumer
 * (`useProfileFeaturedCommunities`) never reads this list, so it passes
 * `enabled: false` and neither request goes out — previously both fired and were
 * discarded. When disabled the underlying queries stay idle, so `memberships`
 * and `items` resolve to their empty defaults and this returns `[]`. Defaults to
 * `true` for the editor consumer (`CommunitiesPickerSection`) that always needs
 * the list.
 */
export function useMyCommunityCards(
  enabled: boolean = true,
): FeaturedCommunityRef[] {
  /**
   * LIVE-MODE LIMITATION: the join set below (`items` from `useCommunities`)
   * is the paginated Discover community list, not a full registry — in this
   * editor context only page 1 is loaded (the Discover grid that would page
   * further isn't mounted here). So in live mode a membership whose
   * community lives beyond the loaded page(s) is silently skipped below
   * (`if (!community || community.privateBadge) continue;`): it won't be
   * offered in the community picker, nor will it resolve as a featured pin
   * on the profile, until the backend enriches GET /me/communities with
   * community metadata directly (or a dedicated endpoint is added). DEMO
   * mode is unaffected — its registry is exposed as a single synthetic
   * page. Do not "fix" this with a client-side pagination-draining loop;
   * the proper fix is backend-side and out of scope for this repo.
   */
  const memberships = useMyCommunities({ enabled });
  const { items } = useCommunities({}, { enabled });

  return useMemo(() => {
    const communityBySlug = new Map(
      items
        .filter((community) => community.slug)
        .map((community) => [community.slug as string, community]),
    );
    const communityCards: FeaturedCommunityRef[] = [];
    for (const [slug, membership] of Object.entries(memberships)) {
      const community = communityBySlug.get(slug);
      if (!community || community.privateBadge) continue;
      communityCards.push({
        slug,
        name: community.name,
        tagline: community.description,
        type: community.type,
        typeLabel: community.typeLabel,
        countLabel: community.count,
        role: membership.role,
      });
    }
    communityCards.sort((left, right) => left.name.localeCompare(right.name));
    return communityCards;
  }, [memberships, items]);
}
