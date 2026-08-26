import { apiGet, apiPost } from "../../../shared/api/client";
import type { GovernanceProposalDTO } from "./governanceProposals.api";

/**
 * The screening half of GOV-01: a member motion that cleared its
 * co-signature threshold lands in `screening` and waits for a reviewer to
 * either open it for voting (approve, with a voting window) or turn it down
 * with a reason the public page then shows.
 *
 * These endpoints live under `/admin/governance/*` and are role-gated
 * server-side. They sit here rather than under `features/admin/api` because
 * they return the same `GovernanceProposalDTO` the public page reads, and
 * both surfaces share one react-query cache key.
 */

export interface ApproveGovernanceMotionBody {
  /** ISO timestamp voting opens. */
  opensAt: string;
  /** ISO timestamp voting closes. */
  closesAt: string;
}

export interface RejectGovernanceMotionBody {
  /** The reviewer's reason, shown publicly as `screeningNote`. */
  note: string;
}

/** Motions awaiting review, newest co-signature drive first. */
export const getAdminGovernanceMotions = () =>
  apiGet<GovernanceProposalDTO[]>("/admin/governance/motions?status=screening");

/** Opens a screened motion for voting over the given window. */
export const approveGovernanceMotion = (
  motionId: string,
  body: ApproveGovernanceMotionBody,
) =>
  apiPost<GovernanceProposalDTO>(
    `/admin/governance/motions/${motionId}/approve`,
    body,
  );

/** Turns a screened motion down, recording the public reason. */
export const rejectGovernanceMotion = (
  motionId: string,
  body: RejectGovernanceMotionBody,
) =>
  apiPost<GovernanceProposalDTO>(
    `/admin/governance/motions/${motionId}/reject`,
    body,
  );
