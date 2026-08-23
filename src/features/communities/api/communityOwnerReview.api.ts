import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/** Shortest and longest reason the backend accepts on a filing. */
export const OWNER_REVIEW_REASON_MIN = 20;
export const OWNER_REVIEW_REASON_MAX = 2000;

export type CommunityOwnerReviewStatus =
  "open" | "withdrawn" | "resolved" | "dismissed";

/**
 * One owner-review request. `requestedBy` is null when the moderator who filed
 * it has since erased their account: the request is about the community's
 * governance and outlives whoever raised it.
 */
export interface CommunityOwnerReviewRequestDTO {
  id: string;
  status: CommunityOwnerReviewStatus;
  reason: string | null;
  requestedBy: MemberRefDTO | null;
  createdAt: string;
  resolvedAt: string | null;
}

/**
 * `GET /communities/:slug/owner-review` — always an object, with
 * `request: null` when nothing is open.
 *
 * `needsOwnerReviewAt` is the community's own flag, which the automatic orphan
 * path can also set with no request row behind it, so "flagged" and "has an
 * open request" are genuinely two different states. `canOpen`/`canWithdraw`
 * are computed for the asking viewer, so this client never reimplements the
 * role rules to decide which control to show.
 */
export interface CommunityOwnerReviewStateDTO {
  request: CommunityOwnerReviewRequestDTO | null;
  needsOwnerReviewAt: string | null;
  canOpen: boolean;
  canWithdraw: boolean;
}

export const getCommunityOwnerReview = (slug: string) =>
  apiGet<CommunityOwnerReviewStateDTO>(`/communities/${slug}/owner-review`);

export const openCommunityOwnerReview = (slug: string, reason: string) =>
  apiPost<CommunityOwnerReviewStateDTO>(`/communities/${slug}/owner-review`, {
    reason,
  });

export const withdrawCommunityOwnerReview = (slug: string) =>
  apiDelete<CommunityOwnerReviewStateDTO>(`/communities/${slug}/owner-review`);
