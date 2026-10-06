import { useState } from "react";
import {
  FiClock,
  FiCopy,
  FiLink,
  FiRefreshCw,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { GroupPendingInvitesList } from "./GroupPendingInvitesList";
import { inviteLinkExpiryLabel } from "./inviteLinkExpiry";
import { InviteLinkMaxUsesPicker } from "./InviteLinkMaxUsesPicker";
import {
  inviteLinkUsesLabel,
  toInviteLinkMaxUses,
  type InviteLinkMaxUses,
} from "./inviteLinkUses";
import type { Conversation } from "./data";
import styles from "./GroupInfoModal.module.css";

interface GroupInviteLinkSectionProps {
  active: Conversation;
  linkPending: boolean;
  /** The pending invite currently being revoked, or null, keyed by invite
   *  id (like `busyInviteId` in `useGroupInviteRequestActions`) so revoking
   *  one row never disables every other row's own Revoke button. */
  busyInviteId: string | null;
  /** PRD-400 (use cap): both carry the "Max uses" choice for the new link
   *  (null for unlimited). */
  onCreateLink: (maxUses: InviteLinkMaxUses) => void;
  onResetLink: (maxUses: InviteLinkMaxUses) => void;
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
 * under the size cap. PRD-400: says when the link expires (7 days from its
 * last reset; Reset issues a fresh window) and that newcomers read from
 * their join onward. PRD-400 (use cap): a "Max uses" choice (1, 5, 25 or
 * Unlimited) sits beside Create and inside the Reset confirmation, and the
 * live link shows how many uses it has left.
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
  // Unlimited by default, so a link made without a choice behaves as before.
  const [maxUses, setMaxUses] = useState<InviteLinkMaxUses>(null);
  // Read once when the panel opens: the label is coarse (days, then hours),
  // so it needs no ticking clock while the modal is up.
  const [openedAtMs] = useState(() => Date.now());
  const { share } = useShareLink({
    copied: t("messages:group.inviteLink.copiedToast"),
  });

  if (!active.canManageInviteLink) return null;
  const token = active.inviteToken ?? null;
  const pendingInvites = active.pendingInvites ?? [];
  const expiry = token
    ? inviteLinkExpiryLabel(active.inviteTokenExpiresAt, openedAtMs, t)
    : null;
  const uses = token
    ? inviteLinkUsesLabel(
        active.inviteTokenMaxUses,
        active.inviteTokenUsesLeft,
        t,
      )
    : null;
  // A used-up or expired link cannot be shared, so Reset leads the actions.
  const isLinkDead = Boolean(expiry?.isExpired || uses?.isUsedUp);

  function openResetConfirm() {
    // Reset keeps the current link's cap unless the admin picks another.
    setMaxUses(toInviteLinkMaxUses(active.inviteTokenMaxUses));
    setConfirmingReset(true);
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        {t("messages:group.inviteLink.title")}
      </div>
      {/* PRD-400: whoever can bring people in learns, once and quietly,
          that newcomers read the group from the moment they join. */}
      <p className={styles.inviteHistoryNote}>
        {t("messages:group.inviteLink.historyNote")}
      </p>
      {token ? (
        <>
          <div className={styles.inviteLinkRow}>
            <FiLink aria-hidden />
            <span className={styles.inviteLinkText}>
              {inviteLinkUrl(token)}
            </span>
          </div>
          {expiry && (
            <p
              className={
                expiry.isExpired
                  ? `${styles.inviteLinkExpiry} ${styles.inviteLinkExpired}`
                  : styles.inviteLinkExpiry
              }
            >
              <FiClock aria-hidden />
              {expiry.text}
            </p>
          )}
          {uses && (
            <p
              className={
                uses.isUsedUp
                  ? `${styles.inviteLinkExpiry} ${styles.inviteLinkExpired}`
                  : styles.inviteLinkExpiry
              }
            >
              <FiUsers aria-hidden />
              {uses.text}
            </p>
          )}
          <div className={styles.inviteActions}>
            {!isLinkDead && (
              <Button
                variant="ghost"
                onClick={() => void share(inviteLinkUrl(token))}
              >
                <FiCopy aria-hidden style={{ marginInlineEnd: 6 }} />
                {t("messages:group.inviteLink.copy")}
              </Button>
            )}
            <Button
              variant="ghost"
              disabled={linkPending}
              onClick={openResetConfirm}
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
        <>
          <InviteLinkMaxUsesPicker value={maxUses} onChange={setMaxUses} />
          <Button
            variant="ghost"
            disabled={linkPending}
            onClick={() => onCreateLink(maxUses)}
          >
            <FiLink aria-hidden style={{ marginInlineEnd: 6 }} />
            {t("messages:group.inviteLink.create")}
          </Button>
        </>
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
          onResetLink(maxUses);
        }}
        title={t("messages:group.inviteLink.resetConfirmTitle")}
        description={t("messages:group.inviteLink.resetConfirmBody")}
        confirmLabel={t("messages:group.inviteLink.reset")}
      >
        <div className={styles.inviteResetPicker}>
          <InviteLinkMaxUsesPicker value={maxUses} onChange={setMaxUses} />
        </div>
      </ConfirmDialog>
    </div>
  );
}
