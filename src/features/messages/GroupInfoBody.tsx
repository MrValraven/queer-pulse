import type { MouseEvent } from "react";
import { FiGrid, FiUserPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GroupAddMembersModal } from "./GroupAddMembersModal";
import { GroupInfoEditPanel } from "./GroupInfoEditPanel";
import { GroupInfoIdentityView } from "./GroupInfoIdentityView";
import { GroupInfoLeftNotice } from "./GroupInfoLeftNotice";
import { GroupInviteLinkSection } from "./GroupInviteLinkSection";
import { GroupRosterList } from "./GroupRosterList";
import type { GroupMemberPick } from "./NewGroupModal";
import type { Conversation, GroupMemberView } from "./data";
import sharedStyles from "./NewMessageModal.module.css";

interface GroupInfoBodyProps {
  active: Conversation;
  members: GroupMemberView[];
  isSelf: (member: GroupMemberView) => boolean;
  callerIsOwner: boolean;
  managing: boolean;
  renaming: boolean;
  onStartRename: () => void;
  onSaveInfo: (changes: {
    title?: string;
    avatarUrl?: string;
    description?: string;
  }) => void;
  onCancelRename: () => void;
  onOpenMediaGallery?: (trigger?: HTMLElement | null) => void;
  addOpen: boolean;
  onOpenAddMembers: () => void;
  onCloseAddMembers: () => void;
  onAddMembers: (picks: GroupMemberPick[]) => void;
  onRemoveMember: (member: GroupMemberView) => void;
  onChangeMemberRole: (
    member: GroupMemberView,
    role: "admin" | "member",
  ) => void;
  onTransferOwnership: (member: GroupMemberView) => void;
  inviteLinkPending: boolean;
  /** The pending invite currently being revoked, or null; see
   *  `GroupInviteLinkSection`'s own doc. */
  busyInviteId: string | null;
  onCreateInviteLink: () => void;
  onResetInviteLink: () => void;
  onDisableInviteLink: () => void;
  onRevokeInvite: (inviteId: string) => void;
}

/** The `GroupInfoModal` body: identity (view/edit), the media-gallery entry,
 *  and either the roster + invite-link section or ENG-238's left/dissolved
 *  notice. Split out purely to keep the orchestrator under the size cap. */
export function GroupInfoBody({
  active,
  members,
  isSelf,
  callerIsOwner,
  managing,
  renaming,
  onStartRename,
  onSaveInfo,
  onCancelRename,
  onOpenMediaGallery,
  addOpen,
  onOpenAddMembers,
  onCloseAddMembers,
  onAddMembers,
  onRemoveMember,
  onChangeMemberRole,
  onTransferOwnership,
  inviteLinkPending,
  busyInviteId,
  onCreateInviteLink,
  onResetInviteLink,
  onDisableInviteLink,
  onRevokeInvite,
}: GroupInfoBodyProps) {
  const { t } = useTranslation();
  return (
    <>
      {renaming ? (
        <GroupInfoEditPanel
          active={active}
          managing={managing}
          onCancel={onCancelRename}
          onSave={onSaveInfo}
        />
      ) : (
        <GroupInfoIdentityView active={active} onEdit={onStartRename} />
      )}

      {onOpenMediaGallery && (
        <div className={sharedStyles.sectionAction}>
          <Button
            variant="ghost"
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              onOpenMediaGallery(event.currentTarget)
            }
          >
            <FiGrid aria-hidden style={{ marginInlineEnd: 6 }} />
            {t("messages:mediaGallery.title")}
          </Button>
        </div>
      )}

      {active.hasLeft ? (
        <GroupInfoLeftNotice active={active} />
      ) : (
        <>
          {active.canAddMembers && (
            <div className={sharedStyles.sectionAction}>
              <Button variant="ghost" onClick={onOpenAddMembers}>
                <FiUserPlus aria-hidden style={{ marginInlineEnd: 6 }} />
                {t("messages:group.add")}
              </Button>
            </div>
          )}

          <GroupRosterList
            members={members}
            isSelf={isSelf}
            canManageRoles={!!active.canManageRoles}
            canRemoveMembers={!!active.canRemoveMembers}
            canTransferOwnership={!!active.canTransferOwnership}
            callerIsOwner={callerIsOwner}
            busy={managing}
            onRemove={onRemoveMember}
            onChangeRole={onChangeMemberRole}
            onTransferOwnership={onTransferOwnership}
          />

          <GroupInviteLinkSection
            active={active}
            linkPending={inviteLinkPending}
            busyInviteId={busyInviteId}
            onCreateLink={onCreateInviteLink}
            onResetLink={onResetInviteLink}
            onDisableLink={onDisableInviteLink}
            onRevokeInvite={onRevokeInvite}
          />
        </>
      )}

      {addOpen && (
        <GroupAddMembersModal
          existingSlugs={members
            .map((member) => member.slug)
            .filter((slug): slug is string => !!slug)}
          activeMemberCount={active.memberCount ?? members.length}
          busy={managing}
          onClose={onCloseAddMembers}
          onAdd={(picks) => {
            onAddMembers(picks);
            onCloseAddMembers();
          }}
        />
      )}
    </>
  );
}
