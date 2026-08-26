import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `governance` domain returns for the real member-vote
// system (`GET/POST /governance/proposals*`) backing the "two-thirds
// community vote" (council removal) and "the community will vote on it"
// (funding-policy change) promises made elsewhere on this page. Tallies are
// live, computed by the backend from every cast vote — never a hardcoded
// count.
//
// GOV-01 adds the member-raised route: any member files a motion, it gathers
// co-signatures, a reviewer screens it, and only then does it open for
// voting. That adds `member_motion` as a type and four lifecycle states in
// front of the existing open/passed/failed ones.

export type GovernanceProposalType =
  "council_removal" | "funding_change" | "member_motion";

/**
 * Lifecycle of a proposal.
 *
 * - `gathering` — a member motion collecting co-signatures.
 * - `screening` — the threshold was reached; a reviewer is looking at it.
 * - `open` — voting is live.
 * - `passed` / `failed` — voting closed with an outcome.
 * - `rejected` — screening turned it down (see `screeningNote`).
 * - `lapsed` — the gathering window closed short of the threshold.
 */
export type GovernanceProposalStatus =
  | "gathering"
  | "screening"
  | "open"
  | "passed"
  | "failed"
  | "rejected"
  | "lapsed";

export type GovernanceVoteChoice = "for" | "against";

export interface GovernanceProposalTallyDTO {
  for: number;
  against: number;
  /** 0–100, rounded; 0 when no votes have been cast yet. */
  forPercent: number;
  /**
   * Ballots that had to be cast for the result to count, or `null` when the
   * proposal carries no quorum rule. Deliberately separate from the
   * two-thirds passing threshold: a proposal can clear two-thirds of the
   * votes cast and still fail because too few members voted at all.
   */
  quorumRequired: number | null;
  /** Ballots actually cast (`for + against`), the reading quorum is met against. */
  totalVotes: number;
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
  /** Co-signatures gathered so far, the proposer's founding one included. */
  cosignatureCount: number;
  /** Signatures needed before screening, or `null` for a council-raised proposal. */
  cosignatureThreshold: number | null;
  /** True when the signed-in member has already put their name to this motion. */
  hasCosigned: boolean;
  /** The member who raised the motion, for a `member_motion`. */
  proposedByMemberId: string | null;
  /** Resolved display ref for `proposedByMemberId`, or `null`. */
  proposedByMember: MemberRefDTO | null;
  /** When the co-signature window closes, or `null` outside `gathering`. */
  gatheringClosesAt: string | null;
  /** The reviewer's reason for rejecting a screened motion, or `null`. */
  screeningNote: string | null;
  /** True when a closed proposal failed because turnout missed quorum. */
  failedForQuorum: boolean;
}

export interface ComposeGovernanceMotionBody {
  title: string;
  description: string;
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

/** Files a new member motion, which opens in `gathering`. */
export const composeGovernanceMotion = (body: ComposeGovernanceMotionBody) =>
  apiPost<GovernanceProposalDTO>("/governance/motions", body);

/** Adds the signed-in member's co-signature to a gathering motion. */
export const cosignGovernanceProposal = (proposalId: string) =>
  apiPost<GovernanceProposalDTO>(
    `/governance/proposals/${proposalId}/cosign`,
    {},
  );

/** Withdraws the signed-in member's co-signature. */
export const withdrawGovernanceCosignature = (proposalId: string) =>
  apiDelete<GovernanceProposalDTO>(
    `/governance/proposals/${proposalId}/cosign`,
  );
