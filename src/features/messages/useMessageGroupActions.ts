import { type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { Conversation, GroupMemberView } from "./data";
import type { GroupMemberPick } from "./NewGroupModal";
import { withDemoSystemPill } from "./useMessagesController.helpers";
import type {
  useAddGroupMembers,
  useChangeGroupMemberRole,
  useLeaveGroup,
  useRemoveGroupMember,
  useUpdateGroup,
} from "./api/useMessageMutations";

interface GroupActionsDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  /** The signed-in member's profile, for the demo-simulated system-pill actor. */
  myProfile: { firstName: string; lastName: string; slug?: string } | undefined;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setLeftGroupIds: Dispatch<SetStateAction<Set<string>>>;
  t: TFunction;
  leaveGroupMutation: ReturnType<typeof useLeaveGroup>;
  addMembersMutation: ReturnType<typeof useAddGroupMembers>;
  removeMemberMutation: ReturnType<typeof useRemoveGroupMember>;
  changeRoleMutation: ReturnType<typeof useChangeGroupMemberRole>;
  updateGroupMutation: ReturnType<typeof useUpdateGroup>;
}

export interface GroupActions {
  leaveGroupThread: (conversationId: string) => void;
  leavePending: boolean;
  addGroupMembers: (conversationId: string, picks: GroupMemberPick[]) => void;
  removeGroupMember: (conversationId: string, member: GroupMemberView) => void;
  changeGroupMemberRole: (
    conversationId: string,
    member: GroupMemberView,
    role: "admin" | "member",
  ) => void;
  updateGroupInfo: (
    conversationId: string,
    changes: { title?: string; avatarUrl?: string },
  ) => void;
  groupManaging: boolean;
}

/**
 * Group management (feature #17 Phase 2): leave, add/remove members, change a
 * member's role, edit group info. Live: the mutation calls the API (the server
 * re-checks the caller's role on EVERY one — the can-flags are only a UI hint)
 * and returns the updated group view, patched straight into `extraThreads` so it
 * wins the `allThreads` dedupe ahead of the refetch. Demo: the same change is
 * simulated locally on the mock group (no network), including the system pill.
 * Extracted from `useMessagesController`; behaviour is unchanged.
 */
export function useMessageGroupActions({
  demoMode,
  allThreads,
  myProfile,
  setExtraThreads,
  setLeftGroupIds,
  t,
  leaveGroupMutation,
  addMembersMutation,
  removeMemberMutation,
  changeRoleMutation,
  updateGroupMutation,
}: GroupActionsDeps): GroupActions {
  /** The signed-in member's display name, for demo-simulated system pills where
   *  the current user is always the actor (owner of the demo group). */
  const myDisplayName = myProfile
    ? `${myProfile.firstName} ${myProfile.lastName}`.trim()
    : t("messages:conversation.you");

  /** The signed-in member leaves a group. Optimistically marks it left (composer
   *  severs immediately); live also POSTs /conversations/:id/leave. */
  function leaveGroupThread(conversationId: string) {
    setLeftGroupIds((previous) => new Set(previous).add(conversationId));
    if (!demoMode) leaveGroupMutation.mutate(conversationId);
  }

  /** Overlay an updated group view onto the thread list (extraThreads wins the
   *  allThreads dedupe, so this patches a base OR extra group in place). */
  function patchGroupThread(updated: Conversation) {
    setExtraThreads((previous) => [
      updated,
      ...previous.filter((existing) => existing.id !== updated.id),
    ]);
  }

  function addGroupMembers(conversationId: string, picks: GroupMemberPick[]) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group || picks.length === 0) return;
    if (demoMode) {
      const existingSlugs = new Set(
        (group.members ?? []).map((member) => member.slug),
      );
      const additions: GroupMemberView[] = picks
        .filter((pick) => !existingSlugs.has(pick.slug))
        .map((pick) => ({
          name: pick.name,
          initials: pick.initials,
          tint: pick.tint,
          role: "member" as const,
          slug: pick.slug,
        }));
      if (additions.length === 0) return;
      const nextMembers = [...(group.members ?? []), ...additions];
      let next: Conversation = {
        ...group,
        members: nextMembers,
        memberCount: nextMembers.length,
      };
      for (const added of additions) {
        next = withDemoSystemPill(next, {
          type: "member_added",
          actorName: myDisplayName,
          targetName: added.name,
          actorIsMe: true,
        });
      }
      patchGroupThread(next);
      return;
    }
    addMembersMutation.mutate(
      { conversationId, memberHandles: picks.map((pick) => pick.slug) },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  function removeGroupMember(conversationId: string, member: GroupMemberView) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group) return;
    if (demoMode) {
      const nextMembers = (group.members ?? []).filter(
        (candidate) => candidate.slug !== member.slug,
      );
      const next = withDemoSystemPill(
        { ...group, members: nextMembers, memberCount: nextMembers.length },
        {
          type: "member_removed",
          actorName: myDisplayName,
          targetName: member.name,
          actorIsMe: true,
        },
      );
      patchGroupThread(next);
      return;
    }
    if (!member.id) return;
    removeMemberMutation.mutate(
      { conversationId, userId: member.id },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  function changeGroupMemberRole(
    conversationId: string,
    member: GroupMemberView,
    role: "admin" | "member",
  ) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group) return;
    if (demoMode) {
      const nextMembers = (group.members ?? []).map((candidate) =>
        candidate.slug === member.slug ? { ...candidate, role } : candidate,
      );
      patchGroupThread({ ...group, members: nextMembers });
      return;
    }
    if (!member.id) return;
    changeRoleMutation.mutate(
      { conversationId, userId: member.id, role },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  function updateGroupInfo(
    conversationId: string,
    changes: { title?: string; avatarUrl?: string },
  ) {
    const group = allThreads.find((thread) => thread.id === conversationId);
    if (!group) return;
    if (demoMode) {
      const trimmedTitle = changes.title?.trim();
      const renamed = !!trimmedTitle && trimmedTitle !== group.name;
      let next: Conversation = {
        ...group,
        name: trimmedTitle || group.name,
        avatarUrl: changes.avatarUrl ?? group.avatarUrl,
      };
      if (renamed) {
        next = withDemoSystemPill(next, {
          type: "group_renamed",
          actorName: myDisplayName,
          value: trimmedTitle,
          actorIsMe: true,
        });
      }
      patchGroupThread(next);
      return;
    }
    updateGroupMutation.mutate(
      { conversationId, ...changes },
      { onSuccess: (updated) => updated && patchGroupThread(updated) },
    );
  }

  return {
    leaveGroupThread,
    leavePending: leaveGroupMutation.isPending,
    addGroupMembers,
    removeGroupMember,
    changeGroupMemberRole,
    updateGroupInfo,
    groupManaging:
      addMembersMutation.isPending ||
      removeMemberMutation.isPending ||
      changeRoleMutation.isPending ||
      updateGroupMutation.isPending,
  };
}
