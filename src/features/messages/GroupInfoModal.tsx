import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { computeGroupSuccessor } from "./groupSuccession";
import { GroupInfoBody } from "./GroupInfoBody";
import { GroupInfoConfirms } from "./GroupInfoConfirms";
import type { GroupMemberPick } from "./NewGroupModal";
import type { Conversation, GroupMemberView } from "./data";

interface GroupInfoModalProps {
  active: Conversation;
  /** The signed-in member's user id, for self-exclusion in the roster. */
  myUserId: string | null;
  onClose: () => void;
  /** The signed-in member leaves the group. */
  onLeave: () => void;
  leaving: boolean;
  /** True while any management mutation is in flight. */
  managing: boolean;
  onAddMembers: (picks: GroupMemberPick[]) => void;
  onRemoveMember: (member: GroupMemberView) => void;
  onChangeMemberRole: (
    member: GroupMemberView,
    role: "admin" | "member",
  ) => void;
  onUpdateInfo: (changes: {
    title?: string;
    avatarUrl?: string;
    description?: string;
  }) => void;
  /** Opens the "Media, links and docs" sheet on top of this one (PRD-373). */
  onOpenMediaGallery?: (trigger?: HTMLElement | null) => void;
  /** DES-228: the owner hands ownership to another member. */
  onTransferOwnership: (member: GroupMemberView) => void;
  transferPending: boolean;
  /** PRD-357: the owner ends the group for everyone. */
  onDissolve: () => void;
  dissolvePending: boolean;
  /** PRD-358: the group's revocable invite link. */
  onCreateInviteLink: () => void;
  onResetInviteLink: () => void;
  onDisableInviteLink: () => void;
  inviteLinkPending: boolean;
  onRevokeInvite: (inviteId: string) => void;
  /** The pending invite currently being revoked, or null; see
   *  `GroupInviteLinkSection`'s own doc. */
  busyInviteId: string | null;
}

/**
 * Group management: identity (view/edit, PRD-358 adds description), the
 * member roster with role + safety actions (PRD-354's Block/Report,
 * DES-228's Make owner), the invite-link section, and Leave/End group
 * (PRD-357). Every action is gated on the SERVER-AUTHORITATIVE can-flags on
 * `active`; the server re-checks the caller's role/standing on each
 * mutation. Split into colocated sub-components (`GroupInfo*`, `GroupRoster
 * List`, the confirm dialogs) so this orchestrator stays under the size cap.
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
  onOpenMediaGallery,
  onTransferOwnership,
  transferPending,
  onDissolve,
  dissolvePending,
  onCreateInviteLink,
  onResetInviteLink,
  onDisableInviteLink,
  inviteLinkPending,
  onRevokeInvite,
  busyInviteId,
}: GroupInfoModalProps) {
  const { t } = useTranslation();
  const members = active.members ?? [];
  const [renaming, setRenaming] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<GroupMemberView | null>(
    null,
  );
  const [pendingTransfer, setPendingTransfer] =
    useState<GroupMemberView | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [confirmingDissolve, setConfirmingDissolve] = useState(false);

  const callerIsOwner = active.myRole === "owner";
  const isSelf = (member: GroupMemberView) =>
    (!!myUserId && member.id === myUserId) ||
    (!member.id && member.role === "owner");
  const myMember = members.find(isSelf) ?? null;
  // DES-228: display-only preview of who the server will hand ownership to
  // if this owner leaves; see `computeGroupSuccessor`'s own doc.
  const successor =
    callerIsOwner && myMember ? computeGroupSuccessor(members, myMember) : null;
  // Tri-state on purpose: while `myUserId` has not resolved yet, `myMember`
  // is null and we genuinely do not know who the successor would be. That
  // must never be read as "nobody remains", which would wrongly tell the
  // owner leaving ends the group for everyone.
  const isSuccessionKnown = callerIsOwner ? !!myMember : true;

  return (
    <>
      <Modal
        title={t("messages:group.infoTitle")}
        onClose={onClose}
        footer={
          !active.hasLeft ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setConfirmingLeave(true)}
                disabled={leaving}
              >
                {leaving
                  ? t("messages:group.leaving")
                  : t("messages:group.leave")}
              </Button>
              {active.canDissolve && (
                <Button
                  variant="danger"
                  onClick={() => setConfirmingDissolve(true)}
                  disabled={dissolvePending}
                >
                  {t("messages:group.dissolveAction")}
                </Button>
              )}
            </>
          ) : undefined
        }
      >
        <GroupInfoBody
          active={active}
          members={members}
          isSelf={isSelf}
          callerIsOwner={callerIsOwner}
          managing={managing}
          renaming={renaming}
          onStartRename={() => setRenaming(true)}
          onCancelRename={() => setRenaming(false)}
          onSaveInfo={(changes) => {
            onUpdateInfo(changes);
            setRenaming(false);
          }}
          onOpenMediaGallery={onOpenMediaGallery}
          addOpen={addOpen}
          onOpenAddMembers={() => setAddOpen(true)}
          onCloseAddMembers={() => setAddOpen(false)}
          onAddMembers={onAddMembers}
          onRemoveMember={setPendingRemove}
          onChangeMemberRole={onChangeMemberRole}
          onTransferOwnership={setPendingTransfer}
          inviteLinkPending={inviteLinkPending}
          busyInviteId={busyInviteId}
          onCreateInviteLink={onCreateInviteLink}
          onResetInviteLink={onResetInviteLink}
          onDisableInviteLink={onDisableInviteLink}
          onRevokeInvite={onRevokeInvite}
        />
      </Modal>

      <GroupInfoConfirms
        active={active}
        callerIsOwner={callerIsOwner}
        successorName={successor?.name ?? null}
        isSuccessionKnown={isSuccessionKnown}
        managing={managing}
        leaving={leaving}
        transferPending={transferPending}
        dissolvePending={dissolvePending}
        pendingRemove={pendingRemove}
        pendingTransfer={pendingTransfer}
        confirmingLeave={confirmingLeave}
        confirmingDissolve={confirmingDissolve}
        onClearPendingRemove={() => setPendingRemove(null)}
        onClearPendingTransfer={() => setPendingTransfer(null)}
        onClearConfirmingLeave={() => setConfirmingLeave(false)}
        onClearConfirmingDissolve={() => setConfirmingDissolve(false)}
        onRemoveMember={onRemoveMember}
        onTransferOwnership={onTransferOwnership}
        onLeave={onLeave}
        onDissolve={onDissolve}
      />
    </>
  );
}
