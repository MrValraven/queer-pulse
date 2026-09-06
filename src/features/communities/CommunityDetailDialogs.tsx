import type { useCommunityDetailState } from "./useCommunityDetailState";
import { JoinModal } from "./JoinModal";
import { EditCommunityModal } from "./EditCommunityModal";
import { LeaveCommunityModal } from "./LeaveCommunityModal";
import { WithdrawJoinRequestModal } from "./WithdrawJoinRequestModal";
import { DeclineInviteModal } from "./DeclineInviteModal";

/** The resolved detail page's state, the only shape these dialogs are opened
 *  from. Derived from the hook rather than restated, so a field added there
 *  can never drift from what this reads. */
type ReadyState = Extract<
  ReturnType<typeof useCommunityDetailState>,
  { status: "ready" }
>;

/**
 * Every modal the community detail page can open, in one place: the join
 * wizard, the owner/mod edit form, and the three confirm steps that gate a
 * destructive answer (leaving, withdrawing a pending request, declining a
 * standing invitation).
 *
 * They live here rather than inline on the page for the ordinary reason: the
 * page is layout, and five conditionally-mounted dialogs pushed it past the
 * repo's 200-line component limit. Each one still portals to `document.body`
 * through the shared `Modal`/`ModalSheet`, so nothing about the scrim changes.
 */
export function CommunityDetailDialogs({ state }: { state: ReadyState }) {
  const {
    slug,
    community,
    detail,
    cardStats,
    editable,
    role,
    tier,
    isOwner,
    transferOwnershipHref,
    isInvited,
    onJoined,
    onRequested,
    performLeave,
    performWithdrawRequest,
    performDeclineInvite,
    leaveMutation,
    withdrawMutation,
    declineInviteMutation,
    joining,
    setJoining,
    editing,
    setEditing,
    confirmingLeave,
    setConfirmingLeave,
    confirmingWithdraw,
    setConfirmingWithdraw,
    decliningInvite,
    setDecliningInvite,
  } = state;

  return (
    <>
      {joining && (
        <JoinModal
          community={{
            name: community.name,
            typeLabel: detail.badge,
            count: community.count,
            description: community.description,
            tags: detail.tags,
            // Lets the wizard read this community's house rules + their
            // current version for the rules step.
            slug,
          }}
          tier={tier}
          isInvited={isInvited}
          onClose={() => setJoining(false)}
          onJoined={onJoined}
          onRequested={onRequested}
        />
      )}

      {editing && slug && editable && (
        <EditCommunityModal
          slug={slug}
          editable={editable}
          canChangeAccess={role === "owner"}
          previewStats={cardStats}
          onClose={() => setEditing(false)}
        />
      )}

      {confirmingLeave && (
        <LeaveCommunityModal
          name={community.name}
          isOwner={isOwner}
          transferOwnershipHref={transferOwnershipHref}
          pending={leaveMutation.isPending}
          onConfirm={performLeave}
          onClose={() => setConfirmingLeave(false)}
        />
      )}

      {confirmingWithdraw && (
        <WithdrawJoinRequestModal
          name={community.name}
          pending={withdrawMutation.isPending}
          onConfirm={performWithdrawRequest}
          onClose={() => setConfirmingWithdraw(false)}
        />
      )}

      {decliningInvite && (
        <DeclineInviteModal
          name={community.name}
          pending={declineInviteMutation.isPending}
          onConfirm={performDeclineInvite}
          onClose={() => setDecliningInvite(false)}
        />
      )}
    </>
  );
}
