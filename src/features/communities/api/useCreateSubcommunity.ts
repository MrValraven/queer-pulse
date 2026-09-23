import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Community } from "../../homepage/data/types";
import { appendDemoSpace } from "../spaces.data";
import { useAllCommunities } from "../useAllCommunities";
import { cardDtoToCommunity } from "./communities.adapters";
import {
  createSubcommunity,
  type CommunityDetailDTO,
  type CreateSubcommunityBody,
} from "./communities.api";

/**
 * Build the detail a demo-founded space resolves with: the body the founder
 * sent, the parent as its ref, the founder as owner of an otherwise empty
 * roster. Nothing here reaches the network.
 */
function buildDemoSpaceDetail(
  body: CreateSubcommunityBody,
  parent: Community | undefined,
  parentSlug: string,
): CommunityDetailDTO {
  return {
    slug: body.handle,
    name: body.name,
    type: parent?.type ?? "social",
    tagline: body.tagline,
    accessTier: body.accessTier,
    ref: "QP-C-DEMO",
    memberCount: 1,
    activeThisWeek: 1,
    postsThisWeek: 0,
    myRole: "owner",
    coverImageUrl: body.coverImageUrl ?? null,
    avatarImageUrl: body.avatarImageUrl ?? null,
    tags: parent?.tags ?? [],
    purpose: body.purpose,
    whoFor: body.whoFor ?? "",
    rosterVisible: true,
    features: ["discussion", "events", "library", "roster"],
    rules: body.rules,
    owner: null,
    createdAt: new Date().toISOString(),
    myJoinRequestStatus: null,
    parent: {
      slug: parentSlug,
      name: parent?.name ?? parentSlug,
      avatarImageUrl: parent?.avatarImageUrl ?? null,
      isMember: true,
    },
    inheritedRules: null,
    allowsSubcommunities: false,
    subcommunityCount: 0,
    isRosterMember: true,
  };
}

/**
 * `POST /communities/:parentSlug/subcommunities`: found a space under
 * `parentSlug`. Resolves with the new space's detail DTO.
 *
 * Demo appends the space to the session's spaces fixtures, makes the founder
 * its owner in the membership store, and resolves with a built detail. Live
 * calls the API. Both invalidate the spaces lists and the parent's detail
 * (its `subcommunityCount` moved). The caller shows its own error, so the
 * global toast stays silent.
 */
export function useCreateSubcommunity(parentSlug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { createOwned } = useCommunityMembership();
  const allDemoCommunities = useAllCommunities();
  const { t } = useTranslation();
  return useMutation<CommunityDetailDTO, Error, CreateSubcommunityBody>({
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (!demoMode) return createSubcommunity(parentSlug, body);
      const parent = allDemoCommunities.find(
        (community) => community.slug === parentSlug,
      );
      const detail = buildDemoSpaceDetail(body, parent, parentSlug);
      appendDemoSpace(
        parentSlug,
        { ...cardDtoToCommunity(detail, t), isMember: true },
        detail.whoFor,
      );
      createOwned(detail.slug);
      return detail;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subcommunities"] });
      void queryClient.invalidateQueries({
        queryKey: ["community", parentSlug],
      });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}
