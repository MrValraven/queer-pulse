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
