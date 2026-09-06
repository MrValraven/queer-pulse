import { FiCheck, FiClock, FiKey } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunityDetailPage.module.css";

/**
 * The community hero's membership call to action, in its five states.
 *
 * It used to be a three-way (joined / requested / join), and two of those
 * three were dead ends:
 *
 *  - PRD-140. Somebody holding an invitation was offered the ordinary join
 *    button, so the invitation the community had sent them showed up nowhere
 *    on the page it was an invitation to. They now get "Accept invitation"
 *    and a way to say no.
 *  - PRD-141. The `invite` tier's join button walked an uninvited member
 *    through a three-step wizard to a refusal, because the backend now answers
 *    `invite_required` there. The hero states it up front instead, as a fact
 *    about the community rather than as a failure of the person reading it.
 *  - PRD-148. "Requested" was a disabled label with no way back out. It is now
 *    a real control that opens the withdraw confirm.
 *
 * Every state is live-mode-aware at the call site: demo mode never sets
 * `isInvited` or `isInviteOnlyLocked`, and passes `canWithdrawRequest` false,
 * so the prototype keeps exactly the three states it always had.
 */
export function CommunityHeroActions({
  joined,
  requested,
  isInvited,
  isInviteOnlyLocked,
  canDeclineInvite,
  canWithdrawRequest,
  joinLabel,
  onJoin,
  onLeave,
  onAcceptInvite,
  onDeclineInvite,
  onWithdrawRequest,
}: {
  joined: boolean;
  requested: boolean;
  /** The viewer is not on the roster and holds a pending invitation here. */
  isInvited: boolean;
  /** `invite` tier, no invitation: joining is not something they can do yet. */
  isInviteOnlyLocked: boolean;
  /** The invitation's own id has arrived, so "Decline" has something to send. */
  canDeclineInvite: boolean;
  /** Live mode only: the demo membership store cannot take a request back. */
  canWithdrawRequest: boolean;
  joinLabel: string;
  onJoin: () => void;
  onLeave: () => void;
  onAcceptInvite: () => void;
  onDeclineInvite: () => void;
  onWithdrawRequest: () => void;
}) {
  const { t } = useTranslation();

  if (joined) {
    return (
      <Button variant="jade" onClick={onLeave}>
        <FiCheck aria-hidden /> {t("communities:detail.joined")}
      </Button>
    );
  }

  if (isInvited) {
    return (
      <>
        <Button variant="primary" onClick={onAcceptInvite}>
          {t("communities:detail.invite.accept")}
        </Button>
        <Button
          variant="ghost-dark"
          onClick={onDeclineInvite}
          disabled={!canDeclineInvite}
        >
          {t("communities:detail.invite.decline")}
        </Button>
      </>
    );
  }

  if (requested) {
    return (
      <Button
        variant="ghost-dark"
        onClick={canWithdrawRequest ? onWithdrawRequest : undefined}
        disabled={!canWithdrawRequest}
        aria-label={
          canWithdrawRequest
            ? t("communities:detail.withdraw.ariaLabel")
            : undefined
        }
      >
        <FiClock aria-hidden /> {t("communities:detail.requested")}
      </Button>
    );
  }

  if (isInviteOnlyLocked) {
    // Deliberately not a button. There is no action here to offer: only a
    // moderator of this community can open the door, and a disabled control
    // would read as "try again later" rather than as "this is how it works".
    return (
      <p className={styles.inviteOnlyNote}>
        <span className={styles.inviteOnlyLabel}>
          <FiKey aria-hidden /> {t("communities:detail.join.inviteOnly")}
        </span>
        <span className={styles.inviteOnlyHint}>
          {t("communities:detail.join.inviteOnlyHint")}
        </span>
      </p>
    );
  }

  return (
    <Button variant="primary" onClick={onJoin}>
      {joinLabel}
    </Button>
  );
}
