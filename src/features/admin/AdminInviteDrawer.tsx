import { useEffect, useId, useRef, type ReactNode } from "react";
import { FiCopy, FiLock } from "react-icons/fi";
import { AdminDrawer, AdminAvatar, AdminChip } from "./ui";
import { AdminInviteRevokeAction } from "./AdminInviteRevokeAction";
import { AdminInviteRefreshAction } from "./AdminInviteRefreshAction";
import { ADMIN_INVITE_STATUS_TONE } from "./adminInviteStatusTone";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { tintForSlug } from "../../shared/api/refs";
import type { TFunction } from "../../shared/i18n/types";
import type {
  AdminInviteDTO,
  AdminInvitePersonDTO,
} from "./api/adminInvites.api";
import styles from "./AdminInvitesPage.module.css";

/** First two initials of a display name, for the avatar fallback. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + second).toUpperCase() || "?";
}

/** A person row (avatar + name) for the inviter or the member who accepted. */
function InvitePerson({ person }: { person: AdminInvitePersonDTO }) {
  return (
    <div className={styles.personRow}>
      <AdminAvatar
        initials={initialsFromName(person.name)}
        // tintForSlug yields coral/plum/jade, all valid AvatarTone values.
        tone={tintForSlug(person.slug)}
        size="sm"
        src={person.avatarUrl ?? undefined}
        alt={person.name}
      />
      <span className={styles.personName}>{person.name}</span>
    </div>
  );
}

/** "{date} at {time}", locale-aware, for created/expires timestamps. */
function dateTimeLine(fmt: Formatters, t: TFunction, iso: string): string {
  const when = new Date(iso);
  return t("admin:adminInvites.drawer.dateTime", {
    date: fmt.date(when, { day: "numeric", month: "short", year: "numeric" }),
    time: fmt.time(when),
  });
}

/** Whole-day signed difference from now to `iso` (positive = future). */
function daysFromNow(iso: string): number {
  const millisPerDay = 1000 * 60 * 60 * 24;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.round(diff / millisPerDay);
}

/** A longer free-text message the inviter typed (invite note, vouch or their
 *  private note), shown as a quoted callout. An optional icon leads the label
 *  and an optional caption says who can read it. `isInternal` gives the
 *  inviter's own label a quieter, untinted box so it reads apart from the
 *  two messages the recipient sees. Renders nothing when the message is
 *  absent. */
function MessageBlock({
  label,
  message,
  icon,
  caption,
  isInternal = false,
}: {
  label: string;
  message: string | null | undefined;
  icon?: ReactNode;
  caption?: string;
  isInternal?: boolean;
}) {
  if (!message) return null;
  const blockClassName = isInternal
    ? `${styles.messageBlock} ${styles.messageBlockInternal}`
    : styles.messageBlock;
  return (
    <div className={blockClassName}>
      <span className={styles.messageLabel}>
        {icon}
        {label}
      </span>
      <p className={styles.messageText}>{message}</p>
      {caption && <span className={styles.detailCaption}>{caption}</span>}
    </div>
  );
}

/** One labelled detail row in the drawer body. */
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <div className={styles.detailValue}>{children}</div>
    </div>
  );
}

/**
 * Detail view for a single invite, opened by clicking a row on
 * {@link AdminInvitesPage}. The list hook already returns the full
 * {@link AdminInviteDTO}, so this renders the selected invite richly (inviter,
 * recipient or target email or open link, status, and full timestamps with a
 * relative expiry read-out) with no extra fetch and no demo/live branch.
 *
 * The body stays a read-out. The actions live in the footer, one per status:
 * {@link AdminInviteRevokeAction} for a still-valid invite and
 * {@link AdminInviteRefreshAction} for an expired one. Each owns its own
 * confirm dialog and mutation. A refresh flips the row to `valid`, so the
 * footer swaps straight from Refresh to Revoke at the same height; an accepted
 * or revoked invite has no footer at all.
 */
export function AdminInviteDrawer({
  invite,
  onClose,
  onRevoked,
  onRefreshed,
}: {
  invite: AdminInviteDTO;
  onClose: () => void;
  /** The confirmed revoked row, so the open drawer reflects the new status. */
  onRevoked: (revoked: AdminInviteDTO) => void;
  /** The confirmed refreshed row, so the open drawer reflects the new status
   *  and expiry. */
  onRefreshed: (refreshed: AdminInviteDTO) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const codeTextId = useId();
  const statusChipsId = useId();
  const statusChipsRef = useRef<HTMLDivElement>(null);
  const previousStatusRef = useRef(invite.status);

  // A confirmed revoke or refresh unmounts the footer action that opened the
  // confirm (Refresh swaps to Revoke, a revoke leaves no footer), so the
  // dialog's focus restore aims at a detached button and focus drops to
  // <body>, outside the drawer's trap. Land it on the status chips instead,
  // which name the new status; the swapped-in Revoke is destructive and never
  // takes focus on its own. The restore runs in `useDismiss`'s passive cleanup
  // as the confirm unmounts, in the same commit as this status change, so the
  // focus waits a frame to be sure it lands after that restore.
  useEffect(() => {
    if (previousStatusRef.current === invite.status) return;
    previousStatusRef.current = invite.status;
    const focusFrame = requestAnimationFrame(() =>
      statusChipsRef.current?.focus(),
    );
    return () => cancelAnimationFrame(focusFrame);
  }, [invite.status]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(invite.code);
      showToast(t("admin:adminInvites.drawer.copied"), "success");
    } catch {
      showToast(t("admin:adminInvites.drawer.copyFailed"), "error");
    }
  };

  const expiresInDays = daysFromNow(invite.expiresAt);
  const expiryRelative = fmt.relativeTime(expiresInDays, "day");

  return (
    <AdminDrawer
      label={t("admin:adminInvites.drawer.label", { code: invite.code })}
      onClose={onClose}
      head={
        <div className={styles.drawerHeadInner}>
          <div className={styles.drawerCode}>
            <span id={codeTextId} className={styles.drawerCodeText}>
              {invite.code}
            </span>
            <button
              type="button"
              className={styles.copyButton}
              onClick={() => void handleCopyCode()}
              aria-label={t("admin:adminInvites.drawer.copyCode")}
              title={t("admin:adminInvites.drawer.copyCode")}
            >
              <FiCopy />
            </button>
          </div>
          {/* Named "<code> <status>" so a screen reader announces the new
              status when focus lands here after a revoke or refresh. */}
          <div
            ref={statusChipsRef}
            id={statusChipsId}
            className={styles.drawerChips}
            role="group"
            tabIndex={-1}
            aria-labelledby={`${codeTextId} ${statusChipsId}`}
          >
            <AdminChip tone={ADMIN_INVITE_STATUS_TONE[invite.status]} dot>
              {t(`admin:adminInvites.status.${invite.status}`)}
            </AdminChip>
          </div>
        </div>
      }
      foot={
        invite.status === "valid" ? (
          <AdminInviteRevokeAction invite={invite} onRevoked={onRevoked} />
        ) : invite.status === "expired" ? (
          <AdminInviteRefreshAction invite={invite} onRefreshed={onRefreshed} />
        ) : undefined
      }
    >
      <div className={styles.detailList}>
        <DetailRow label={t("admin:adminInvites.drawer.fromLabel")}>
          <InvitePerson person={invite.inviter} />
        </DetailRow>

        <DetailRow
          label={
            invite.invitee
              ? t("admin:adminInvites.drawer.acceptedByLabel")
              : t("admin:adminInvites.drawer.recipientLabel")
          }
        >
          {invite.invitee ? (
            <InvitePerson person={invite.invitee} />
          ) : invite.email ? (
            <span className={styles.detailPlain}>{invite.email}</span>
          ) : (
            <span className={styles.detailPlain}>
              {t("admin:adminInvites.drawer.recipientAnyone")}
            </span>
          )}
        </DetailRow>

        <DetailRow label={t("admin:adminInvites.drawer.createdLabel")}>
          <span className={styles.detailPlain}>
            {dateTimeLine(fmt, t, invite.createdAt)}
          </span>
        </DetailRow>

        <DetailRow label={t("admin:adminInvites.drawer.expiresLabel")}>
          <span className={styles.detailPlain}>
            {dateTimeLine(fmt, t, invite.expiresAt)}
          </span>
          {invite.status === "valid" && (
            <span className={styles.detailCaption}>{expiryRelative}</span>
          )}
        </DetailRow>

        <MessageBlock
          label={t("admin:adminInvites.drawer.privateNoteLabel")}
          message={invite.privateNote}
          icon={<FiLock aria-hidden className={styles.messageLabelIcon} />}
          caption={t("admin:adminInvites.drawer.privateNoteCaption")}
          isInternal
        />
        <MessageBlock
          label={t("admin:adminInvites.drawer.inviteMessageLabel")}
          message={invite.note}
        />
        <MessageBlock
          label={t("admin:adminInvites.drawer.vouchMessageLabel")}
          message={invite.vouch}
        />
      </div>
    </AdminDrawer>
  );
}
