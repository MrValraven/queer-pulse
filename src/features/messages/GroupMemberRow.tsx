import { useNavigate } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { ConversationRole } from "../../shared/contracts/contracts";
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
  /** The caller is the owner — required to act on another admin. */
  callerIsOwner: boolean;
  /** True while a management mutation is in flight (disables the row actions). */
  busy: boolean;
  onRemove: (member: GroupMemberView) => void;
  onChangeRole: (member: GroupMemberView, role: "admin" | "member") => void;
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
  callerIsOwner,
  busy,
  onRemove,
  onChangeRole,
}: GroupMemberRowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const labelKey = roleLabelKey(member.role);
  const isOwner = member.role === "owner";
  const isAdmin = member.role === "admin";

  const canPromote = canManageRoles && !isSelf && member.role === "member";
  const canDemote = canManageRoles && !isSelf && isAdmin;
  const canRemove =
    canRemoveMembers && !isSelf && !isOwner && (!isAdmin || callerIsOwner);

  return (
    <li className={styles.memberRow}>
      <button
        type="button"
        className={styles.memberLink}
        disabled={!member.slug}
        onClick={() =>
          member.slug && void navigate(`${routes.members}/${member.slug}`)
        }
      >
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
      </button>
      {labelKey && <span className={styles.roleBadge}>{t(labelKey)}</span>}
      {(canPromote || canDemote || canRemove) && (
        <span className={styles.memberActions}>
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
    </li>
  );
}
