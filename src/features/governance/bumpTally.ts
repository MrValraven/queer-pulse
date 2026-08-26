import type {
  GovernanceProposalTallyDTO,
  GovernanceVoteChoice,
} from "./api/governanceProposals.api";

/**
 * Recomputes the tally as if `choice` had just been added — demo mode's
 * local, non-persisted optimistic bump (mirrors `PlannedCard`'s `count`
 * calc in the Roadmap page). Never used in live mode, where the server's
 * response is the source of truth.
 */
export function bumpTally(
  tally: GovernanceProposalTallyDTO,
  choice: GovernanceVoteChoice,
): GovernanceProposalTallyDTO {
  const forCount = tally.for + (choice === "for" ? 1 : 0);
  const againstCount = tally.against + (choice === "against" ? 1 : 0);
  const total = forCount + againstCount;
  return {
    ...tally,
    for: forCount,
    against: againstCount,
    forPercent: total === 0 ? 0 : Math.round((forCount / total) * 100),
    totalVotes: total,
  };
}
