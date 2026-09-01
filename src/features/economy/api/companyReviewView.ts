import type { CompanyReview } from "../companies.data";

/**
 * A company review as the page renders it: the prototype's `CompanyReview`
 * view-model plus the three fields the employer's right of reply added
 * (PRD-47).
 *
 * All three are OPTIONAL, which is what lets demo mode keep passing its plain
 * `CompanyReview` fixtures straight through: a fabricated review has no id, no
 * reply and nothing to say about edit ordering, and every consumer treats their
 * absence as "no reply". Live mode fills all three from `CompanyReviewDTO`.
 */
export interface CompanyReviewView extends CompanyReview {
  /** The review's uuid. Live only. It is what addresses the reply endpoint and
   *  what a report against this review is filed under. */
  id?: string;
  /** When the author last changed it, ISO-8601, or `null` if never. */
  editedAt?: string | null;
  /**
   * Server-precomputed. The author changed their review AFTER the employer had
   * answered it, so the reply may be answering words that are no longer on the
   * page. Never re-derived here from the two timestamps: one place decides it,
   * and that place is the server.
   */
  isEditedAfterOwnerReply?: boolean;
  /** The employer's single public reply, or `null`/absent when they have not
   *  answered. */
  ownerReply?: { text: string; at: string } | null;
}
