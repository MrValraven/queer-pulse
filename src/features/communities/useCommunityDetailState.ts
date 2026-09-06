import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Person } from "./communityDetails";
import { useCommunity } from "./api/useCommunity";
import { useRelatedCommunities } from "./api/useRelatedCommunities";
import { useRoster } from "./api/useRoster";
import { useCommunityPosts } from "./api/useCommunityPosts";
import { useCommunityDiscussions } from "./api/useCommunityDiscussions";
import { useCommunityPulse } from "./api/useCommunityPulse";
import { useCommunityUpcomingGatherings } from "./api/useCommunityUpcomingGatherings";
import { useMyCommunityInvites } from "./api/useCommunityInvites";
import { useCommunityDetailActions } from "./useCommunityDetailActions";

/**
 * All queries, membership state, derived values, and action handlers for the
 * community detail page. Extracted from `CommunityDetailPage` (now layout/JSX
 * only) so that component stays under the repo's 200-line-per-component limit.
 * This is a plain hook (returns no JSX), so the limit doesn't apply to it.
 *
 * Returns a discriminated status so the page renders the right frame:
 * `notFound` (redirect), `error` (retryable), `loading` (skeleton), or `ready`
 * with the fully-resolved, non-optional community view-model + handlers.
 */
export function useCommunityDetailState() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { demoMode } = useDemoMode();
  const { isMember, hasRequested, roleIn } = useCommunityMembership();
  const [joining, setJoining] = useState(false);
  const [editing, setEditing] = useState(false);

  const {
    community,
    detail,
    living: baseLiving,
    myRole,
    myJoinRequestStatus,
    invitedAt,
    editable,
    notFound,
    isLoading,
    isError,
    refetch,
  } = useCommunity(slug);
  const rosterResult = useRoster(slug);
  const roster = rosterResult.roster;
  const posts = useCommunityPosts(slug);
  const { threads, paging: discussionPaging } = useCommunityDiscussions(slug);
  const related = useRelatedCommunities(slug, community?.type);
  // `GET /communities/:slug/pulse` is roster-member-only (403 otherwise), so
  // it's only enabled once the viewer's own membership is known — computed
  // the same way `joined` is below, just ahead of that later derivation
  // (which needs `community`/`detail` to already be resolved, i.e. after the
  // early returns this hook call has to precede).
  const isRosterMember = demoMode
    ? slug
      ? isMember(slug)
      : false
    : myRole != null;
  const communityPulse = useCommunityPulse(slug, { enabled: isRosterMember });
  // PRD-145. The pulse's mirror image, and the two are never both live: a
  // roster member gets the full three-arm pulse (which includes this
  // community's members-only gatherings), and a prospective member gets the
  // narrow public-facing list instead. Without this the Events tab told every
  // non-member "No gatherings on the calendar yet" however full the calendar
  // was, because the pulse it read from was disabled for them. Demo mode calls
  // neither and keeps reading `baseLiving.events`.
  const nonMemberGatherings = useCommunityUpcomingGatherings(slug, {
    enabled: !isRosterMember,
  });
  // PRD-140. The detail DTO says THAT this viewer holds an invitation
  // (`invitedAt`); the id needed to decline it lives on `GET
  // /me/community-invites` and nowhere else, so that list is read here, and
  // only for a viewer the DTO already placed outside the roster with an
  // invitation waiting. Everybody else never fires it. It shares its cache
  // with the invitations shelf, so opening one warms the other.
  const hasStandingInvitation =
    !demoMode && myRole == null && invitedAt != null;
  const myInvites = useMyCommunityInvites({ enabled: hasStandingInvitation });
  // The invitation row for THIS community, when the shelf has arrived. Null
  // while it is still in flight, which is what keeps "Decline" from firing a
  // DELETE at an id that does not exist yet.
  const standingInviteId =
    myInvites.invites.find((invite) => invite.community.slug === slug)?.id ??
    null;
  // Every write this page can make, plus the confirm dialog each destructive
  // one sits behind. Called here, above the early returns below, because hook
  // order can never be conditional.
  const actions = useCommunityDetailActions({
    slug,
    community,
    standingInviteId,
  });

  if (notFound) return { status: "notFound" as const };
  // A non-404 failure must render a retryable error state, not an eternal
  // skeleton (P1-14). Demo mode never errors (no live query runs).
  if (isError) return { status: "error" as const, refetch };
  if (isLoading || !community || !detail) return { status: "loading" as const };

  // Compose the enriched hub: roster + posts arrive from their own endpoints
  // (in demo they equal `baseLiving`'s, keeping this byte-for-byte). Events
  // are the one field demo mode does NOT take from `communityPulse` — demo
  // keeps `baseLiving.events` (the `nextEventFromGathering`-mirrored mock),
  // exactly as before this endpoint existed.
  const living = baseLiving
    ? {
        ...baseLiving,
        roster,
        pinned: posts.pinned,
        pulse: posts.pulse,
        events: demoMode
          ? baseLiving.events
          : isRosterMember
            ? communityPulse.events
            : nonMemberGatherings.events,
      }
    : undefined;

  // The Events tab reads its loading/error/retry off the pulse result. For a
  // prospective member the gatherings come from the other endpoint, so those
  // three fields come from it too. `threads`/`opportunities` stay `[]` here
  // (the pulse query is disabled for them), which is what keeps the sidebar's
  // members-only cards off a non-member's page.
  const communityPulseForTabs =
    demoMode || isRosterMember
      ? communityPulse
      : {
          ...communityPulse,
          isLoading: nonMemberGatherings.isLoading,
          isError: nonMemberGatherings.isError,
          refetch: nonMemberGatherings.refetch,
        };

  // Discussion threads: real `community_post` data is the source of truth,
  // but non-flagship demo communities have no living/mock posts seeded, so
  // `useCommunityDiscussions` returns empty and the tab would show an
  // EmptyState where the synthetic thread used to render. In demo mode only,
  // fall back to the synthetic `detail.topicThread` when there are no real
  // threads. Live mode always uses the real threads — an empty state there
  // is intentional.
  const discussionThreads =
    demoMode && threads.length === 0 && detail.topicThread
      ? [detail.topicThread]
      : threads;

  // Membership CTA state: the session provider is the demo source of truth;
  // live mode reads the viewer's role/request straight off the detail DTO.
  const joined = demoMode ? (slug ? isMember(slug) : false) : myRole != null;
  const requested = demoMode
    ? slug
      ? hasRequested(slug)
      : false
    : myJoinRequestStatus === "pending";
  const role = demoMode ? (slug ? roleIn(slug) : null) : myRole;
  const canEdit = role === "owner" || role === "mod";
  // PRD-142. Only the single accountable owner is refused a self-removal by
  // the backend (`removeMember` throws "The owner cannot be removed"); a
  // co-owner may leave like anybody else, so this is an exact `"owner"` test
  // rather than `isOwnerRole`. Read off the DTO's `myRole` in live mode, never
  // `isMember()`, which is demo-only.
  const isOwner = role === "owner";
  // Transfer ownership lives in the mod console's danger pane, which is
  // addressed by `?tab=modtools&mod=danger`. Linking to it (rather than
  // reaching into `CommunityDangerZone`'s local modal state) is what lets the
  // owner-facing leave dialog hand them the only real exit there is.
  const transferOwnershipHref = `/community/${slug}?tab=modtools&mod=danger`;
  // PRD-140. A standing invitation only ever reaches a non-member, and only in
  // live mode. It replaces the join CTA with accept/decline, and for a
  // `private` community it is the only reason this page rendered at all.
  const isInvited = !demoMode && !joined && invitedAt != null;

  // Precedence: the enriched living data (flagship/live) → the community's own
  // join policy (created + live-card DTOs carry it) → the legacy `privateBadge`
  // heuristic. Skipping `community.accessTier` here is what made invite/request
  // communities show a public "Join" CTA, since `privateBadge` only knows
  // "private".
  const tier =
    living?.accessTier ??
    community.accessTier ??
    (community.privateBadge ? "private" : "public");
  const joinLabel =
    tier === "invite"
      ? t("communities:detail.join.invite")
      : tier === "public"
        ? t("communities:detail.join.public")
        : t("communities:detail.join.request");
  // PRD-141. The `invite` tier now refuses an uninvited caller outright
  // (`outcome: "invite_required"`), so offering them a join wizard would walk
  // them through three steps to a refusal. The hero says so up front instead.
  // Live only: the demo prototype has no invitation record, so its invite-tier
  // communities keep the join flow they have always had.
  const isInviteOnlyLocked =
    !demoMode && !joined && !requested && !isInvited && tier === "invite";

  const memberNum = parseInt(community.count, 10);
  const hasCount = !Number.isNaN(memberNum);
  // The real roster: live mode fetches it, flagship demo communities supply it,
  // and a just-founded community has only its founder — so fall back to the
  // organiser rather than fabricating a crowd that isn't there.
  const members: Person[] = roster.length > 0 ? roster : [detail.organiser];
  const heroAvatars = members.slice(0, 5);

  // The two card-footer numbers the edit modal's live preview needs. `living`
  // holds the authoritative count in live mode; `memberNum` is the demo
  // registry's parsed one, and neither exists for a community with no count.
  const cardStats = {
    memberCount: living?.stats.members ?? (hasCount ? memberNum : undefined),
    activeThisWeek: living?.stats.activeThisWeek ?? community.activeThisWeek,
  };

  return {
    status: "ready" as const,
    slug,
    community,
    cardStats,
    detail,
    editable,
    living,
    discussionThreads,
    joined,
    requested,
    role,
    canEdit,
    isOwner,
    transferOwnershipHref,
    isInvited,
    isInviteOnlyLocked,
    // Null while the invitations list is still in flight, so "Decline" waits
    // for it rather than firing at an id that does not exist yet.
    canDeclineInvite: standingInviteId != null,
    // PRD-148, live only: the demo membership store has no primitive for
    // taking a pending request back, so the prototype keeps its inert
    // "Requested" chip and behaves exactly as it did.
    canWithdrawRequest: !demoMode,
    tier,
    joinLabel,
    memberNum,
    hasCount,
    members,
    heroAvatars,
    // PRD-146. The community's own square identity mark, straight off the
    // detail DTO (`dtoToEditable` is the one mapper that keeps it; the card
    // mapper drops it, since the `Community` view-model has no such field).
    // "" for a community with no mark, in either mode, which is the hero's
    // signal to draw the generated initial instead.
    avatarImageUrl: editable?.avatarImageUrl ?? "",
    // `saved` / `onToggleSave` / `onShare` / `onJoined` / `onRequested` /
    // `performLeave` / `performWithdrawRequest` / `performDeclineInvite`, the
    // three mutations and the three confirm-dialog flags all ride in here.
    ...actions,
    posts,
    discussionPaging,
    rosterResult,
    related,
    communityPulse: communityPulseForTabs,
    nonMemberGatherings,
    joining,
    setJoining,
    editing,
    setEditing,
  };
}
