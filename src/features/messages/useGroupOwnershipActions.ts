import { useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { groupErrorMessage } from "./api/groupErrorMessages";
import type { TFunction } from "../../shared/i18n/types";
import type { Conversation, GroupMemberView } from "./data";
import {
  simulateDissolveGroup,
  simulateTransferOwnership,
} from "./groupOwnershipDemo";
import type {
  useCreateGroupInviteLink,
  useDisableGroupInviteLink,
  useDissolveGroup,
  useRevokeGroupInvite,
  useTransferGroupOwnership,
} from "./api/useGroupManagementMutations";

interface GroupOwnershipActionsDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  myProfile: { firstName: string; lastName: string; slug?: string } | undefined;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setLeftGroupIds: Dispatch<SetStateAction<Set<string>>>;
  /** The optimistic reason beside `setLeftGroupIds`; see
   *  `useMessagesController`'s own doc on `leftGroupReasons`. */
  setLeftGroupReasons: Dispatch<
    SetStateAction<Map<string, "left" | "removed" | "dissolved">>
  >;
  t: TFunction;
  transferOwnershipMutation: ReturnType<typeof useTransferGroupOwnership>;
  dissolveGroupMutation: ReturnType<typeof useDissolveGroup>;
  createInviteLinkMutation: ReturnType<typeof useCreateGroupInviteLink>;
  disableInviteLinkMutation: ReturnType<typeof useDisableGroupInviteLink>;
  revokeInviteMutation: ReturnType<typeof useRevokeGroupInvite>;
}

export interface GroupOwnershipActions {
  /** DES-228: the owner hands ownership to another member. */
  transferGroupOwnership: (
    conversationId: string,
    member: GroupMemberView,
  ) => void;
  transferOwnershipPending: boolean;
  /** PRD-357: the owner ends the group for everyone. */
  dissolveGroupThread: (conversationId: string) => void;
  dissolvePending: boolean;
  /** PRD-358: create (or rotate) the group's revocable invite link. */
  createGroupInviteLink: (conversationId: string) => void;
  disableGroupInviteLink: (conversationId: string) => void;
  inviteLinkPending: boolean;
  revokeGroupInvite: (conversationId: string, inviteId: string) => void;
  /** The pending invite currently being revoked, or null, keyed by invite
   *  id (like `busyInviteId` in `useGroupInviteRequestActions`) so revoking
   *  one row never disables every other pending invite's own Revoke button. */
  busyInviteId: string | null;
}

/**
 * Messaging-scan section 8: ownership transfer (DES-228), dissolve (PRD-357),
 * and the invite-link lifecycle (PRD-358): the half of group management
 * `useMessageGroupActions.ts` doesn't own, kept in its own colocated file for
 * the same ~200-line reason `useGroupManagementMutations.ts` split its own
 * mutation hooks across two files. Same demo/live shape as its sibling: demo
 * simulates the change locally (`groupOwnershipDemo.ts`'s pure helpers,
 * including the system pill); live calls the API (server re-checks the
 * caller's role/standing on every one) and patches the returned
 * `Conversation` into `extraThreads`.
 */
export function useGroupOwnershipActions({
  demoMode,
  allThreads,
  myProfile,
  setExtraThreads,
  setLeftGroupIds,
  setLeftGroupReasons,
  t,
  transferOwnershipMutation,
  dissolveGroupMutation,
  createInviteLinkMutation,
  disableInviteLinkMutation,
  revokeInviteMutation,
}: GroupOwnershipActionsDeps): GroupOwnershipActions {
  const { showToast } = useToast();
  const genericErrorFallback = t("messages:group.error.generic");
  const onGroupMutationError = (error: unknown) =>
    showToast(groupErrorMessage(error, t, genericErrorFallback), "error");
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);

  const myDisplayName = myProfile
    ? `${myProfile.firstName} ${myProfile.lastName}`.trim()
    : t("messages:conversation.you");

  function patchGroupThread(updated: Conversation) {
    setExtraThreads((previous) => [
      updated,
      ...previous.filter((existing) => existing.id !== updated.id),
    ]);
  }

  function findGroup(conversationId: string): Conversation | undefined {
    return allThreads.find((thread) => thread.id === conversationId);
  }

  function transferGroupOwnership(
    conversationId: string,
    member: GroupMemberView,
  ) {
    const group = findGroup(conversationId);
    if (!group) return;
    if (demoMode) {
      patchGroupThread(simulateTransferOwnership(group, member, myDisplayName));
      return;
    }
    if (!member.id) return;
    transferOwnershipMutation.mutate(
      { conversationId, userId: member.id },
      {
        onSuccess: (updated) => updated && patchGroupThread(updated),
        onError: onGroupMutationError,
      },
    );
  }

  /** PRD-357: the owner ends the group for everyone. Also marks the thread
   *  left optimistically (`setLeftGroupIds`), mirroring `leaveGroupThread`'s
   *  own optimistic severance, so the composer/footer sever the instant this
   *  fires rather than waiting on the mutation or the demo patch. */
  function dissolveGroupThread(conversationId: string) {
    const group = findGroup(conversationId);
    if (!group) return;
    setLeftGroupIds((previous) => new Set(previous).add(conversationId));
    setLeftGroupReasons((previous) =>
      new Map(previous).set(conversationId, "dissolved"),
    );
    if (demoMode) {
      patchGroupThread(simulateDissolveGroup(group, myDisplayName));
      return;
    }
    dissolveGroupMutation.mutate(conversationId, {
      onSuccess: (updated) => updated && patchGroupThread(updated),
      onError: onGroupMutationError,
    });
  }

  /** Create OR rotate the group's revocable invite link (same endpoint
   *  either way per the REST contract: `POST :id/invite-link`). */
  function createGroupInviteLink(conversationId: string) {
    const group = findGroup(conversationId);
    if (!group) return;
    if (demoMode) {
      const token = `demo-invite-${Math.random().toString(36).slice(2, 10)}`;
      patchGroupThread({ ...group, inviteToken: token });
      return;
    }
    createInviteLinkMutation.mutate(conversationId, {
      onError: onGroupMutationError,
    });
  }

  function disableGroupInviteLink(conversationId: string) {
    const group = findGroup(conversationId);
    if (!group) return;
    if (demoMode) {
      patchGroupThread({ ...group, inviteToken: null });
      return;
    }
    disableInviteLinkMutation.mutate(conversationId, {
      onError: onGroupMutationError,
    });
  }

  /** PRD-353/PRD-358: the owner/admin revokes a still-pending invite. Tracks
   *  `busyInviteId` (not a blanket pending flag) so revoking one row's invite
   *  never disables every OTHER pending invite's own Revoke button. */
  function revokeGroupInvite(conversationId: string, inviteId: string) {
    const group = findGroup(conversationId);
    if (!group) return;
    setBusyInviteId(inviteId);
    if (demoMode) {
      const nextPendingInvites = (group.pendingInvites ?? []).filter(
        (invite) => invite.id !== inviteId,
      );
      patchGroupThread({ ...group, pendingInvites: nextPendingInvites });
      setBusyInviteId(null);
      return;
    }
    revokeInviteMutation.mutate(
      { conversationId, inviteId },
      {
        onError: onGroupMutationError,
        onSettled: () => setBusyInviteId(null),
      },
    );
  }

  return {
    transferGroupOwnership,
    transferOwnershipPending: transferOwnershipMutation.isPending,
    dissolveGroupThread,
    dissolvePending: dissolveGroupMutation.isPending,
    createGroupInviteLink,
    disableGroupInviteLink,
    inviteLinkPending:
      createInviteLinkMutation.isPending || disableInviteLinkMutation.isPending,
    revokeGroupInvite,
    busyInviteId,
  };
}
