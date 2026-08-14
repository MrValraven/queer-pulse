import type { ReactNode } from "react";
import { FiCopy } from "react-icons/fi";
import { AdminDrawer, AdminAvatar, AdminChip } from "./ui";
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

/** A longer free-text message the inviter typed (invite note or vouch), shown
 *  as a quoted callout. Renders nothing when the message is absent. */
function MessageBlock({
  label,
  message,
}: {
  label: string;
  message: string | null | undefined;
}) {
  if (!message) return null;
  return (
    <div className={styles.messageBlock}>
      <span className={styles.messageLabel}>{label}</span>
      <p className={styles.messageText}>{message}</p>
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
 * Read-only detail view for a single invite, opened by clicking a row on
 * {@link AdminInvitesPage}. The list hook already returns the full
 * {@link AdminInviteDTO}, so this renders the selected invite richly — inviter,
 * recipient (or target email / open link), status, and full timestamps with a
 * relative expiry read-out — with no extra fetch and no demo/live branch.
 */
export function AdminInviteDrawer({
  invite,
  onClose,
}: {
  invite: AdminInviteDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();

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
            <span className={styles.drawerCodeText}>{invite.code}</span>
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
          <div className={styles.drawerChips}>
            <AdminChip tone={ADMIN_INVITE_STATUS_TONE[invite.status]} dot>
              {t(`admin:adminInvites.status.${invite.status}`)}
            </AdminChip>
          </div>
        </div>
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
