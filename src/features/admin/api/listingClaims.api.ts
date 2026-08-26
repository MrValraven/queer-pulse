import { apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

export type ListingClaimStatus = "pending" | "approved" | "declined";

/**
 * A member's request to take ownership of an existing directory listing, as a
 * moderator triages it. Mirrors `EditSuggestionDTO`'s denormalized-for-display
 * shape (carries the target listing's ref/name, not just its id). `claimant`
 * is nullable — the member who filed it may have since been erased — same as
 * `EditSuggestionDTO.submittedBy`.
 */
export interface ListingClaimDTO {
  id: string;
  listingRef: string;
  listingName: string;
  claimant: MemberRefDTO | null;
  note: string | null;
  status: ListingClaimStatus;
  reviewedBy: string | null;
  /** ISO 8601 timestamp, or null while pending. */
  reviewedAt: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /**
   * The published review turnaround in calendar days, carried on every claim
   * so the queue and the claimant's own status line quote one number
   * (`listing-claim-policy.ts` on the backend owns it).
   */
  reviewTurnaroundDays: number;
  /**
   * ISO 8601 date the claimant was promised a decision by, or null once the
   * claim has been reviewed and the promise no longer applies. This is the
   * queue-agnostic `dueAt` the OPS-04 clock reads, which is why a decided
   * claim stops showing an overdue chip. Derived server-side, never stored.
   */
  expectedDecisionBy: string | null;
  /** Whole days this claim has waited, frozen at its decision date. */
  ageDays: number;
}

/** GET /admin/listings/claims — the pending claim review queue, oldest first.
 *  Moderator/Admin only. */
export const getListingClaims = () =>
  apiGet<ListingClaimDTO[]>("/admin/listings/claims");

/** PATCH /admin/listings/claims/:id — approve or decline a claim. On
 *  approval the backend reassigns the listing's owner to the claimant.
 *  Moderator/Admin only. */
export const patchListingClaim = (
  id: string,
  decision: "approved" | "declined",
) => apiPatch<ListingClaimDTO>(`/admin/listings/claims/${id}`, { decision });
