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
    changes: { title?: string; avatarUrl?: string },
  ) => void;
  /** True while any group-management mutation is in flight. */
  groupManaging?: boolean;
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
        />
      )}
      {seenBySheetOpen && (
        <GroupSeenBySheet entries={groupSeenBy} onClose={onCloseSeenBy} />
      )}
    </>
  );
}
