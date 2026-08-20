import { apiPost } from "../../../shared/api/client";
import type {
  GovernanceProposalDTO,
  GovernanceProposalType,
} from "../../governance/api/governanceProposals.api";

// ── Admin create (COM-1) ────────────────────────────────────────────────────
// `POST /governance/proposals` — admin-only write. Reads reuse the public
// `GovernanceProposalDTO`/`getGovernanceProposals`
// (`features/governance/api/governanceProposals.api`) directly, mirroring how
// `AdminGovernancePage` already imports `publishGovernanceOverview` from the
// public governance API module — this file only adds the admin-only write.

export interface CreateGovernanceProposalBody {
  type: GovernanceProposalType;
  title: string;
  description: string;
  /** Required for `council_removal`, ignored for `funding_change`. */
  targetMemberId?: string;
  opensAt: string;
  closesAt: string;
}

export const createGovernanceProposal = (body: CreateGovernanceProposalBody) =>
  apiPost<GovernanceProposalDTO>("/governance/proposals", body);
