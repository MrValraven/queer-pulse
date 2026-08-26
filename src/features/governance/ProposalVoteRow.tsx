import { useState } from "react";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ProposalTally } from "./ProposalTally";
import { bumpTally } from "./bumpTally";
import { useGovernanceProposalVote } from "./api/useGovernanceProposals";
import type {
  GovernanceProposalDTO,
  GovernanceVoteChoice,
} from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

/**
 * The live half of a proposal card: the tally (bumped locally in demo mode so
 * a demo vote registers visibly), the closing date, and the two vote
 * controls. Voting is one-way — once a choice is cast both buttons lock, and
 * the cast one keeps the filled jade/plum variant.
 */
export function ProposalVoteRow({
  proposal,
}: {
  proposal: GovernanceProposalDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode, vote: castVote } = useGovernanceProposalVote();
  const [localChoice, setLocalChoice] = useState<GovernanceVoteChoice | null>(
    null,
  );

  const myChoice = proposal.myVote ?? localChoice;
  const displayTally =
    demoMode && localChoice && !proposal.myVote
      ? bumpTally(proposal.tally, localChoice)
      : proposal.tally;

  function handleVote(choice: GovernanceVoteChoice) {
    if (myChoice) return;
    setLocalChoice(choice);
    if (!demoMode) {
      castVote(
        { proposalId: proposal.id, choice },
        { onError: () => setLocalChoice(null) },
      );
    }
  }

  return (
    <>
      <ProposalTally tally={displayTally} />
      <p className={styles.proposalCloses}>
        {t("governance:sections.proposals.closes", {
          date: fmt.date(new Date(proposal.closesAt)),
        })}
      </p>
      {/* The shared <Button>, not hand-rolled <button>s: the cast vote
          reads as a filled jade/plum pill and the untaken option stays a
          ghost outline, with the design system's focus + disabled states
          instead of a local reimplementation of them. */}
      <div className={styles.proposalVoteRow}>
        <Button
          type="button"
          size="sm"
          variant={myChoice === "for" ? "jade" : "ghost"}
          onClick={() => handleVote("for")}
          disabled={!!myChoice}
          aria-pressed={myChoice === "for"}
        >
          <FiThumbsUp aria-hidden />
          {t("governance:sections.proposals.voteFor")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={myChoice === "against" ? "plum" : "ghost"}
          onClick={() => handleVote("against")}
          disabled={!!myChoice}
          aria-pressed={myChoice === "against"}
        >
          <FiThumbsDown aria-hidden />
          {t("governance:sections.proposals.voteAgainst")}
        </Button>
      </div>
      {myChoice && (
        <p className={styles.proposalVotedNote}>
          {t(
            myChoice === "for"
              ? "governance:sections.proposals.votedFor"
              : "governance:sections.proposals.votedAgainst",
          )}
        </p>
      )}
    </>
  );
}
