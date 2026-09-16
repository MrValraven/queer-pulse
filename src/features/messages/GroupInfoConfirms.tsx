import { GroupDissolveConfirm } from "./GroupDissolveConfirm";
import { GroupLeaveConfirm } from "./GroupLeaveConfirm";
import { GroupRemoveMemberConfirm } from "./GroupRemoveMemberConfirm";
import { GroupTransferOwnershipConfirm } from "./GroupTransferOwnershipConfirm";
import type { Conversation, GroupMemberView } from "./data";

interface GroupInfoConfirmsProps {
  active: Conversation;
  callerIsOwner: boolean;
  /** DES-228 display-only preview of who inherits ownership if the owner
   *  leaves; see `computeGroupSuccessor`'s own doc. Null = nobody remains. */
  successorName: string | null;
  /** False while the caller's own roster row has not resolved yet, so
   *  `successorName === null` cannot be read as "nobody remains". */
  isSuccessionKnown: boolean;
  managing: boolean;
  leaving: boolean;
  transferPending: boolean;
  dissolvePending: boolean;
  pendingRemove: GroupMemberView | null;
  pendingTransfer: GroupMemberView | null;
  confirmingLeave: boolean;
  confirmingDissolve: boolean;
  onClearPendingRemove: () => void;
  onClearPendingTransfer: () => void;
  onClearConfirmingLeave: () => void;
  onClearConfirmingDissolve: () => void;
  onRemoveMember: (member: GroupMemberView) => void;
  onTransferOwnership: (member: GroupMemberView) => void;
  onLeave: () => void;
  onDissolve: () => void;
}

/** The four confirm dialogs a `GroupInfoModal` action can open: remove a
 *  member, hand over ownership (DES-228), leave (DES-228), or dissolve
 *  (PRD-357). Split out purely to keep that orchestrator under the size
 *  cap. Each mounts only while its own pending/confirming state is set. */
export function GroupInfoConfirms({
  active,
  callerIsOwner,
  successorName,
  isSuccessionKnown,
  managing,
  leaving,
  transferPending,
  dissolvePending,
  pendingRemove,
  pendingTransfer,
  confirmingLeave,
  confirmingDissolve,
  onClearPendingRemove,
  onClearPendingTransfer,
  onClearConfirmingLeave,
  onClearConfirmingDissolve,
  onRemoveMember,
  onTransferOwnership,
  onLeave,
  onDissolve,
}: GroupInfoConfirmsProps) {
  return (
    <>
      {pendingRemove && (
        <GroupRemoveMemberConfirm
          member={pendingRemove}
          pending={managing}
          onConfirm={() => {
            onRemoveMember(pendingRemove);
            onClearPendingRemove();
          }}
          onCancel={onClearPendingRemove}
        />
      )}
      {pendingTransfer && (
        <GroupTransferOwnershipConfirm
          member={pendingTransfer}
          pending={transferPending}
          onConfirm={() => {
            onTransferOwnership(pendingTransfer);
            onClearPendingTransfer();
          }}
          onCancel={onClearPendingTransfer}
        />
      )}
      {confirmingLeave && (
        <GroupLeaveConfirm
          groupName={active.name}
          isOwner={callerIsOwner}
          successorName={successorName}
          isSuccessionKnown={isSuccessionKnown}
          pending={leaving}
          onConfirm={() => {
            onClearConfirmingLeave();
            onLeave();
          }}
          onCancel={onClearConfirmingLeave}
          onTransferInstead={callerIsOwner ? onClearConfirmingLeave : undefined}
        />
      )}
      {confirmingDissolve && (
        <GroupDissolveConfirm
          groupName={active.name}
          pending={dissolvePending}
          onConfirm={() => {
            onClearConfirmingDissolve();
            onDissolve();
          }}
          onCancel={onClearConfirmingDissolve}
        />
      )}
    </>
  );
}
