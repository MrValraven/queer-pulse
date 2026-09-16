import { GroupInfoModal } from "./GroupInfoModal";
import { GroupSeenBySheet } from "./GroupSeenBySheet";
import type { GroupMemberPick } from "./NewGroupModal";
import type { SeenByEntry } from "./groupReceipts";
import type { Conversation, GroupMemberView } from "./data";

export interface ConversationGroupModalsProps {
  active: Conversation;
  /** Whether the group-info / management view is open. */
  groupInfoOpen: boolean;
  /** Whether the "Seen by" sheet is open. */
  seenBySheetOpen: boolean;
  onCloseGroupInfo: () => void;
  onCloseSeenBy: () => void;
  /** The signed-in member's user id — excludes self from "Seen by N". */
  myUserId?: string | null;
  /** "Seen by N" entries for the caller's latest group message. */
  groupSeenBy: SeenByEntry[];
  /** The signed-in member leaves the group. */
  onLeaveGroup?: (conversationId: string) => void;
  /** True while a leave is in flight. */
  leavePending?: boolean;
  /** GROUP management — add/remove/promote/demote members + edit title/avatar. */
  onAddGroupMembers?: (
    conversationId: string,
    picks: GroupMemberPick[],
  ) => void;
  onRemoveGroupMember?: (
    conversationId: string,
    member: GroupMemberView,
  ) => void;
  onChangeGroupMemberRole?: (
    conversationId: string,
    member: GroupMemberView,
    role: "admin" | "member",
  ) => void;
  onUpdateGroupInfo?: (
    conversationId: string,
    changes: { title?: string; avatarUrl?: string; description?: string },
  ) => void;
  /** True while any group-management mutation is in flight. */
  groupManaging?: boolean;
  /** Opens the "Media, links and docs" sheet over the group info (PRD-373). */
  onOpenMediaGallery?: (trigger?: HTMLElement | null) => void;
  /** DES-228: the owner hands ownership to another member. */
  onTransferGroupOwnership?: (
    conversationId: string,
    member: GroupMemberView,
  ) => void;
  transferOwnershipPending?: boolean;
  /** PRD-357: the owner ends the group for everyone. */
  onDissolveGroup?: (conversationId: string) => void;
  dissolvePending?: boolean;
  /** PRD-358: create/rotate/disable the group's revocable invite link. */
  onCreateGroupInviteLink?: (conversationId: string) => void;
  onDisableGroupInviteLink?: (conversationId: string) => void;
  inviteLinkPending?: boolean;
  onRevokeGroupInvite?: (conversationId: string, inviteId: string) => void;
  /** The pending invite currently being revoked, or null; see
   *  `GroupInviteLinkSection`'s own doc. */
  busyInviteId?: string | null;
}

/** The two GROUP-only overlays a conversation can open — the group-info /
 *  management modal and the "Seen by" sheet. Their open state lives in
 *  `ConversationPanel` (the header + message area trigger them); this component
 *  only renders whichever is open and wires the callbacks to `active.id`. */
export function ConversationGroupModals({
  active,
  groupInfoOpen,
  seenBySheetOpen,
  onCloseGroupInfo,
  onCloseSeenBy,
  myUserId,
  groupSeenBy,
  onLeaveGroup,
  leavePending = false,
  onAddGroupMembers,
  onRemoveGroupMember,
  onChangeGroupMemberRole,
  onUpdateGroupInfo,
  groupManaging = false,
  onOpenMediaGallery,
  onTransferGroupOwnership,
  transferOwnershipPending = false,
  onDissolveGroup,
  dissolvePending = false,
  onCreateGroupInviteLink,
  onDisableGroupInviteLink,
  inviteLinkPending = false,
  onRevokeGroupInvite,
  busyInviteId = null,
}: ConversationGroupModalsProps) {
  if (!active.isGroup) return null;
  return (
    <>
      {groupInfoOpen && (
        <GroupInfoModal
          active={active}
          myUserId={myUserId ?? null}
          onClose={onCloseGroupInfo}
          onLeave={() => {
            onLeaveGroup?.(active.id);
            onCloseGroupInfo();
          }}
          leaving={leavePending}
          managing={groupManaging}
          onAddMembers={(picks) => onAddGroupMembers?.(active.id, picks)}
          onRemoveMember={(member) => onRemoveGroupMember?.(active.id, member)}
          onChangeMemberRole={(member, role) =>
            onChangeGroupMemberRole?.(active.id, member, role)
          }
          onUpdateInfo={(changes) => onUpdateGroupInfo?.(active.id, changes)}
          onOpenMediaGallery={onOpenMediaGallery}
          onTransferOwnership={(member) =>
            onTransferGroupOwnership?.(active.id, member)
          }
          transferPending={transferOwnershipPending}
          onDissolve={() => {
            onDissolveGroup?.(active.id);
            onCloseGroupInfo();
          }}
          dissolvePending={dissolvePending}
          onCreateInviteLink={() => onCreateGroupInviteLink?.(active.id)}
          onResetInviteLink={() => onCreateGroupInviteLink?.(active.id)}
          onDisableInviteLink={() => onDisableGroupInviteLink?.(active.id)}
          inviteLinkPending={inviteLinkPending}
          onRevokeInvite={(inviteId) =>
            onRevokeGroupInvite?.(active.id, inviteId)
          }
          busyInviteId={busyInviteId}
        />
      )}
      {seenBySheetOpen && (
        <GroupSeenBySheet entries={groupSeenBy} onClose={onCloseSeenBy} />
      )}
    </>
  );
}
