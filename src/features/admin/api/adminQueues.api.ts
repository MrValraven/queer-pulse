import { apiGet } from "../../../shared/api/client";

/**
 * The staff triage console (`GET /admin/queues`, PRD-282).
 *
 * Before this endpoint existed, nothing on the platform said what was waiting
 * today: the dashboard's triage block carried four counts, the admin rail five
 * badges, and the other twenty-six staff queues announced an arrival into the
 * bell and then went silent. A DSAR on a statutory 30-day clock only read
 * "overdue" once somebody happened to open `/admin/dsar`.
 *
 * The wire vocabulary is the same `queue` string the bell carries in
 * `payload.queue`: the 28 keys of the backend's `ADMIN_QUEUE_REGISTRY` plus
 * three that live outside it because each already has a notification type of
 * its own (`reports`, `ban_evasion_escalations`,
 * `community_owner_review_requests`).
 */

export interface AdminQueueSummaryDTO {
  /**
   * An admin queue key. Treat an unknown value as forward-compatible: a newer
   * backend can name a queue this build has never heard of, and the row still
   * has to render and still has to link.
   */
  queue: string;
  /**
   * The frontend path this queue is worked on, e.g. `/admin/dsar`.
   *
   * ALWAYS use this rather than resolving the key through the frontend's own
   * `ADMIN_QUEUE_ROUTES`: that map mirrors the registry's 28 keys only, so the
   * three extra keys would resolve to `undefined` and lose their deep link.
   * For the 28 they overlap on, the two strings are identical.
   */
  route: string;
  /**
   * Rows waiting on staff. `null` means the queue records no worked/unworked
   * state at all, so nothing can say what is waiting in it (today only
   * `commission_interests`), or one queue's own count failed while the rest
   * answered. It is never a synonym for zero.
   */
  waitingCount: number | null;
  /** ISO instant the oldest waiting row arrived. */
  oldestWaitingAt: string | null;
  /**
   * Whole hours (floored) the oldest waiting row has waited, measured from
   * {@link AdminQueuesDTO.generatedAt}. Null exactly when nothing is waiting
   * or the queue is uncountable, so it is never rendered as "0h".
   */
  oldestWaitingHours: number | null;
  /**
   * Waiting rows past a real deadline, and always a subset of
   * {@link waitingCount}.
   *
   * `null` and `0` are DIFFERENT ANSWERS and must not render alike. `null`
   * means this queue has no deadline at all, so calling it "on time" would
   * claim a promise the platform never made; 11 of the 31 queues have a real
   * clock and the other 20 return null. `0` means the queue has a deadline and
   * nothing has missed it.
   */
  overdueCount: number | null;
}

export interface AdminQueuesDTO {
  /**
   * ISO instant this answer was computed. Every age in the payload is measured
   * from here, so ages are rendered as sent rather than recomputed against the
   * browser clock.
   */
  generatedAt: string;
  totals: {
    /** Sum of every non-null `waitingCount`. */
    waitingCount: number;
    /** Sum of every non-null `overdueCount`. */
    overdueCount: number;
    /** How many queues have at least one row waiting. */
    queuesWithWorkCount: number;
    /** How many queues came back with `waitingCount: null`. */
    uncountableQueueCount: number;
  };
  /**
   * Only the queues this caller may work, most urgent first (most overdue,
   * then longest wait, then largest backlog, then queue key so two unchanged
   * polls never swap two rows).
   *
   * ACCESS FILTERING HAPPENS HERE, IN THE BODY. A queue the caller cannot work
   * is ABSENT from this array rather than present with nulls, because a row of
   * nulls would still disclose that the queue exists and is tracked. An admin
   * sees 31, a moderator 11, a member holding one grant as few as 3. So never
   * assume a fixed set and never render a placeholder for a queue that did not
   * come back. `totals` is scoped to the same set, so the header figures and
   * the sum of the visible rows always agree.
   */
  queues: AdminQueueSummaryDTO[];
}

/** GET /admin/queues. One answer for every queue the caller can work. */
export const getAdminQueues = () => apiGet<AdminQueuesDTO>("/admin/queues");

/**
 * The `admin:` catalog key naming one queue.
 *
 * Deliberately the SAME `moderationHealth.queue.*` block the queue-health panel
 * reads, rather than a second per-queue label list beside it. Two hand-curated
 * lists mirroring one taxonomy drift apart silently, and 29 of these 31 labels
 * were already written; only `ban_evasion_escalations` and
 * `community_owner_review_requests` were missing and were added to that same
 * block. The wire carries no label field, so this copy is the client's.
 */
export function adminQueueLabelKey(queue: string): string {
  return `admin:moderationHealth.queue.${queue}`;
}
