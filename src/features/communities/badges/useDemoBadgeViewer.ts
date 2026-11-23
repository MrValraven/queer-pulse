import { useCallback } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { currentUserSlug } from "../../members/data/members";
import {
  isDemoSpaceSlug,
  type CommunityBadgesDemoViewer,
} from "./communityBadgesDemoStore";

/**
 * Turns the demo session into the viewer the demo badge store answers for: the
 * signed-in demo member, their seat in the community, and whether the
 * community is a space. Returned as a function of the slug, so one hook call
 * serves a query or a mutation that learns its slug late.
 */
export function useDemoBadgeViewerResolver(): (
  slug: string,
) => CommunityBadgesDemoViewer {
  const { user } = useAuth();
  const { roleIn, isMember } = useCommunityMembership();
  const viewerSlug = user?.profile.slug ?? currentUserSlug;
  return useCallback(
    (slug: string) => ({
      viewerSlug,
      role: roleIn(slug),
      isMember: isMember(slug),
      isSpace: isDemoSpaceSlug(slug),
    }),
    [viewerSlug, roleIn, isMember],
  );
}
