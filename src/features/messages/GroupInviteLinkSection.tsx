import { useState } from "react";
import { FiCopy, FiLink, FiRefreshCw, FiX } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { GroupPendingInvitesList } from "./GroupPendingInvitesList";
import type { Conversation } from "./data";
import styles from "./GroupInfoModal.module.css";

interface GroupInviteLinkSectionProps {
  active: Conversation;
  linkPending: boolean;
  /** The pending invite currently being revoked, or null, keyed by invite
   *  id (like `busyInviteId` in `useGroupInviteRequestActions`) so revoking
   *  one row never disables every other row's own Revoke button. */
  busyInviteId: string | null;
  onCreateLink: () => void;
  onResetLink: () => void;
  onDisableLink: () => void;
  onRevokeInvite: (inviteId: string) => void;
}

/** The link this section shows/copies, matching `GET join/:token` in the REST
 *  contract (`routes.groupJoin`), so joining always resolves through the API
 *  rather than a client-guessed route. */
function inviteLinkUrl(token: string): string {
  return `${window.location.origin}${routes.groupJoin}/${token}`;
}

/**
 * PRD-358: the group's revocable invite link (owner/admin only, gated on
 * `active.canManageInviteLink`, server-authoritative) plus the pending
 * invites awaiting a response. Split out of `GroupInfoModal` to keep it
 * under the size cap.
 */
export function GroupInviteLinkSection({
  active,
  linkPending,
  busyInviteId,
  onCreateLink,
  onResetLink,
  onDisableLink,
  onRevokeInvite,
}: GroupInviteLinkSectionProps) {
  const { t } = useTranslation();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const { share } = useShareLink({
    copied: t("messages:group.inviteLink.copiedToast"),
  });

  if (!active.canManageInviteLink) return null;
  const token = active.inviteToken ?? null;
  const pendingInvites = active.pendingInvites ?? [];

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        {t("messages:group.inviteLink.title")}
      </div>
      {token ? (
        <>
          <div className={styles.inviteLinkRow}>
            <FiLink aria-hidden />
            <span className={styles.inviteLinkText}>
              {inviteLinkUrl(token)}
            </span>
          </div>
          <div className={styles.inviteActions}>
            <Button
              variant="ghost"
              onClick={() => void share(inviteLinkUrl(token))}
            >
              <FiCopy aria-hidden style={{ marginInlineEnd: 6 }} />
              {t("messages:group.inviteLink.copy")}
            </Button>
            <Button
              variant="ghost"
              disabled={linkPending}
              onClick={() => setConfirmingReset(true)}
            >
              <FiRefreshCw aria-hidden style={{ marginInlineEnd: 6 }} />
              {t("messages:group.inviteLink.reset")}
            </Button>
            <Button
              variant="ghost"
              disabled={linkPending}
              onClick={onDisableLink}
            >
              <FiX aria-hidden style={{ marginInlineEnd: 6 }} />
              {t("messages:group.inviteLink.turnOff")}
            </Button>
          </div>
        </>
      ) : (
        <Button variant="ghost" disabled={linkPending} onClick={onCreateLink}>
          <FiLink aria-hidden style={{ marginInlineEnd: 6 }} />
          {t("messages:group.inviteLink.create")}
        </Button>
      )}

      {pendingInvites.length > 0 && (
        <GroupPendingInvitesList
          invites={pendingInvites}
          busyInviteId={busyInviteId}
          onRevoke={onRevokeInvite}
        />
      )}

      <ConfirmDialog
        open={confirmingReset}
        tone="destructive"
        loading={linkPending}
        onClose={() => setConfirmingReset(false)}
        onConfirm={() => {
          setConfirmingReset(false);
          onResetLink();
        }}
        title={t("messages:group.inviteLink.resetConfirmTitle")}
        description={t("messages:group.inviteLink.resetConfirmBody")}
        confirmLabel={t("messages:group.inviteLink.reset")}
      />
    </div>
  );
}
