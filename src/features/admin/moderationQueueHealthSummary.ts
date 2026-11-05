import type {
  ModerationQueueHealthDTO,
  ModerationQueueHealthEntryDTO,
  ModerationQueueSeverity,
} from "./api/moderationHealth.api";

/**
 * The overview card's arithmetic (TS-04). Pure sums over the queues the server
 * sent, kept out of the component so the figures can be read and tested on
 * their own.
 *
 * QUEUES ONLY. Every figure here is a property of the work. The rota
 * size is passed through as the server counted it and is never divided into
 * anything.
 */

/** Worst first, so the legend reads in the order a moderator acts on. */
export const SEVERITY_ORDER: readonly ModerationQueueSeverity[] = [
  "critical",
  "warning",
  "ok",
];

export interface ModerationQueueHealthTotals {
  /** Every item waiting, across every queue. */
  waiting: number;
  /** Waiting items already past their queue's published window. */
  overdue: number;
  /** Unclaimed items, summed only over queues that have a claiming step.
   *  NULL MEANS NO QUEUE IN THE READING HAS ONE: a `0` would read as
   *  "everything is claimed", which is the opposite of what the wire said. */
  unclaimed: number | null;
  queueCount: number;
}

export function queueHealthTotals(
  queues: readonly ModerationQueueHealthEntryDTO[],
): ModerationQueueHealthTotals {
  let waiting = 0;
  let overdue = 0;
  let unclaimed: number | null = null;
  for (const entry of queues) {
    waiting += entry.depth;
    overdue += entry.overdueCount;
    if (entry.unassignedCount !== null) {
      unclaimed = (unclaimed ?? 0) + entry.unassignedCount;
    }
  }
  return { waiting, overdue, unclaimed, queueCount: queues.length };
}

/** How many queues sit at each level. Every level is present, zero included. */
export function queueCountBySeverity(
  queues: readonly ModerationQueueHealthEntryDTO[],
): Record<ModerationQueueSeverity, number> {
  const counts: Record<ModerationQueueSeverity, number> = {
    ok: 0,
    warning: 0,
    critical: 0,
  };
  for (const entry of queues) counts[entry.severity] += 1;
  return counts;
}

export interface OverviewHeadline {
  /** `admin:` key for the headline sentence. */
  key: string;
  /** The plural count, for the keys that take one. */
  options?: { count: number };
}

/** The queues ordered worst level first. The sort is stable, so queues at the
 *  same level keep the server's order. */
export function queuesWorstFirst(
  queues: readonly ModerationQueueHealthEntryDTO[],
): ModerationQueueHealthEntryDTO[] {
  return [...queues].sort(
    (first, second) =>
      SEVERITY_ORDER.indexOf(first.severity) -
      SEVERITY_ORDER.indexOf(second.severity),
  );
}

/**
 * The level the overview card shows. It follows the server's overall level,
 * and when that says ok while some queue sits higher, it takes the worst
 * queue's level, so the badge and the headline always agree with the strip.
 */
export function overviewSeverity(
  health: Pick<ModerationQueueHealthDTO, "overallSeverity" | "queues">,
): ModerationQueueSeverity {
  if (health.overallSeverity !== "ok") return health.overallSeverity;
  const counts = queueCountBySeverity(health.queues);
  return SEVERITY_ORDER.find((level) => counts[level] > 0) ?? "ok";
}

/**
 * The headline follows `overviewSeverity` and counts the queues holding that
 * level. If the reading is inconsistent (a non-ok overall level with no queue
 * at that level) the headline falls back to the level's own word, so it never
 * prints "0 queues need someone now". An ok overall level over a busier queue
 * is lifted to that queue's level first, so it never prints "Every queue is
 * clear" over an amber or red strip.
 */
export function overviewHeadline(
  health: Pick<ModerationQueueHealthDTO, "overallSeverity" | "queues">,
): OverviewHeadline {
  const severity = overviewSeverity(health);
  if (severity === "ok") {
    return { key: "admin:moderationHealth.overview.headline.ok" };
  }
  const count = queueCountBySeverity(health.queues)[severity];
  if (count === 0) {
    return { key: `admin:moderationHealth.severity.${severity}` };
  }
  return {
    key: `admin:moderationHealth.overview.headline.${severity}`,
    options: { count },
  };
}

/** How the "Past its window" figure is tinted: calm at zero, loud only while
 *  the overall reading is already past ok. */
export type OverdueEmphasis = "calm" | "loud" | "plain";

export function overdueEmphasis(
  overdue: number,
  overallSeverity: ModerationQueueSeverity,
): OverdueEmphasis {
  if (overdue === 0) return "calm";
  return overallSeverity === "ok" ? "plain" : "loud";
}
