import { useState } from "react";
import { FiEdit2, FiUserPlus } from "react-icons/fi";
import { Avatar, Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GroupAddMembersModal } from "./GroupAddMembersModal";
import { GroupAvatarField } from "./GroupAvatarField";
import { GroupMemberRow } from "./GroupMemberRow";
import { GroupRemoveMemberConfirm } from "./GroupRemoveMemberConfirm";
import type { GroupMemberPick } from "./NewGroupModal";
import type { Conversation, GroupMemberView } from "./data";
import styles from "./NewMessageModal.module.css";

interface GroupInfoModalProps {
  active: Conversation;
  /** The signed-in member's user id — for self-exclusion in the roster. */
  myUserId: string | null;
  onClose: () => void;
  /** The signed-in member leaves the group. */
  onLeave: () => void;
  leaving: boolean;
  /** True while any management mutation is in flight. */
  managing: boolean;
  onAddMembers: (picks: GroupMemberPick[]) => void;
  onRemoveMember: (member: GroupMemberView) => void;
  onChangeMemberRole: (member: GroupMemberView, role: "admin" | "member") => void;
  onUpdateInfo: (changes: { title?: string; avatarUrl?: string }) => void;
}

/**
 * Group management (feature #17 Phase 2): the group identity (avatar/name/count,
 * editable by owner/admin), the member roster with role badges + per-member
 * management (add/remove/promote/demote), and Leave. Every action is gated on the
 * SERVER-AUTHORITATIVE can-flags on `active`; the server re-checks the caller's
 * role on each mutation. Sub-components (GroupMemberRow, GroupAddMembersModal)
 * keep this orchestrator under the size cap.
 */
export function GroupInfoModal({
  active,
  myUserId,
  onClose,
  onLeave,
  leaving,
  managing,
  onAddMembers,
  onRemoveMember,
  onChangeMemberRole,
  onUpdateInfo,
}: GroupInfoModalProps) {
  const { t } = useTranslation();
  const members = active.members ?? [];
  const [renaming, setRenaming] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState(active.name);
  // `undefined` = the photo was left untouched (no avatar edit is sent on save);
  // a storage key = a new photo picked; `""` = the photo was removed.
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  // Member armed for removal — drives the confirm step, so removal never fires
  // straight from the roster's Remove button.
  const [pendingRemove, setPendingRemove] =
    useState<GroupMemberView | null>(null);

  const callerIsOwner = !!active.canManageRoles;
  const isSelf = (member: GroupMemberView) =>
    (!!myUserId && member.id === myUserId) ||
    (!member.id && member.role === "owner");

  function saveInfo() {
    // `avatarUrl` stays `undefined` unless the member actually changed the photo,
    // so an untouched panel never overwrites the stored key with a resolved URL.
    onUpdateInfo({ title: title.trim(), avatarUrl });
    setRenaming(false);
  }

  return (
    <>
      <Modal
        title={t("messages:group.infoTitle")}
        onClose={onClose}
        footer={
          !active.hasLeft ? (
            <Button variant="ghost" onClick={onLeave} disabled={leaving}>
              {leaving ? t("messages:group.leaving") : t("messages:group.leave")}
            </Button>
          ) : undefined
        }
      >
        {renaming ? (
          <div className={styles.renamePanel}>
            <input
              className={styles.groupNameField}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label={t("messages:group.nameAria")}
              maxLength={80}
            />
            <GroupAvatarField
              currentAvatarUrl={active.avatarUrl}
              groupName={active.name}
              onChange={setAvatarUrl}
            />
            <div className={styles.renameActions}>
              <Button variant="ghost" onClick={() => setRenaming(false)}>
                {t("messages:actions.editCancel")}
              </Button>
              <Button
                variant="primary"
                disabled={!title.trim() || managing}
                onClick={saveInfo}
              >
                {t("messages:actions.editSave")}
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.groupIdentity}>
            <Avatar
              initials={active.initials}
              tint={active.tint}
              src={active.avatarUrl}
              size={56}
            />
            <div>
              <div className={styles.groupName}>{active.name}</div>
              <div className={styles.groupSub}>
                {t("messages:group.memberCount", {
                  count: active.memberCount ?? members.length,
                })}
              </div>
            </div>
            {active.canRename && (
              <button
                type="button"
                className={styles.editIconBtn}
                onClick={() => {
                  setTitle(active.name);
                  setAvatarUrl(undefined);
                  setRenaming(true);
                }}
                aria-label={t("messages:group.edit")}
                title={t("messages:group.edit")}
              >
                <FiEdit2 aria-hidden />
              </button>
            )}
          </div>
        )}

        {active.canAddMembers && (
          <div className={styles.sectionAction}>
            <Button variant="ghost" onClick={() => setAddOpen(true)}>
              <FiUserPlus aria-hidden style={{ marginInlineEnd: 6 }} />
              {t("messages:group.add")}
            </Button>
          </div>
        )}

        <ul className={styles.list}>
          {members.map((member) => (
            <GroupMemberRow
              key={member.id ?? member.slug ?? member.name}
              member={member}
              isSelf={isSelf(member)}
              canManageRoles={!!active.canManageRoles}
              canRemoveMembers={!!active.canRemoveMembers}
              callerIsOwner={callerIsOwner}
              busy={managing}
              onRemove={setPendingRemove}
              onChangeRole={onChangeMemberRole}
            />
          ))}
        </ul>
      </Modal>

      {pendingRemove && (
        <GroupRemoveMemberConfirm
          member={pendingRemove}
          pending={managing}
          onConfirm={() => {
            onRemoveMember(pendingRemove);
            setPendingRemove(null);
          }}
          onCancel={() => setPendingRemove(null)}
        />
      )}
      {addOpen && (
        <GroupAddMembersModal
          existingSlugs={members
            .map((member) => member.slug)
            .filter((slug): slug is string => !!slug)}
          busy={managing}
          onClose={() => setAddOpen(false)}
          onAdd={(picks) => {
            onAddMembers(picks);
            setAddOpen(false);
          }}
        />
      )}
    </>
  );
}
