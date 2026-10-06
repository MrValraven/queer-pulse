import { FiCheck, FiCopy } from "react-icons/fi";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useClipboard } from "../../shared/hooks";
import { inviteFullUrlFor } from "../../shared/lib/inviteUrl";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { SentInviteView } from "./api/useSentInvites";
import styles from "./SentInvitesList.module.css";

/** Day + 24h time, e.g. "Jul 30, 2026, 14:32". One locale-aware call so each
 *  language places its own date/time separator; `h23` forces 24h in EN and PT. */
function dateAndTime(fmt: Formatters, value: Date): string {
  return fmt.date(value, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** Placeholder rows while a filter tab's first page loads. */
export function SentInviteRowSkeletons() {
  return (
    <div className={styles.list} aria-hidden>
      {[0, 1].map((placeholderIndex) => (
        <div className={styles.row} key={placeholderIndex}>
          <div className={styles.main}>
            <SkeletonLine width="45%" />
            <SkeletonLine width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** One sent-invite row: who it is for, status chip, and the send/expiry or
 *  accepted line. A pinned invite leads with the address it is bound to and
 *  demotes the code; an unpinned one keeps the code and says plainly that
 *  anyone holding the link can redeem it. A still-Pending invite
 *  (`status === "valid"`) also gets Copy link and Revoke controls. */
export function SentInviteRow({
  invite,
  t,
  fmt,
  onRevoke,
  isRevoking,
  onResend,
  isResending,
}: {
  invite: SentInviteView;
  t: TFunction;
  fmt: Formatters;
  onRevoke: (invite: SentInviteView) => void;
  isRevoking: boolean;
  onResend: (invite: SentInviteView) => void;
  isResending: boolean;
}) {
  const { showToast } = useToast();
  // The shared clipboard primitive, so this row never grows a second copy of
  // the reset-timer / permission handling `CopyLinkRow` already owns.
  const { copy, copied: hasCopied } = useClipboard();
  // What the invite is called out loud: the address it is bound to, or its code.
  const inviteLabel = invite.recipientEmail ?? invite.code;

  async function copyInviteLink() {
    const didCopy = await copy(inviteFullUrlFor(invite.code));
    showToast(
      didCopy
        ? t("auth:invite.sentList.linkCopied")
        : t("auth:invite.sentList.copyFailed"),
      didCopy ? "success" : "error",
    );
  }

  const sent = dateAndTime(fmt, invite.sentAt);
  // `expiresAt` can be null (invite with no set expiry), so fall back to a
  // send-only line and never print an "Invalid Date".
  const expires = invite.expiresAt ? dateAndTime(fmt, invite.expiresAt) : null;
  const detail =
    invite.status === "used" && invite.acceptedByName
      ? t("auth:invite.sentList.detail.joined", { name: invite.acceptedByName })
      : invite.status === "valid"
        ? expires
          ? t("auth:invite.sentList.detail.sentExpires", { sent, expires })
          : t("auth:invite.sentList.detail.sent", { sent })
        : expires
          ? t("auth:invite.sentList.detail.sentExpired", { sent, expires })
          : t("auth:invite.sentList.detail.sent", { sent });

  return (
    <div className={styles.row}>
      <div className={styles.main}>
        {invite.recipientEmail ? (
          <>
            <div className={styles.recipient}>{invite.recipientEmail}</div>
            <div className={styles.codeSecondary}>
              {invite.code} · {t("auth:invite.sentList.pinnedNote")}
            </div>
          </>
        ) : (
          <>
            <div className={styles.code}>{invite.code}</div>
            <div className={styles.bearer}>
              {t("auth:invite.sentList.anyoneWithLink")}
            </div>
          </>
        )}
        {invite.note && <div className={styles.note}>"{invite.note}"</div>}
        <div className={styles.detail}>{detail}</div>
      </div>
      <div className={styles.side}>
        <span className={`${styles.chip} ${styles[invite.statusTone]}`}>
          {t(invite.statusKey)}
        </span>
        {invite.status === "valid" && (
          <Button
            variant="ghost"
            size="md"
            className={styles.copy}
            aria-label={t("auth:invite.sentList.copyLinkAriaLabel", {
              invite: inviteLabel,
            })}
            onClick={() => void copyInviteLink()}
          >
            {hasCopied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
            {hasCopied
              ? t("auth:common.copied")
              : t("auth:invite.sentList.copyLinkCta")}
          </Button>
        )}
        {invite.status === "valid" && (
          <Button
            variant="ghost"
            size="md"
            className={styles.revoke}
            disabled={isRevoking}
            onClick={() => onRevoke(invite)}
          >
            {isRevoking
              ? t("auth:invite.sentList.revoking")
              : t("auth:invite.sentList.revokeCta")}
          </Button>
        )}
        {invite.status === "expired" && (
          <Button
            variant="ghost"
            size="md"
            className={styles.revoke}
            disabled={isResending}
            onClick={() => onResend(invite)}
          >
            {isResending
              ? t("auth:invite.sentList.resending")
              : t("auth:invite.sentList.resendCta")}
          </Button>
        )}
      </div>
    </div>
  );
}
