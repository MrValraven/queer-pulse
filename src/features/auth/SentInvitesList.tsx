import { useMemo, useState } from "react";
import {
  Button,
  FadeIn,
  SkeletonLine,
  Tabs,
  type Tab,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import {
  useResendInvite,
  useRevokeInvite,
  useSentInvites,
  type SentInviteView,
} from "./api/useSentInvites";
import styles from "./SentInvitesList.module.css";

/** Turn a resend failure into an honest, no-blame line. The backend 403s an
 *  invite that isn't yours, 404s an unknown code, and 409s one that can't be
 *  re-minted (already accepted, revoked, or still valid) — each gets its own
 *  message; anything else falls through to the generic one. */
function resendErrorMessage(error: unknown, t: TFunction): string {
  const status = error instanceof ApiError ? error.status : 0;
  switch (status) {
    case 403:
      return t("auth:invite.sentList.resendError.notYours");
    case 404:
      return t("auth:invite.sentList.resendError.notFound");
    case 409:
      return t("auth:invite.sentList.resendError.notResendable");
    default:
      return t("auth:invite.sentList.resendError.generic");
  }
}

/** Status filter values: "all" plus the invite lifecycle statuses, in display order. */
type StatusFilter = "all" | SentInviteView["status"];
const STATUS_ORDER: SentInviteView["status"][] = [
  "valid",
  "used",
  "expired",
  "revoked",
];

/** Day + 24h time, e.g. "Jul 30, 2026, 14:32" — one locale-aware call so each
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

/** One sent-invite row: code, status chip, and the send/expiry or accepted line.
 *  A still-Pending invite (`status === "valid"`) also gets a Revoke control. */
function SentInviteRow({
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
  const sent = dateAndTime(fmt, invite.sentAt);
  // `expiresAt` can be null (invite with no set expiry) — fall back to a
  // send-only line rather than printing an "Invalid Date".
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
        <div className={styles.code}>{invite.code}</div>
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

/**
 * The invites the current member has already sent, with live status/expiry.
 * Sourced from useSentInvites (GET /invites in live mode, mock in demo mode).
 * Renders nothing when the member has never sent an invite, to keep the compose
 * page focused for first-time inviters.
 */
export function SentInvitesList() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { data, isLoading } = useSentInvites();
  const revoke = useRevokeInvite();
  const resend = useResendInvite();
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const handleRevoke = (invite: SentInviteView) => {
    revoke.mutate(
      { id: invite.id, code: invite.code },
      {
        onSuccess: () =>
          showToast(t("auth:invite.sentList.revokedToast"), "success"),
      },
    );
  };
  const revokingId =
    revoke.isPending && typeof revoke.variables?.id === "string"
      ? revoke.variables.id
      : null;

  const handleResend = (invite: SentInviteView) => {
    resend.mutate(
      { id: invite.id, code: invite.code },
      {
        onSuccess: () =>
          showToast(t("auth:invite.sentList.resentToast"), "success"),
        onError: (error) => showToast(resendErrorMessage(error, t), "error"),
      },
    );
  };
  const resendingId =
    resend.isPending && typeof resend.variables?.id === "string"
      ? resend.variables.id
      : null;

  // One filter tab per status that actually appears, so an inviter never sees an
  // empty "Revoked" tab. "All" always leads. Counts feed the bold badge.
  const tabs = useMemo<Tab[]>(() => {
    if (!data) return [];
    const present = STATUS_ORDER.filter((status) =>
      data.some((invite) => invite.status === status),
    );
    if (present.length < 2) return [];
    return [
      { id: "all", label: t("auth:invite.sentList.filter.all"), count: data.length },
      ...present.map((status) => ({
        id: status,
        label: t(`auth:invite.sentList.status.${status}`),
        count: data.filter((invite) => invite.status === status).length,
      })),
    ];
  }, [data, t]);

  if (isLoading) {
    return (
      <section className={styles.wrap}>
        <div className={styles.label}>{t("auth:invite.sentList.label")}</div>
        <div className={styles.list}>
          {[0, 1].map((i) => (
            <div className={styles.row} key={i}>
              <div className={styles.main}>
                <SkeletonLine width="45%" />
                <SkeletonLine width="70%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  const shown =
    filter === "all"
      ? data
      : data.filter((invite) => invite.status === filter);

  return (
    <section className={styles.wrap}>
      <button
        type="button"
        className={styles.label}
        aria-expanded={open}
        aria-controls="sent-invites-list"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span>{t("auth:invite.sentList.label")}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <>
          {tabs.length > 0 && (
            <Tabs
              tabs={tabs}
              active={filter}
              onChange={(id) => setFilter(id as StatusFilter)}
              className={styles.filter}
            />
          )}
          <div id="sent-invites-list" className={styles.list}>
            {shown.map((invite, index) => (
              <FadeIn key={invite.code} delay={index * 60}>
                <SentInviteRow
                  invite={invite}
                  t={t}
                  fmt={fmt}
                  onRevoke={handleRevoke}
                  isRevoking={revokingId === invite.id}
                  onResend={handleResend}
                  isResending={resendingId === invite.id}
                />
              </FadeIn>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
