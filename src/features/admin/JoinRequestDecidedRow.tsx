import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Button, CopyLinkRow } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { declineReasonLabelKey } from "../auth/api/joinRequestDeclineReason";
import { inviteFullUrlFor, inviteUrlFor } from "../../shared/lib/inviteUrl";
import { useReissueJoinRequestInvite } from "./api/useReissueJoinRequestInvite";
import type { JoinRequestView } from "./api/useJoinRequests";
import { joinRequestInviteState } from "./joinRequestInviteState";
import { AdminAvatar, AdminChip } from "./ui";
import rowStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminVerifyDecided.module.css";

/** Turn a reissue failure into an honest, no-blame line. The backend 403s a
 *  caller without the moderator role, 404s a request with no invite on it, and
 *  409s an invite that cannot be re-minted (already used, revoked, or still
 *  valid) — each gets its own message; anything else falls through. */
function reissueErrorMessage(error: unknown, t: TFunction): string {
  const status = error instanceof ApiError ? error.status : 0;
  switch (status) {
    case 403:
      return t("admin:members.verify.invite.reissueError.forbidden");
    case 404:
      return t("admin:members.verify.invite.reissueError.notFound");
    case 409:
      return t("admin:members.verify.invite.reissueError.notReissuable");
    default:
      return t("admin:members.verify.invite.reissueError.generic");
  }
}

/** "20 Jun 2026" — the absolute dates a history row is read for. */
function shortDate(value: string | null, format: (at: Date) => string) {
  if (!value) return null;
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? null : format(at);
}

/**
 * One settled request in the Decided tab: who asked, how to reach them, when
 * they applied and when it was decided, and then the part the tab exists for.
 *
 * An approval keeps its invite link here, with the link's own status and how
 * long it has left, because QueerPulse delivers no email: handing that link
 * over is the reviewer's job, and until this row existed the link lived only in
 * a card held in React state that a refresh threw away. A lapsed link gets a
 * reissue action rather than a dead end.
 */
export function JoinRequestDecidedRow({ item }: { item: JoinRequestView }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const reissueInvite = useReissueJoinRequestInvite();
  const [reissueError, setReissueError] = useState<string | null>(null);

  const isApproved = item.status === "approved";
  const inviteState = joinRequestInviteState(item, t);
  const inviteUrl = item.inviteCode ? inviteFullUrlFor(item.inviteCode) : null;
  const appliedOn = shortDate(item.createdAt, (at) =>
    format.date(at, { day: "numeric", month: "short", year: "numeric" }),
  );
  const decidedOn = shortDate(item.reviewedAt, (at) =>
    format.date(at, { day: "numeric", month: "short", year: "numeric" }),
  );
  const isReissuing = reissueInvite.isPending;

  function reissue() {
    if (isReissuing) return;
    setReissueError(null);
    reissueInvite.mutate(
      { id: item.id },
      {
        onSuccess: () =>
          showToast(
            t("admin:members.verify.invite.reissuedToast", {
              email: item.email,
            }),
            "success",
          ),
        onError: (error) => setReissueError(reissueErrorMessage(error, t)),
      },
    );
  }

  return (
    <div className={rowStyles.row}>
      <AdminAvatar initials={item.initials} tone={item.tone} size="md" />
      <div className={rowStyles.rowMain}>
        <div className={rowStyles.rowTop}>
          <span className={rowStyles.rowName}>{item.name}</span>
          <AdminChip tone={isApproved ? "jade" : "ghost"} dot>
            {t(
              `admin:members.verify.status.${isApproved ? "approved" : "declined"}`,
            )}
          </AdminChip>
        </div>
        <div className={rowStyles.rowMeta}>{item.email}</div>
        <div className={rowStyles.rowDates}>
          {appliedOn
            ? t("admin:members.verify.decided.appliedOn", { date: appliedOn })
            : t("admin:members.verify.appliedRecently")}
          {decidedOn
            ? ` · ${t("admin:members.verify.decided.decidedOn", { date: decidedOn })}`
            : ` · ${t("admin:members.verify.decided.decidedUnknown")}`}
        </div>

        {!isApproved && (
          <div className={rowStyles.rowNote}>
            {t("admin:members.verify.decided.declineReasonLine", {
              reason: t(declineReasonLabelKey(item.declineReason)),
            })}
          </div>
        )}

        {isApproved && inviteState && (
          <div className={styles.invite}>
            <div className={styles.inviteHead}>
              <AdminChip tone={inviteState.chipTone}>
                {inviteState.chipLabel}
              </AdminChip>
              <span className={styles.inviteNote}>{inviteState.note}</span>
            </div>
            {inviteUrl && item.inviteCode && (
              <CopyLinkRow
                tone="paper"
                value={inviteUrl}
                display={inviteUrlFor(item.inviteCode)}
                fieldLabel={t("admin:members.verify.linkFieldLabel")}
                copyLabel={t("admin:members.verify.copyLink")}
                copiedLabel={t("admin:members.verify.copiedLink")}
                copiedToast={t("admin:members.verify.copiedToast")}
                errorToast={t("admin:members.verify.copyFailed")}
              />
            )}
            {inviteState.isReissuable && (
              <Button
                variant="ghost"
                size="md"
                className={styles.reissue}
                disabled={isReissuing}
                onClick={reissue}
              >
                <FiRefreshCw aria-hidden />
                {isReissuing
                  ? t("admin:members.verify.invite.reissuing")
                  : t("admin:members.verify.invite.reissueCta")}
              </Button>
            )}
            {reissueError && (
              <p className={styles.inviteError} role="status">
                {reissueError}
              </p>
            )}
          </div>
        )}

        {isApproved && !inviteState && (
          <div className={rowStyles.rowNote}>
            {t("admin:members.verify.invite.noneMinted")}
          </div>
        )}
      </div>
    </div>
  );
}
