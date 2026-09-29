import { useEffect, useRef, useState, type RefObject } from "react";
import { FiCheckCircle, FiClock, FiKey } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { communityPath } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccessTier, JoinRequestStatus } from "./api/communities.api";
import { useWithdrawJoinRequestWithFeedback } from "./api/useWithdrawJoinRequestWithFeedback";
import { WithdrawJoinRequestModal } from "./WithdrawJoinRequestModal";
import styles from "./CommunityGateModal.module.css";

type GateBranch =
  | "invited"
  | "pending"
  | "approved"
  | "request"
  | "waitingForInvitations"
  | "inviteOnly";

/** Which of the gate's lines applies, in the order `GateAction`'s doc sets. */
function gateBranchFor({
  accessTier,
  joinRequestStatus,
  hasStandingInvitation,
  hasSeenPendingRequest,
  isInvitesLoading,
}: {
  accessTier: AccessTier;
  joinRequestStatus: JoinRequestStatus | null;
  hasStandingInvitation: boolean;
  hasSeenPendingRequest: boolean;
  isInvitesLoading: boolean;
}): GateBranch {
  if (hasStandingInvitation) return "invited";
  if (joinRequestStatus === "pending") return "pending";
  if (joinRequestStatus === "approved" && hasSeenPendingRequest) {
    return "approved";
  }
  if (accessTier === "request") return "request";
  if (isInvitesLoading) return "waitingForInvitations";
  return "inviteOnly";
}

/**
 * Keyboard and screen-reader focus follows the gate's state (design M2).
 *
 * The control a member pressed often unmounts with the state it belonged to:
 * "Ask to join" becomes the pending line once the wizard files the request,
 * and Withdraw becomes "Ask to join" once the withdraw lands. The dialog above
 * hands focus back to a button that is gone, so it falls to `<body>`. When
 * the branch changes after the gate first settled, focus moves to the new
 * status line, which also reads the new state aloud.
 *
 * While the wizard or the withdraw confirm is still open on top, the move
 * waits for it to close, so the gate never pulls focus out of a dialog the
 * member is still reading. The first settled branch never takes focus: the
 * invitations shelf landing on open is loading, and the gate's own initial
 * focus stands.
 */
function useStatusLineFocus(
  branch: GateBranch,
  isInvitesLoading: boolean,
  isCoveredByDialog: boolean,
) {
  const statusLineRef = useRef<HTMLParagraphElement>(null);
  const settledBranchRef = useRef<GateBranch | null>(null);
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (isInvitesLoading) return;
    if (settledBranchRef.current === null) {
      settledBranchRef.current = branch;
      return;
    }
    if (settledBranchRef.current !== branch) {
      settledBranchRef.current = branch;
      shouldFocusRef.current = true;
    }
    if (shouldFocusRef.current && !isCoveredByDialog) {
      shouldFocusRef.current = false;
      statusLineRef.current?.focus();
    }
  }, [branch, isInvitesLoading, isCoveredByDialog]);

  return statusLineRef;
}

/**
 * The applicant's own pending request (PRD-411): a status line with its clock,
 * plus the way to take the request back, in both modes. Live withdraws
 * through the server with its toasts; demo takes the request out of the
 * session membership store, so the prototype shows the same way out.
 *
 * The trigger carries its own accessible name, which starts with its visible
 * label and adds the community, so it never shares a name with the confirm's
 * commit button.
 */
function PendingRequestAction({
  communityName,
  slug,
  statusLineRef,
  isConfirmingWithdraw,
  onConfirmingWithdrawChange,
}: {
  communityName: string;
  slug: string;
  statusLineRef: RefObject<HTMLParagraphElement | null>;
  isConfirmingWithdraw: boolean;
  onConfirmingWithdrawChange: (isConfirming: boolean) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { withdrawRequest } = useCommunityMembership();
  const { showToast } = useToast();
  const withdrawFlow = useWithdrawJoinRequestWithFeedback(slug);

  const closeConfirm = () => onConfirmingWithdrawChange(false);
  const confirmWithdraw = () => {
    if (demoMode) {
      withdrawRequest(slug);
      showToast(t("communities:detail.withdraw.doneToast"), "success");
      closeConfirm();
      return;
    }
    withdrawFlow.withdraw(closeConfirm);
  };

  return (
    <div className={styles.action}>
      <p className={styles.status} ref={statusLineRef} tabIndex={-1}>
        <FiClock aria-hidden />
        <span>{t("communities:gate.requested.line")}</span>
      </p>
      <Button
        variant="ghost"
        aria-label={t("communities:gate.requested.withdrawAriaLabel", {
          name: communityName,
        })}
        onClick={() => onConfirmingWithdrawChange(true)}
      >
        {t("communities:gate.requested.withdraw")}
      </Button>
      {isConfirmingWithdraw && (
        <WithdrawJoinRequestModal
          name={communityName}
          pending={withdrawFlow.mutation.isPending}
          onConfirm={confirmWithdraw}
          onClose={closeConfirm}
        />
      )}
    </div>
  );
}

/**
 * The one line and the one action a gate card offers, keyed first on the
 * viewer's standing INVITATION and only then on the tier: somebody invited to
 * any gated community holds a real invitation and must be offered Accept,
 * whatever its tier, which is what `CommunityHeroActions` already does on the
 * detail hero. That is why the invitation check sits above the tier branches.
 *
 * Next comes the viewer's own pending request (PRD-411). An applicant who
 * already asked sees that their request is with the moderators, plus a way to
 * take it back, so the card stops offering an "Ask to join" the server would
 * refuse. A declined request falls through to the tier branches: a declined
 * applicant may ask again once their wait is over, and the server owns that
 * date.
 *
 * An approved request gets its own line and a way in, but only when this gate
 * watched it go from pending to approved (a withdraw that lost the race to a
 * moderator's yes, or an approval that landed while the gate was open). The
 * card reports the newest request of any status, so an old approval also
 * belongs to somebody who later left or was removed; that viewer falls
 * through to the tier branches like any other outsider.
 *
 * Accept and Ask to join open the SAME wizard. The invitation is spent by the
 * join endpoint, and the wizard is what puts the house rules in front of
 * somebody before they agree to them.
 *
 * Decline is deliberately absent: declining fires a notification and is worth
 * a moment's thought, and the invitations shelf on the page underneath is one
 * dismissal away.
 */
export function GateAction({
  accessTier,
  communityName,
  slug,
  joinRequestStatus,
  hasStandingInvitation,
  isInvitesLoading,
  isWizardOpen,
  onAct,
}: {
  accessTier: AccessTier;
  communityName: string;
  slug: string;
  joinRequestStatus: JoinRequestStatus | null;
  hasStandingInvitation: boolean;
  isInvitesLoading: boolean;
  /** The join wizard is open over the gate, so focus stays with it. */
  isWizardOpen: boolean;
  onAct: () => void;
}) {
  const { t } = useTranslation();
  const [isConfirmingWithdraw, setIsConfirmingWithdraw] = useState(false);
  const [hasSeenPendingRequest, setHasSeenPendingRequest] = useState(
    joinRequestStatus === "pending",
  );
  if (joinRequestStatus === "pending" && !hasSeenPendingRequest) {
    setHasSeenPendingRequest(true);
  }

  const branch = gateBranchFor({
    accessTier,
    joinRequestStatus,
    hasStandingInvitation,
    hasSeenPendingRequest,
    isInvitesLoading,
  });
  const statusLineRef = useStatusLineFocus(
    branch,
    isInvitesLoading,
    isWizardOpen || isConfirmingWithdraw,
  );

  if (branch === "invited") {
    return (
      <div className={styles.action}>
        <p className={styles.body} ref={statusLineRef} tabIndex={-1}>
          {t("communities:gate.invited.line")}
        </p>
        <Button variant="primary" onClick={onAct}>
          {t("communities:gate.invited.action")}
        </Button>
      </div>
    );
  }

  if (branch === "pending") {
    return (
      <PendingRequestAction
        communityName={communityName}
        slug={slug}
        statusLineRef={statusLineRef}
        isConfirmingWithdraw={isConfirmingWithdraw}
        onConfirmingWithdrawChange={setIsConfirmingWithdraw}
      />
    );
  }

  if (branch === "approved") {
    return (
      <div className={styles.action}>
        <p className={styles.status} ref={statusLineRef} tabIndex={-1}>
          <FiCheckCircle aria-hidden />
          <span>{t("communities:gate.approved.line")}</span>
        </p>
        <Button variant="primary" to={communityPath(slug)}>
          {t("communities:gate.approved.action")}
        </Button>
      </div>
    );
  }

  if (branch === "request") {
    return (
      <div className={styles.action}>
        <p className={styles.body} ref={statusLineRef} tabIndex={-1}>
          {t("communities:gate.request.line")}
        </p>
        <Button variant="primary" onClick={onAct}>
          {t("communities:gate.request.action")}
        </Button>
      </div>
    );
  }

  // The shelf has not landed yet, so whether an invitation exists is unknown.
  // The line goes up and the action waits: nothing here may offer to accept an
  // invitation whose id has not arrived.
  if (branch === "waitingForInvitations") {
    return (
      <div className={styles.action}>
        <p className={styles.body}>
          {t("communities:detail.join.inviteOnlyHint")}
        </p>
      </div>
    );
  }

  // Invitation only, and this viewer holds none. Deliberately a note: there is
  // no action to offer, and a disabled control would read as "try again
  // later" when the truth is "this is how it works". Same reasoning
  // `CommunityHeroActions` states for the hero's version of this note.
  return (
    <p className={styles.inviteOnly} ref={statusLineRef} tabIndex={-1}>
      <span className={styles.inviteOnlyLabel}>
        <FiKey aria-hidden /> {t("communities:detail.join.inviteOnly")}
      </span>
      <span className={styles.body}>
        {t("communities:detail.join.inviteOnlyHint")}
      </span>
    </p>
  );
}
