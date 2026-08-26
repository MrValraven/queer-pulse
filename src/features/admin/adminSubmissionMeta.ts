import type { AdminTone } from "./ui";

/**
 * Shared vocabulary for the console's member-submission queues (concerns,
 * intakes, inquiries): how a status looks, and how badly something is overdue.
 * Kept out of `AdminSubmissionQueue.tsx` so that file exports components only.
 */

/** How urgently a still-waiting submission's age should read. An inbox with no
 *  SLA gets a gentler ramp than the 3-business-day join-request queue: under
 *  three days is neutral, three to six is approaching, a week or more is
 *  overdue. */
export type AdminWaitingTone = "neutral" | "approaching" | "overdue";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days between `iso` and now, floored at 0. An unparseable date reads as
 *  "arrived today" rather than throwing at an admin. */
export function daysWaitingSince(
  iso: string,
  now: number = Date.now(),
): number {
  const arrivedAt = new Date(iso).getTime();
  if (Number.isNaN(arrivedAt)) return 0;
  return Math.max(0, Math.floor((now - arrivedAt) / MILLISECONDS_PER_DAY));
}

export function adminWaitingTone(daysWaiting: number): AdminWaitingTone {
  if (daysWaiting >= 7) return "overdue";
  if (daysWaiting >= 3) return "approaching";
  return "neutral";
}

/** Status chip tones shared by the concerns page and the intake console, so one
 *  status never reads amber in one queue and jade in the other. Keyed loosely
 *  because the three queues have three different status vocabularies. */
export const ADMIN_SUBMISSION_STATUS_TONE: Record<string, AdminTone> = {
  new: "amber",
  reviewing: "violet",
  reviewed: "jade",
  resolved: "jade",
  dismissed: "ghost",
  handled: "jade",
};
