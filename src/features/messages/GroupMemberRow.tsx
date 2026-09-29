import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import { Avatar, IconButton } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { ConversationRole } from "../../shared/contracts/contracts";
import { GroupMemberRowSafetyMenu } from "./GroupMemberRowSafetyMenu";
import { useGoTogetherGroup } from "../goTogether/api/useGoTogetherGroup";
import { GoTogetherGroupSheet } from "../goTogether/group/GoTogetherGroupSheet";
import {
  useIsMatchedChat,
  useMatchedChat,
  type MatchedChat,
} from "./matchedChatContext";
import type { GroupMemberView } from "./data";
import styles from "./NewMessageModal.module.css";

/** Role label for the owner/admin badge; members get no badge. */
function roleLabelKey(role: ConversationRole): string | null {
  if (role === "owner") return "messages:group.roleOwner";
  if (role === "admin") return "messages:group.roleAdmin";
  return null;
}

interface GroupMemberRowProps {
  member: GroupMemberView;
  /** This row is the signed-in member (no self-management). */
  isSelf: boolean;
  /** The caller may promote/demote (owner only). */
  canManageRoles: boolean;
  /** The caller may remove members (owner/admin). */
  canRemoveMembers: boolean;
  /** DES-228: the caller (the owner) may hand ownership to another member. */
  canTransferOwnership: boolean;
  /** The caller is the owner — required to act on another admin. */
  callerIsOwner: boolean;
  /** True while a management mutation is in flight (disables the row actions). */
  busy: boolean;
  onRemove: (member: GroupMemberView) => void;
  onChangeRole: (member: GroupMemberView, role: "admin" | "member") => void;
  /** DES-228: opens the "Make {name} the owner?" confirm for this member. */
  onTransferOwnership: (member: GroupMemberView) => void;
}

/**
 * One roster row in the group management view: avatar + name + staff/role badge,
 * plus the permitted management actions (Promote/Demote/Remove). Every action is
 * gated on the SERVER-AUTHORITATIVE can-flags passed down; the server re-checks
 * the caller's role on the mutation regardless. The owner can never be demoted or
 * removed here, and an admin can't act on another admin (owner-only).
 */
export function GroupMemberRow({
  member,
  isSelf,
  canManageRoles,
  canRemoveMembers,
  canTransferOwnership,
  callerIsOwner,
  busy,
  onRemove,
  onChangeRole,
  onTransferOwnership,
}: GroupMemberRowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMatchedChat = useIsMatchedChat();
  const labelKey = roleLabelKey(member.role);
  const isOwner = member.role === "owner";
  const isAdmin = member.role === "admin";

  const canPromote = canManageRoles && !isSelf && member.role === "member";
  const canDemote = canManageRoles && !isSelf && isAdmin;
  const canRemove =
    canRemoveMembers && !isSelf && !isOwner && (!isAdmin || callerIsOwner);
  const canMakeOwner = canTransferOwnership && !isSelf && !isOwner;

  const identity = (
    <>
      <Avatar
        initials={member.initials}
        tint={member.tint}
        src={member.avatarUrl}
        size={40}
      />
      <div className={styles.rowBody}>
        <span className={styles.nameRow}>
          <span className={styles.rowName}>{member.name}</span>
          <MemberStaffBadge slug={member.slug} />
        </span>
      </div>
    </>
  );

  return (
    <li className={styles.memberRow}>
      {/* PRD-423: a matched Go together chat opens no other member's
          profile, which carries their full name; the row is plain text. */}
      {isMatchedChat && !isSelf ? (
        <div className={`${styles.memberLink} ${styles.memberStatic}`}>
          {identity}
        </div>
      ) : (
        <button
          type="button"
          className={styles.memberLink}
          disabled={!member.slug}
          onClick={() =>
            member.slug && void navigate(`${routes.members}/${member.slug}`)
          }
        >
          {identity}
        </button>
      )}
      {labelKey && <span className={styles.roleBadge}>{t(labelKey)}</span>}
      {(canPromote || canDemote || canRemove || canMakeOwner) && (
        <span className={styles.memberActions}>
          {canMakeOwner && (
            <button
              type="button"
              className={styles.rowActionBtn}
              disabled={busy}
              onClick={() => onTransferOwnership(member)}
            >
              {t("messages:group.makeOwner")}
            </button>
          )}
          {canPromote && (
            <button
              type="button"
              className={styles.rowActionBtn}
              disabled={busy}
              onClick={() => onChangeRole(member, "admin")}
            >
              {t("messages:group.promote")}
            </button>
          )}
          {canDemote && (
            <button
              type="button"
              className={styles.rowActionBtn}
              disabled={busy}
              onClick={() => onChangeRole(member, "member")}
            >
              {t("messages:group.demote")}
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
              disabled={busy}
              onClick={() => onRemove(member)}
            >
              {t("messages:group.remove")}
            </button>
          )}
        </span>
      )}
      {!isSelf && <GroupMemberRowSafety member={member} />}
    </li>
  );
}

/** A row's Block and Report: the Go together group sheet in a matched chat,
 *  the generic safety menu everywhere else. */
function GroupMemberRowSafety({ member }: { member: GroupMemberView }) {
  const matchedChat = useMatchedChat();
  if (!matchedChat) return <GroupMemberRowSafetyMenu member={member} />;
  return <MatchedChatMemberSafety member={member} matchedChat={matchedChat} />;
}

/**
 * In a matched Go together chat, Block moves the blocker to another group
 * or out of the chat, depending on how close the gathering is. The group
 * sheet says which before the member confirms, blocks through the group's
 * own route and refreshes the Go together card and group afterwards, so the
 * roster sends Block and Report there. While the group cannot be read (still
 * loading, dissolved, or no longer readable), the generic menu stays.
 */
function MatchedChatMemberSafety({
  member,
  matchedChat,
}: {
  member: GroupMemberView;
  matchedChat: MatchedChat;
}) {
  const { t } = useTranslation();
  // `matchedChat.groupId` is null once the group row is deleted; the query
  // then stays disabled and `group` below falls through to the generic menu,
  // same as a group that failed to load.
  const groupQuery = useGoTogetherGroup(matchedChat.groupId ?? undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const group = groupQuery.data;
  const isGroupReadable = Boolean(
    group && !group.isDissolved && !groupQuery.isError,
  );
  // A matched chat locks ownership transfer, so this row is always the house
  // account and keeps the generic menu.
  if (member.role === "owner" || !group || (!isGroupReadable && !isSheetOpen)) {
    return <GroupMemberRowSafetyMenu member={member} />;
  }

  return (
    <>
      <IconButton
        aria-label={t("messages:group.matchedMemberSafetyAriaLabel", {
          name: member.name,
        })}
        title={t("messages:group.matchedMemberSafetyAriaLabel", {
          name: member.name,
        })}
        aria-haspopup="dialog"
        onClick={() => setIsSheetOpen(true)}
      >
        <FiShield aria-hidden />
      </IconButton>
      {isSheetOpen && (
        <GoTogetherGroupSheet
          groupId={group.id}
          eventSlug={group.event.slug}
          openedFromConversationId={matchedChat.conversationId}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </>
  );
}
