import { useTranslation } from "../../shared/i18n/useTranslation";
import { CosignRow } from "./CosignRow";
import { ProposalOutcome } from "./ProposalOutcome";
import { ProposalStatusBadge, ProposalTypeBadge } from "./ProposalBadges";
import { ProposalVoteRow } from "./ProposalVoteRow";
import type { GovernanceProposalDTO } from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

/**
 * One proposal, in whichever of its lifecycle states it is in. The head,
 * title, description and attribution are shared; what sits under them is the
 * state's own block: a co-signature drive, a live vote, or the resolved
 * outcome.
 */
export function ProposalCard({
  proposal,
}: {
  proposal: GovernanceProposalDTO;
}) {
  const { t } = useTranslation();
  const isGatheringSupport =
    proposal.status === "gathering" || proposal.status === "screening";
  const isVotingOpen = proposal.status === "open";
  const proposerName = proposal.proposedByMember
    ? `${proposal.proposedByMember.firstName} ${proposal.proposedByMember.lastName}`.trim()
    : null;

  return (
    <article className={styles.proposalCard}>
      <div className={styles.proposalCardHead}>
        <ProposalTypeBadge type={proposal.type} />
        <ProposalStatusBadge status={proposal.status} />
      </div>
      <h3 className={styles.proposalTitle}>{proposal.title}</h3>
      <p className={styles.proposalDesc}>{proposal.description}</p>
      {proposerName && (
        <p className={styles.proposalProposer}>
          {t("governance:sections.proposals.raisedBy", { name: proposerName })}
        </p>
      )}
      {proposal.targetMember && (
        <p className={styles.proposalTarget}>
          {t("governance:sections.proposals.targetSeat", {
            name: `${proposal.targetMember.firstName} ${proposal.targetMember.lastName}`.trim(),
          })}
        </p>
      )}
      {isGatheringSupport ? (
        <CosignRow proposal={proposal} />
      ) : isVotingOpen ? (
        <ProposalVoteRow proposal={proposal} />
      ) : (
        <ProposalOutcome proposal={proposal} />
      )}
    </article>
  );
}
