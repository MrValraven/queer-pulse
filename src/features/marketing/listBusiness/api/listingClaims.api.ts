import { apiGet } from "../../../../shared/api/client";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// The claimant's own side of "claim this listing". The moderator's side lives
// in `features/admin/api/listingClaims.api.ts` and reads a different endpoint;
// this pair is owner-facing and needs no privileged role.

/** Review lifecycle of a claim, straight off the backend enum
 *  (`ListingClaimStatus` in `listings/entities/listing-claim.entity.ts`). */
export type ListingClaimStatus = "pending" | "approved" | "declined";

/**
 * One of the caller's own ownership claims, as `GET /listings/claims/mine`
 * returns it (newest first).
 *
 * Every waiting figure on here is the SERVER's: `ageDays` and
 * `expectedDecisionBy` are derived from the claim's filing date against the
 * published turnaround, and freeze once the claim is reviewed. The frontend
 * renders them and never recomputes them, so the promise the claim form made
 * and the promise the status line counts down against can never drift apart.
 *
 * `claimant` is always `null` on this route: the caller is the claimant, so the
 * backend does not resolve a member reference it would only be handing back to
 * its owner. The field is kept because it is part of the shared claim DTO.
 */
export interface MyListingClaimDTO {
  id: string;
  /** The listing's human-readable business reference, e.g. `QPL-2026-0007`.
   *  The ownership key: `GET/PATCH/DELETE /listings/:ref` all take it. */
  listingRef: string;
  /**
   * The listing's public url segment, which is what `/local/directory/:slug`
   * resolves. Distinct from `listingRef` and never interchangeable with it,
   * so a claim links to exactly the listing it targets rather than to a name
   * search that picks the wrong business when two share a name.
   *
   * Always present: the backend skips a claim whose listing has been
   * hard-deleted, so a claim in this list always has a listing behind it.
   */
  listingSlug: string;
  listingName: string;
  claimant: null;
  /** Free text the claimant sent the moderators, if they wrote any. */
  note: string | null;
  status: ListingClaimStatus;
  reviewedBy: string | null;
  /** ISO 8601 timestamp, or `null` while pending. */
  reviewedAt: string | null;
  /** ISO 8601 timestamp of when the claim was filed. */
  createdAt: string;
  /** The published turnaround in calendar days, carried per claim. */
  reviewTurnaroundDays: number;
  /** ISO 8601 date a decision was promised by, or `null` once reviewed. */
  expectedDecisionBy: string | null;
  /** Whole days the claim has been waiting; frozen at the decision date. */
  ageDays: number;
}

/**
 * What the claim flow is allowed to promise: the review turnaround and the
 * evidence that actually helps a moderator.
 *
 * Server-owned copy. There is no i18n layer on the backend, so `evidenceHints`
 * arrives as ready-to-render English sentences and is rendered as written,
 * exactly like the report-severity acknowledgements. That is the repo's
 * standing scope rule: chrome ships translated, API-served content does not.
 */
export interface ListingClaimPolicyDTO {
  reviewTurnaroundDays: number;
  evidenceHints: string[];
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

/** GET /listings/claims/mine: the caller's own claims, newest first. */
export const getMyListingClaims = () =>
  apiGet<MyListingClaimDTO[]>("/listings/claims/mine");

/** GET /listings/claim-policy: the published turnaround + evidence hints. */
export const getListingClaimPolicy = () =>
  apiGet<ListingClaimPolicyDTO>("/listings/claim-policy");
