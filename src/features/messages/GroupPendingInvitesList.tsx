import { FiX } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ConversationPendingInvite } from "../../shared/contracts/contracts";
import { groupInitials } from "./api/messages.adapters";
import styles from "./GroupInfoModal.module.css";
import sharedStyles from "./NewMessageModal.module.css";

interface GroupPendingInvitesListProps {
  invites: ConversationPendingInvite[];
  /** The invite currently being revoked, or null, so revoking one row's
   *  Revoke button never disables every other row's. */
  busyInviteId: string | null;
  onRevoke: (inviteId: string) => void;
}

/** PRD-353/PRD-358: the owner/admin's view of invites still awaiting a
 *  response, with a Revoke action each. Split out of `GroupInviteLinkSection`
 *  purely to keep that file under the size cap. */
export function GroupPendingInvitesList({
  invites,
  busyInviteId,
  onRevoke,
}: GroupPendingInvitesListProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.fieldLabel}>
        {t("messages:group.pendingInvites.title", { count: invites.length })}
      </div>
      <ul className={styles.pendingInviteList}>
        {invites.map((invite) => (
          <li key={invite.id} className={styles.pendingInviteRow}>
            <Avatar
              initials={groupInitials(invite.user.name)}
              tint="default"
              src={invite.user.avatarUrl ?? undefined}
              size={32}
            />
            <span className={styles.pendingInviteName}>{invite.user.name}</span>
            <button
              type="button"
              className={`${sharedStyles.rowActionBtn} ${sharedStyles.rowActionDanger}`}
              disabled={busyInviteId === invite.id}
              onClick={() => onRevoke(invite.id)}
              aria-label={t("messages:group.pendingInvites.revokeAriaLabel", {
                name: invite.user.name,
              })}
            >
              <FiX aria-hidden style={{ marginInlineEnd: 4 }} />
              {t("messages:group.pendingInvites.revoke")}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
