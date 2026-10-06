import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, ConfirmDialog, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { goTogetherKeys } from "../goTogether/api/goTogetherKeys";
import { useGoTogetherGroup } from "../goTogether/api/useGoTogetherGroup";
import { computeGroupSuccessor } from "./groupSuccession";
import { GroupInfoBody } from "./GroupInfoBody";
import { GroupInfoConfirms } from "./GroupInfoConfirms";
import type { GroupMemberPick } from "./NewGroupModal";
import type { InviteLinkMaxUses } from "./inviteLinkUses";
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
  /** PRD-358: the group's revocable invite link. PRD-400 (use cap): create
   *  and reset carry the chosen max uses (null for unlimited). */
  onCreateInviteLink: (maxUses: InviteLinkMaxUses) => void;
  onResetInviteLink: (maxUses: InviteLinkMaxUses) => void;
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
  // PRD-423: a matched Go together chat names the viewer's own row by their
  // per-chat key (`viewerMemberKey`), in `id` and `slug` alike.
  const isSelf = (member: GroupMemberView) =>
    (!!myUserId && member.id === myUserId) ||
    (!!active.viewerMemberKey && member.slug === active.viewerMemberKey) ||
    (!member.id && member.role === "owner" && !active.viewerMemberKey);
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
              <GroupInfoLeaveAction
                eventMatchGroupId={active.eventMatchGroupId ?? null}
                leaving={leaving}
                onOpenLeaveConfirm={() => setConfirmingLeave(true)}
                onLeave={onLeave}
              />
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

/**
 * The footer's Leave. In a matched Go together chat it names the act the
 * way the group sheet does (S9): "Leave group" before the gathering starts,
 * "Leave the chat" from the start (`isLeaveChatOnly`, the member stays in
 * the group), with the same confirm copy. The chat's own leave route then
 * withdraws the Go together entry on the server. Until the group can be
 * read, and in every other group, it opens the generic leave confirm.
 */
function GroupInfoLeaveAction({
  eventMatchGroupId,
  leaving,
  onOpenLeaveConfirm,
  onLeave,
}: {
  eventMatchGroupId: string | null;
  leaving: boolean;
  onOpenLeaveConfirm: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const groupQuery = useGoTogetherGroup(eventMatchGroupId ?? undefined);
  const [isConfirmingMatchedLeave, setIsConfirmingMatchedLeave] =
    useState(false);
  // The Go together entry changes on the server after the chat leave lands
  // (a post-commit listener), and this footer unmounts as the leave starts.
  // So the card and group roots are marked stale with no refetch now: the
  // next card or sheet that mounts reads the settled state.
  const markGoTogetherStale = () => {
    for (const queryKey of [goTogetherKeys.cardRoot, goTogetherKeys.groupRoot])
      void queryClient.invalidateQueries({ queryKey, refetchType: "none" });
  };
  const group = groupQuery.data;
  const matchedCopyKey =
    eventMatchGroupId && group && !group.isDissolved && !groupQuery.isError
      ? group.isLeaveChatOnly
        ? "leaveChat"
        : "leave"
      : null;
  const leaveLabel =
    matchedCopyKey === "leaveChat"
      ? t("goTogether:group.leaveChat.label")
      : matchedCopyKey === "leave"
        ? t("goTogether:group.leave")
        : t("messages:group.leave");

  return (
    <>
      <Button
        variant="ghost"
        onClick={
          matchedCopyKey
            ? () => setIsConfirmingMatchedLeave(true)
            : onOpenLeaveConfirm
        }
        disabled={leaving}
      >
        {leaving ? t("messages:group.leaving") : leaveLabel}
      </Button>
      {matchedCopyKey && isConfirmingMatchedLeave && (
        <ConfirmDialog
          open
          tone="destructive"
          loading={leaving}
          title={t(`goTogether:group.${matchedCopyKey}Confirm.title`)}
          description={t(
            `goTogether:group.${matchedCopyKey}Confirm.description`,
          )}
          confirmLabel={t(`goTogether:group.${matchedCopyKey}Confirm.confirm`)}
          onClose={() => setIsConfirmingMatchedLeave(false)}
          onConfirm={() => {
            setIsConfirmingMatchedLeave(false);
            onLeave();
            markGoTogetherStale();
          }}
        />
      )}
    </>
  );
}
