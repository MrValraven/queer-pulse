import type {
  AdminReadingGroupProposalDTO,
  ReadingGroupProposalDecision,
} from "./api/adminReadingGroupProposals.api";

/**
 * Whether `decision` can currently be taken on `proposal`, mirroring the
 * backend's conditional-update guards in `AdminReadingGroupProposalsService`
 * so the row never offers an action the server would answer with a 409.
 *
 * `approve` is available whenever the proposal is not already approved (a
 * second approve on a proposal that already created a community is an
 * idempotent no-op on the backend). `decline` is only available while the
 * proposal is still pending. `archive` is available only for a proposal that
 * never created a community, and only while it sits pending or declined.
 */
export function isDecisionAvailable(
  proposal: Pick<
    AdminReadingGroupProposalDTO,
    "status" | "createdCommunitySlug"
  >,
  decision: ReadingGroupProposalDecision,
): boolean {
  switch (decision) {
    case "approve":
      return proposal.status !== "approved";
    case "decline":
      return proposal.status === "pending";
    case "archive":
      return (
        proposal.createdCommunitySlug === null &&
        (proposal.status === "pending" || proposal.status === "declined")
      );
  }
}
