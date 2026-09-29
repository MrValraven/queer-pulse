import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { getLiving } from "./livingCommunities.data";
import { JoinModal } from "./JoinModal";
import type { AccessTier } from "./api/communities.api";
import {
  joinOutcomeOf,
  type JoinCommunityPayload,
} from "./api/communityJoin.api";
import { useJoinCommunityWithRules } from "./api/useCommunityJoin";

/**
 * The only fields the join wizard reads off a community. Narrower than
 * `Community` on purpose: the gate card is not a card DTO (it carries no
 * `ref`, no activity stats and no viewer role), and every existing caller
 * passes a `Community`, which satisfies this structurally.
 */
export interface JoinFlowCommunity {
  /** Optional because `Community.slug` (`shared/types/domain.ts`) is optional
   *  too. Every existing caller passes a `Community` as-is. */
  slug?: string;
  name: string;
  typeLabel: string;
  count: string;
  description: string;
  accessTier?: AccessTier;
  privateBadge?: boolean;
}

/**
 * The join wizard as mounted from a community CARD (the discover grid and the
 * "similar communities" strip both open it the same way). The detail page has
 * its own mount, since it can pass the richer detail copy.
 *
 * Two things live here, once for every page: the access tier the modal
 * opens on, and what "join" actually does. Demo mode drives the session
 * membership provider; live awaits `POST /communities/:slug/join` and hands
 * the outcome back to the modal, which is what lets it hold its welcome step
 * until the join has really happened.
 */
export function CommunityJoinFlowModal({
  community,
  parentName,
  parentSlug,
  isInvited = false,
  onClose,
  onMembershipGranted,
  onRequestFiled,
}: {
  community: JoinFlowCommunity;
  /** Set when `community` is a space: the parent's name, so the wizard's
   *  rules step notes the parent's rules the applicant already agreed to. */
  parentName?: string;
  /** The parent's slug when `community` is a space, so a "join the parent
   *  first" refusal can link to the parent. */
  parentSlug?: string;
  /** The viewer holds a standing invitation (PRD-140), so the wizard words
   *  itself as joining. The gate passes `hasStandingInvitation`. */
  isInvited?: boolean;
  onClose: () => void;
  /** Called once the viewer is on the roster: live when the server answers
   *  `joined`, demo after an instant join. The gate uses it to take the new
   *  member into the community when the wizard closes. */
  onMembershipGranted?: () => void;
  /** Called once a request is with the moderators: live when the server
   *  answers `requested` (a gated tier, or an open community holding the join
   *  for review), demo after a request. Onboarding uses it to show its card as
   *  requested once the wizard closes. */
  onRequestFiled?: () => void;
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
        if (isRequest) {
          requestToJoin(community.slug);
          onRequestFiled?.();
        } else {
          join(community.slug);
          onMembershipGranted?.();
        }
      }
      return null;
    }
    // Returned so the wizard reads the outcome. This used to be awaited and
    // dropped, so every card-mounted wizard (gate, grid, similar, suggested,
    // spaces) resolved to `undefined`: an uninvited `invite_required` read as
    // "You're in", and a join held for review as a welcome.
    const result = await joinMutation.mutateAsync(payload);
    const outcome = joinOutcomeOf(result);
    if (outcome === "joined") onMembershipGranted?.();
    if (outcome === "requested") onRequestFiled?.();
    return result;
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
      isInvited={isInvited}
      parentName={parentName}
      parentSlug={parentSlug}
      onClose={onClose}
      onJoined={(payload) => submit(false, payload)}
      onRequested={(payload) => submit(true, payload)}
    />
  );
}
