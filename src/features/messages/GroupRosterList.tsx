import { GroupMemberRow } from "./GroupMemberRow";
import type { GroupMemberView } from "./data";
import sharedStyles from "./NewMessageModal.module.css";

interface GroupRosterListProps {
  members: GroupMemberView[];
  isSelf: (member: GroupMemberView) => boolean;
  canManageRoles: boolean;
  canRemoveMembers: boolean;
  canTransferOwnership: boolean;
  callerIsOwner: boolean;
  busy: boolean;
  onRemove: (member: GroupMemberView) => void;
  onChangeRole: (member: GroupMemberView, role: "admin" | "member") => void;
  onTransferOwnership: (member: GroupMemberView) => void;
}

/** The roster `<ul>`, split out of `GroupInfoModal` purely to keep that
 *  orchestrator under the size cap; behaviour is unchanged (one
 *  `GroupMemberRow` per active member, keyed by the same stable id chain). */
export function GroupRosterList({
  members,
  isSelf,
  canManageRoles,
  canRemoveMembers,
  canTransferOwnership,
  callerIsOwner,
  busy,
  onRemove,
  onChangeRole,
  onTransferOwnership,
}: GroupRosterListProps) {
  return (
    <ul className={sharedStyles.list}>
      {members.map((member) => (
        <GroupMemberRow
          key={member.id ?? member.slug ?? member.name}
          member={member}
          isSelf={isSelf(member)}
          canManageRoles={canManageRoles}
          canRemoveMembers={canRemoveMembers}
          canTransferOwnership={canTransferOwnership}
          callerIsOwner={callerIsOwner}
          busy={busy}
          onRemove={onRemove}
          onChangeRole={onChangeRole}
          onTransferOwnership={onTransferOwnership}
        />
      ))}
    </ul>
  );
}
