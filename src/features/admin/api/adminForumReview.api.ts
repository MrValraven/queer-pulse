import { ApiError, apiGet, apiPost } from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/contracts/contracts";
import type { ForumThreadResponse } from "../../forum/api/forum.api";
import type { VerificationLevel } from "../../economy/api/verification.api";

/**
 * The staff forum review queue (PRD-461): `/admin/forum/review` and
 * `/admin/forum/threads/:slug/review` on `AdminForumController`, open to the
 * moderator and admin roles with no staff grant. This file owns the wire shape
 * only; the controller refuses everyone else.
 */

/** A community a queued thread was written in, when the response names one. */
export interface AdminForumReviewCommunity {
  slug: string;
  name: string;
}

/** What a reviewer needs to judge who is asking for money. Sent on
 *  fundraiser rows only (Plan 1, spec delta 11). */
export interface AdminFundingReview {
  linkHost: string;
  posterVerificationLevel: VerificationLevel;
  /** Whole days since the poster's account was created. */
  posterAccountAgeDays: number;
}

/**
 * One thread waiting on a decision. The ordinary thread response, read with the
 * moderator view: `author` is the real author even when `isAnonymous` is true,
 * and `publishedAt` may sit in the future when the author also scheduled it.
 *
 * `community` is optional because the thread response does not carry it today;
 * the row renders the community line only when it is present.
 */
export interface AdminForumReviewThread extends ForumThreadResponse {
  community?: AdminForumReviewCommunity | null;
  /** Fundraiser checks, set on ask rows only (`funding` arrives from
   *  `ForumThreadResponse`). */
  fundingReview?: AdminFundingReview | null;
}

/** The two verbs the review route accepts (`ReviewThreadDto.decision`). */
export type ForumReviewDecision = "approve" | "reject";

/** The reviewer's note ceiling, matching `ReviewThreadDto.note`. */
export const FORUM_REVIEW_NOTE_MAX_LENGTH = 280;

/** GET /admin/forum/review?cursor=: a cursor page of threads awaiting review,
 *  newest first. */
export async function getForumReviewQueue(
  cursor?: string,
): Promise<Paginated<AdminForumReviewThread>> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const queryString = params.toString();
  const response = await apiGet<
    AdminForumReviewThread[] | Paginated<AdminForumReviewThread>
  >(`/admin/forum/review${queryString ? `?${queryString}` : ""}`);
  return toPage(response);
}

/**
 * POST /admin/forum/threads/:slug/review: approve or reject a held thread.
 * The note is trimmed and capped at 280 characters; a blank note is left out of
 * the body entirely. A thread that is no longer pending answers 409.
 */
export function reviewForumThread(
  slug: string,
  decision: ForumReviewDecision,
  note?: string,
) {
  const trimmedNote = note?.trim().slice(0, FORUM_REVIEW_NOTE_MAX_LENGTH);
  return apiPost<AdminForumReviewThread>(
    `/admin/forum/threads/${encodeURIComponent(slug)}/review`,
    trimmedNote ? { decision, note: trimmedNote } : { decision },
  );
}

/** True when the server refused a review because someone already decided. */
export function isForumReviewConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
