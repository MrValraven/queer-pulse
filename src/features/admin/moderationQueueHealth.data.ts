import type { ModerationQueueHealthDTO } from "./api/moderationHealth.api";

/**
 * The demo-mode queue health picture (TS-04).
 *
 * Deliberately not all-clear: a panel that only ever shows five green rows
 * demonstrates nothing about the thing it was built for. One queue sits at
 * `critical` with all three axes breached, two at `warning` breaching one axis
 * each, and two at `ok`. Between them they also exercise every null the wire
 * can carry, so the demo shows the null handling rather than only describing it:
 *
 *  - `unassignedCount: null` on appeals and ban ratifications, which carry no
 *    assignment column at all;
 *  - `oldestItemHours: null` on ban ratifications, because that queue is empty;
 *  - `medianResponseHours` populated only on invite requests, matching what the
 *    server publishes today.
 *
 * `depthPerModerator: null` is the one null NOT shown here, and it cannot be:
 * the server derives it from a single global `activeModeratorCount`, so it is
 * null for every queue at once or for none. A demo standing at zero moderators
 * would be a demo where every row reads as an emergency. The zero-moderator
 * case is covered in `ModerationQueueHealthPanel.test.tsx` instead.
 *
 * The threshold bands mirror what the backend ships today. They are FIXTURE
 * DATA standing in for a response, never a second source of truth: every live
 * path reads the bands off the wire, and nothing imports this file outside demo
 * mode.
 */
export const MODERATION_QUEUE_HEALTH_DEMO: ModerationQueueHealthDTO = {
  generatedAt: new Date().toISOString(),
  overallSeverity: "critical",
  activeModeratorCount: 4,
  queues: [
    {
      queue: "invite_requests",
      depth: 44,
      overdueCount: 7,
      unassignedCount: 31,
      oldestItemHours: 80.5,
      medianResponseHours: 26.4,
      depthPerModerator: 11,
      severity: "critical",
      breaches: ["depth", "oldest", "overdue"],
      thresholds: {
        depth: { warning: 15, critical: 40 },
        oldestHours: { warning: 48, critical: 72 },
        overdue: { warning: 1, critical: 5 },
      },
    },
    {
      queue: "reports",
      depth: 12,
      overdueCount: 0,
      unassignedCount: 9,
      oldestItemHours: 20.1,
      medianResponseHours: null,
      depthPerModerator: 3,
      severity: "warning",
      breaches: ["depth"],
      thresholds: {
        depth: { warning: 10, critical: 25 },
        oldestHours: { warning: 24, critical: 72 },
        overdue: { warning: 1, critical: 5 },
      },
    },
    {
      queue: "appeals",
      depth: 2,
      overdueCount: 0,
      unassignedCount: null,
      oldestItemHours: 30.7,
      medianResponseHours: null,
      depthPerModerator: 0.5,
      severity: "ok",
      breaches: [],
      thresholds: {
        depth: { warning: 8, critical: 20 },
        oldestHours: { warning: 96, critical: 168 },
        overdue: { warning: 1, critical: 3 },
      },
    },
    {
      queue: "verification",
      depth: 22,
      overdueCount: 4,
      unassignedCount: 14,
      oldestItemHours: 61.2,
      medianResponseHours: null,
      depthPerModerator: 5.5,
      severity: "warning",
      breaches: ["depth", "overdue"],
      thresholds: {
        depth: { warning: 20, critical: 50 },
        oldestHours: { warning: 96, critical: 120 },
        overdue: { warning: 3, critical: 10 },
      },
    },
    {
      queue: "ban_ratifications",
      depth: 0,
      overdueCount: 0,
      unassignedCount: null,
      oldestItemHours: null,
      medianResponseHours: null,
      depthPerModerator: 0,
      severity: "ok",
      breaches: [],
      thresholds: {
        depth: { warning: 1, critical: 3 },
        oldestHours: { warning: 12, critical: 24 },
        overdue: { warning: 1, critical: 1 },
      },
    },
  ],
};
