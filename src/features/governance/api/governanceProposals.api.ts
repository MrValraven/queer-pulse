import { apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `governance` domain returns for the real member-vote
// system (`GET/POST /governance/proposals*`) backing the "two-thirds
// community vote" (council removal) and "the community will vote on it"
// (funding-policy change) promises made elsewhere on this page. Tallies are
// live, computed by the backend from every cast vote — never a hardcoded
// count.

export type GovernanceProposalType = "council_removal" | "funding_change";
export type GovernanceProposalStatus = "open" | "passed" | "failed";
export type GovernanceVoteChoice = "for" | "against";

export interface GovernanceProposalTallyDTO {
  for: number;
  against: number;
  /** 0–100, rounded; 0 when no votes have been cast yet. */
  forPercent: number;
}

export interface GovernanceProposalDTO {
  id: string;
  type: GovernanceProposalType;
  title: string;
  description: string;
  targetMemberId: string | null;
  /** Resolved display ref for `targetMemberId` (council-removal proposals
   *  only), or `null`. */
  targetMember: MemberRefDTO | null;
  status: GovernanceProposalStatus;
  opensAt: string;
  closesAt: string;
  tally: GovernanceProposalTallyDTO;
  /** The signed-in member's own vote, or `null` if they haven't voted. */
  myVote: GovernanceVoteChoice | null;
}

export const getGovernanceProposals = () =>
  apiGet<GovernanceProposalDTO[]>("/governance/proposals");

export const castGovernanceVote = (
  proposalId: string,
  choice: GovernanceVoteChoice,
) =>
  apiPost<GovernanceProposalDTO>(`/governance/proposals/${proposalId}/vote`, {
    choice,
  });
