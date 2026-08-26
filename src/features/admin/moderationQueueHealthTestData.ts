import type {
  ModerationQueueHealthDTO,
  ModerationQueueHealthEntryDTO,
  ModerationQueueKey,
} from "./api/moderationHealth.api";

/**
 * Queue-health fixtures for the TS-04 suites, built here rather than reusing
 * the demo fixture: the demo one is tuned to look interesting in a running app
 * and would make every assertion depend on numbers chosen for a screenshot.
 */
const DEFAULT_THRESHOLDS = {
  depth: { warning: 10, critical: 25 },
  oldestHours: { warning: 24, critical: 72 },
  overdue: { warning: 1, critical: 5 },
};

export function makeQueueEntry(
  queue: ModerationQueueKey,
  overrides: Partial<ModerationQueueHealthEntryDTO> = {},
): ModerationQueueHealthEntryDTO {
  return {
    queue,
    depth: 2,
    overdueCount: 0,
    unassignedCount: 1,
    oldestItemHours: 3.5,
    medianResponseHours: null,
    depthPerModerator: 0.5,
    severity: "ok",
    breaches: [],
    thresholds: DEFAULT_THRESHOLDS,
    ...overrides,
  };
}

export function makeQueueHealth(
  overrides: Partial<ModerationQueueHealthDTO> = {},
): ModerationQueueHealthDTO {
  return {
    generatedAt: "2026-08-26T09:00:00.000Z",
    overallSeverity: "ok",
    activeModeratorCount: 4,
    queues: [
      makeQueueEntry("invite_requests"),
      makeQueueEntry("reports"),
      makeQueueEntry("appeals", { unassignedCount: null }),
      makeQueueEntry("verification"),
      makeQueueEntry("ban_ratifications", { unassignedCount: null }),
    ],
    ...overrides,
  };
}
