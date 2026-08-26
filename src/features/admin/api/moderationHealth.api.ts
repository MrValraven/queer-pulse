import { apiGet } from "../../../shared/api/client";

/**
 * Moderator workload and SLA health (TS-04) as
 * `GET /admin/moderation/queue-health` serves it.
 *
 * STAFF ONLY, AND THERE IS NO MEMBER-FACING COUNTERPART. The backend contract
 * states that plainly and the route is guarded for the moderator and admin
 * tiers with the staff-grant axis switched off. Nothing in this module may be
 * read from a member surface.
 *
 * Every threshold arrives in the response. Nothing here restates the shipped
 * numbers, because the policy moves in one backend edit
 * (`moderation-queue-thresholds.ts`) and a copy on this side would silently
 * disagree with the severity the server already decided.
 */

/** The queues a moderator works, in the order the response lists them. */
export type ModerationQueueKey =
  | "invite_requests"
  | "reports"
  | "appeals"
  | "verification"
  | "ban_ratifications";

/** How bad one queue, or the whole picture, is. */
export type ModerationQueueSeverity = "ok" | "warning" | "critical";

/**
 * Which axis pushed a queue past its band. `depth` is how much work is waiting,
 * `oldest` is whether the queue is being worked at all, and `overdue` is how
 * many published promises are already broken.
 */
export type ModerationQueueBreachAxis = "depth" | "oldest" | "overdue";

/** A warning level and the critical level above it, for one axis. */
export interface ModerationQueueThresholdBandDTO {
  warning: number;
  critical: number;
}

/** The three bands one queue's severity was decided against. */
export interface ModerationQueueThresholdsDTO {
  depth: ModerationQueueThresholdBandDTO;
  oldestHours: ModerationQueueThresholdBandDTO;
  overdue: ModerationQueueThresholdBandDTO;
}

/**
 * One queue's measurement.
 *
 * THREE OF THESE FIELDS ARE NULLABLE AND EACH NULL MEANS SOMETHING DIFFERENT.
 * Read the field comments before rendering any of them as a number.
 */
export interface ModerationQueueHealthEntryDTO {
  queue: ModerationQueueKey;
  /** Items waiting right now. */
  depth: number;
  /** Waiting items already past this queue's own published clock. */
  overdueCount: number;
  /**
   * Waiting items nobody has claimed. NULL MEANS THE QUEUE HAS NO ASSIGNMENT
   * CONCEPT AT ALL (appeals, ban ratifications carry no assignment column).
   * Rendering that as `0` would read as "everything is claimed", which is the
   * opposite of true.
   */
  unassignedCount: number | null;
  /** Hours the oldest waiting item has waited. NULL MEANS THE QUEUE IS EMPTY,
   *  which is good news and has to read as good news. */
  oldestItemHours: number | null;
  /** Median hours from arrival to decision. Populated only for invite requests
   *  today. NULL MEANS THIS QUEUE PUBLISHES NO SUCH FIGURE: omit the line
   *  rather than leaving a gap where a number should be. */
  medianResponseHours: number | null;
  /** `depth` per active moderator. NULL MEANS THERE ARE ZERO ACTIVE
   *  MODERATORS, which is louder than any number this field could carry. */
  depthPerModerator: number | null;
  severity: ModerationQueueSeverity;
  /** Axes at or above their own warning level. Empty when `ok`. */
  breaches: ModerationQueueBreachAxis[];
  thresholds: ModerationQueueThresholdsDTO;
}

/** The whole workload picture. */
export interface ModerationQueueHealthDTO {
  /** ISO instant the measurement was taken. */
  generatedAt: string;
  /** The worst of every queue's severity. Never an average: one broken promise
   *  is not cancelled out by four healthy queues. */
  overallSeverity: ModerationQueueSeverity;
  /** Active accounts holding the moderator or admin tier. */
  activeModeratorCount: number;
  queues: ModerationQueueHealthEntryDTO[];
}

/** Moderator/admin only. Computed live on every call. */
export const getModerationQueueHealth = () =>
  apiGet<ModerationQueueHealthDTO>("/admin/moderation/queue-health");
