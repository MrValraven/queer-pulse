import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import type { Community } from "../homepage/data/types";
import { getLiving } from "./livingCommunities.data";
import { JoinModal } from "./JoinModal";
import type { JoinCommunityPayload } from "./api/communityJoin.api";
import { useJoinCommunityWithRules } from "./api/useCommunityJoin";

/**
 * The join wizard as mounted from a community CARD (the discover grid and the
 * "similar communities" strip both open it the same way). The detail page has
 * its own mount, since it can pass the richer detail copy.
 *
 * Two things live here rather than in each page: the access tier the modal
 * opens on, and what "join" actually does. Demo mode drives the session
 * membership provider; live awaits `POST /communities/:slug/join` and hands
 * the outcome back to the modal, which is what lets it hold its welcome step
 * until the join has really happened.
 */
export function CommunityJoinFlowModal({
  community,
  onClose,
}: {
  community: Community;
  onClose: () => void;
}) {
  const { demoMode } = useDemoMode();
  const { join, requestToJoin } = useCommunityMembership();
  const joinMutation = useJoinCommunityWithRules(community.slug ?? "");

  // Live trusts the card's own DTO tier. The mock living registry is a demo
  // fixture and would otherwise describe a real community whose slug happens
  // to match one of the prototype's (an instant-join door on a space that
  // actually reviews requests, or the reverse).
  const tier =
    (demoMode ? getLiving(community.slug)?.accessTier : undefined) ??
    community.accessTier ??
    (community.privateBadge ? "private" : "public");

  // The payload now carries the applicant's own words, their involvement
  // answer as a real field, and the house-rules version they agreed to in the
  // wizard's rules step.
  const submit = async (isRequest: boolean, payload: JoinCommunityPayload) => {
    if (demoMode) {
      if (community.slug) {
        if (isRequest) requestToJoin(community.slug);
        else join(community.slug);
      }
      return;
    }
    await joinMutation.mutateAsync(payload);
  };

  return (
    <JoinModal
      community={{
        name: community.name,
        typeLabel: community.typeLabel,
        count: community.count,
        description: community.description,
        slug: community.slug,
      }}
      tier={tier}
      onClose={onClose}
      onJoined={(payload) => submit(false, payload)}
      onRequested={(payload) => submit(true, payload)}
    />
  );
}
