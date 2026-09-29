import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Button, CopyLinkRow } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { inviteFullUrlFor, inviteUrlFor } from "../../shared/lib/inviteUrl";
import { useReissueJoinRequestInvite } from "./api/useReissueJoinRequestInvite";
import type { JoinRequestView } from "./api/useJoinRequests";
import type { JoinRequestInviteState } from "./joinRequestInviteState";
import { JoinRequestRevokeInviteAction } from "./JoinRequestRevokeInviteAction";
import { WelcomeEmailCopyGroup } from "./emailTemplates/WelcomeEmailCopyGroup";
import styles from "./AdminVerifyDecided.module.css";

/** Turn a reissue failure into an honest, no-blame line. The backend 403s a
 *  caller without the moderator role, 404s a request with no invite on it, and
 *  409s an invite that cannot be re-minted (already used, revoked, or still
 *  valid): each gets its own message; anything else falls through. */
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

/**
 * The invite an approval minted, as the expanded decided row shows it: what
 * the link can still do, the link itself, the welcome email to paste it into,
 * and the one action its state allows.
 *
 * QueerPulse delivers no email, so handing this link over is the reviewer's
 * job. A lapsed link gets a reissue, and a live one can be revoked if it went
 * astray. The two never apply at once, so the action row holds at most one
 * button, set apart from the copy tools so a destructive press is never one
 * slip away from a copy.
 */
export function JoinRequestDecidedInvitePanel({
  item,
  inviteState,
}: {
  item: JoinRequestView;
  inviteState: JoinRequestInviteState;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reissueInvite = useReissueJoinRequestInvite();
  const [reissueError, setReissueError] = useState<string | null>(null);

  const inviteUrl = item.inviteCode ? inviteFullUrlFor(item.inviteCode) : null;
  const isReissuing = reissueInvite.isPending;
  const isRevocable = item.inviteStatus === "valid";
  const hasInviteAction = inviteState.isReissuable || isRevocable;

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
    <div className={styles.invite}>
      {/* The link's chip already sits in the row summary above, so the
          expanded head carries only the sentence about what to do next. */}
      <div className={styles.inviteHead}>
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
      <WelcomeEmailCopyGroup item={item} />
      {hasInviteAction && (
        <div className={styles.inviteActions}>
          {inviteState.isReissuable && (
            <Button
              variant="ghost"
              size="md"
              disabled={isReissuing}
              onClick={reissue}
            >
              <FiRefreshCw aria-hidden />
              {isReissuing
                ? t("admin:members.verify.invite.reissuing")
                : t("admin:members.verify.invite.reissueCta")}
            </Button>
          )}
          <JoinRequestRevokeInviteAction item={item} />
        </div>
      )}
      {reissueError && (
        <p className={styles.inviteError} role="status">
          {reissueError}
        </p>
      )}
    </div>
  );
}
