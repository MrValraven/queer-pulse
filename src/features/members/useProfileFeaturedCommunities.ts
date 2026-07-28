import { useMemo } from "react";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useMyCommunityCards } from "./useMyCommunityCards";
import type { FeaturedCommunityRef } from "./profileCommunities.types";
import type { Member } from "./data/members";

const VALID_COMMUNITY_ROLES = new Set(["owner", "mod", "member"]);

/** True when a ref carries a usable role and slug — belt-and-suspenders
 *  defensive check for the public path, whose refs already came pre-vetted
 *  (non-private) from the resolved `Member.featuredCommunities` DTO. */
function isRenderableFeaturedCommunityRef(
  communityRef: FeaturedCommunityRef,
): boolean {
  return (
    typeof communityRef.slug === "string" &&
    communityRef.slug.length > 0 &&
    VALID_COMMUNITY_ROLES.has(communityRef.role)
  );
}

/**
 * The featured communities to render on a profile.
 * - Self: resolved LIVE from the editable draft slugs, so pins added in the
 *   editor appear before save. Non-private only (the eligible source already
 *   excludes private), unknown slugs dropped.
 * - Other member: the resolved refs the public DTO already vetted (never
 *   private), defensively re-filtered here.
 */
export function useProfileFeaturedCommunities({
  isSelf,
  otherMember,
}: {
  isSelf: boolean;
  otherMember: Member | null;
}): FeaturedCommunityRef[] {
  const { draft } = useProfile();
  const eligibleCommunityCards = useMyCommunityCards();

  return useMemo(() => {
    if (!isSelf) {
      return (otherMember?.featuredCommunities ?? []).filter(
        isRenderableFeaturedCommunityRef,
      );
    }
    const eligibleCommunityCardBySlug = new Map(
      eligibleCommunityCards.map((communityRef) => [
        communityRef.slug,
        communityRef,
      ]),
    );
    const resolvedFeaturedCommunities: FeaturedCommunityRef[] = [];
    for (const slug of draft.featuredCommunities) {
      const communityRef = eligibleCommunityCardBySlug.get(slug);
      if (communityRef) resolvedFeaturedCommunities.push(communityRef);
    }
    return resolvedFeaturedCommunities;
  }, [isSelf, otherMember, eligibleCommunityCards, draft.featuredCommunities]);
}
