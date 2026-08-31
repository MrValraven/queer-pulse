import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityBanEvasionQueue } from "./api/useCommunityBanEvasion";
import type { ModRequest } from "./community.model";
import { CommunityBanEvasionFlag } from "./CommunityBanEvasionFlag";
import { JoinRequestApplicantCard } from "./JoinRequestApplicantCard";
import { ModJoinRequestDecline } from "./ModJoinRequestDecline";
import type { JoinRequestDecision } from "./joinRequestReview.data";
import styles from "./ModJoinRequestRow.module.css";

/**
 * One row of the join queue: who is asking, and the two answers a moderator
 * can give. Approve stays a single tap; decline opens the confirm step in
 * place (rather than a modal over the queue), so the moderator can still see
 * the applicant they are answering while they choose the kind of no and write
 * the note that reaches them.
 *
 * The ban-evasion flag sits between the applicant and the answers on purpose:
 * it is context for the decision, and it belongs where a moderator reads before
 * they press. It stays ONE BIT about THIS community's own bans (PRD-31), and it
 * is absent from most rows, because most rows are a person asking to join.
 */
export function ModJoinRequestRow({
  request,
  isPending,
  banEvasion,
  onResolve,
}: {
  request: ModRequest;
  /** True while a decision for this queue is in flight. */
  isPending: boolean;
  /** The queue's batched ban-evasion answers. Optional so a surface that has
   *  no such read (a test harness, a future non-community queue) still renders
   *  the row; the flag is then simply absent, the same as a clear row. */
  banEvasion?: CommunityBanEvasionQueue;
  onResolve: (id: string, name: string, decision: JoinRequestDecision) => void;
}) {
  const { t } = useTranslation();
  const [isDeclining, setIsDeclining] = useState(false);
  // The queue hides a resolved row optimistically, but the row stays mounted
  // for the tick in between, so a second tap is latched here rather than
  // relying on the parent's own pending flag.
  const [hasAnswered, setHasAnswered] = useState(false);
  const applicantName = request.person.name;

  const answer = (decision: JoinRequestDecision) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    onResolve(request.id, applicantName, decision);
  };

  return (
    <div className={styles.row}>
      <JoinRequestApplicantCard request={request} />

      {banEvasion && (
        <CommunityBanEvasionFlag
          applicantName={applicantName}
          state={banEvasion.rowState(request.id)}
          isEscalating={banEvasion.escalatingId === request.id}
          onRetry={banEvasion.retry}
          onEscalate={(note) => banEvasion.escalate(request.id, note)}
        />
      )}

      {isDeclining ? (
        <ModJoinRequestDecline
          name={applicantName}
          isPending={isPending || hasAnswered}
          onConfirm={answer}
          onCancel={() => setIsDeclining(false)}
        />
      ) : (
        <div className={styles.actions}>
          <Button
            variant="jade"
            disabled={hasAnswered}
            onClick={() => answer({ isApproved: true })}
          >
            <FiCheck aria-hidden />{" "}
            {t("communities:detail.modtools.joinRequests.approveCta")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={styles.declineBtn}
            onClick={() => setIsDeclining(true)}
          >
            <FiX aria-hidden />{" "}
            {t("communities:detail.modtools.joinRequests.declineCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
