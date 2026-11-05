import { describe, expect, it } from "vitest";
import {
  SEVERITY_ORDER,
  overdueEmphasis,
  overviewHeadline,
  overviewSeverity,
  queueCountBySeverity,
  queueHealthTotals,
  queuesWorstFirst,
} from "./moderationQueueHealthSummary";
import {
  makeQueueEntry,
  makeQueueHealth,
} from "./moderationQueueHealthTestData";

describe("SEVERITY_ORDER", () => {
  it("lists the levels worst first", () => {
    expect(SEVERITY_ORDER).toEqual(["critical", "warning", "ok"]);
  });
});

describe("queueHealthTotals", () => {
  it("sums depth and overdue across every queue", () => {
    const totals = queueHealthTotals([
      makeQueueEntry("invite_requests", { depth: 4, overdueCount: 1 }),
      makeQueueEntry("reports", { depth: 7, overdueCount: 0 }),
      makeQueueEntry("appeals", { depth: 3, overdueCount: 2 }),
    ]);
    expect(totals.waiting).toBe(14);
    expect(totals.overdue).toBe(3);
    expect(totals.queueCount).toBe(3);
  });

  it("sums unclaimed over the queues that report a claiming step", () => {
    const totals = queueHealthTotals(makeQueueHealth().queues);
    // Five queues at depth 2 each; three report one unclaimed item and two
    // (appeals, ban ratifications) carry a null unassigned count.
    expect(totals).toEqual({
      waiting: 10,
      overdue: 0,
      unclaimed: 3,
      queueCount: 5,
    });
  });

  it("reads unclaimed as null when every queue has a null unassigned count", () => {
    const totals = queueHealthTotals([
      makeQueueEntry("appeals", { unassignedCount: null }),
      makeQueueEntry("ban_ratifications", { unassignedCount: null }),
    ]);
    expect(totals.unclaimed).toBeNull();
  });

  it("keeps a reported zero unclaimed as the number zero", () => {
    const totals = queueHealthTotals([
      makeQueueEntry("reports", { unassignedCount: 0 }),
      makeQueueEntry("appeals", { unassignedCount: null }),
    ]);
    expect(totals.unclaimed).toBe(0);
  });

  it("adds only the numeric unassigned counts in a mixed reading", () => {
    const totals = queueHealthTotals([
      makeQueueEntry("invite_requests", { unassignedCount: 4 }),
      makeQueueEntry("appeals", { unassignedCount: null }),
      makeQueueEntry("reports", { unassignedCount: 6 }),
      makeQueueEntry("ban_ratifications", { unassignedCount: null }),
    ]);
    expect(totals.unclaimed).toBe(10);
  });

  it("reads zero totals and a null unclaimed for an empty list", () => {
    expect(queueHealthTotals([])).toEqual({
      waiting: 0,
      overdue: 0,
      unclaimed: null,
      queueCount: 0,
    });
  });
});

describe("queueCountBySeverity", () => {
  it("counts the queues at each level", () => {
    const counts = queueCountBySeverity([
      makeQueueEntry("invite_requests", { severity: "critical" }),
      makeQueueEntry("reports", { severity: "warning" }),
      makeQueueEntry("appeals", { severity: "critical" }),
      makeQueueEntry("verification"),
      makeQueueEntry("ban_ratifications"),
    ]);
    expect(counts).toEqual({ ok: 2, warning: 1, critical: 2 });
  });

  it("includes every level with a zero count when it is empty", () => {
    expect(queueCountBySeverity(makeQueueHealth().queues)).toEqual({
      ok: 5,
      warning: 0,
      critical: 0,
    });
  });
});

describe("queuesWorstFirst", () => {
  it("orders critical queues first, then warning, then ok", () => {
    const ordered = queuesWorstFirst([
      makeQueueEntry("invite_requests"),
      makeQueueEntry("reports", { severity: "warning" }),
      makeQueueEntry("appeals", { severity: "critical" }),
    ]);
    expect(ordered.map((entry) => entry.queue)).toEqual([
      "appeals",
      "reports",
      "invite_requests",
    ]);
  });

  it("keeps the server order within each level", () => {
    const ordered = queuesWorstFirst([
      makeQueueEntry("invite_requests"),
      makeQueueEntry("reports", { severity: "critical" }),
      makeQueueEntry("appeals", { severity: "warning" }),
      makeQueueEntry("verification", { severity: "critical" }),
      makeQueueEntry("ban_ratifications", { severity: "warning" }),
    ]);
    expect(ordered.map((entry) => entry.queue)).toEqual([
      "reports",
      "verification",
      "appeals",
      "ban_ratifications",
      "invite_requests",
    ]);
  });

  it("returns a new array and leaves the input order untouched", () => {
    const queues = [
      makeQueueEntry("invite_requests"),
      makeQueueEntry("reports", { severity: "critical" }),
    ];
    const ordered = queuesWorstFirst(queues);
    expect(ordered).not.toBe(queues);
    expect(queues.map((entry) => entry.queue)).toEqual([
      "invite_requests",
      "reports",
    ]);
  });
});

describe("overviewSeverity and overviewHeadline", () => {
  it("reads ok with the clear headline when every queue is ok", () => {
    const health = makeQueueHealth();
    expect(overviewSeverity(health)).toBe("ok");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.overview.headline.ok",
    });
  });

  it("reads critical with the count of critical queues", () => {
    const health = makeQueueHealth({
      overallSeverity: "critical",
      queues: [
        makeQueueEntry("invite_requests", { severity: "critical" }),
        makeQueueEntry("reports", { severity: "warning" }),
        makeQueueEntry("appeals", { severity: "critical" }),
        makeQueueEntry("verification"),
      ],
    });
    expect(overviewSeverity(health)).toBe("critical");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.overview.headline.critical",
      options: { count: 2 },
    });
  });

  it("reads warning with the count of warning queues", () => {
    const health = makeQueueHealth({
      overallSeverity: "warning",
      queues: [
        makeQueueEntry("invite_requests"),
        makeQueueEntry("reports", { severity: "warning" }),
        makeQueueEntry("appeals"),
      ],
    });
    expect(overviewSeverity(health)).toBe("warning");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.overview.headline.warning",
      options: { count: 1 },
    });
  });

  it("falls back to the level word when a critical overall has zero critical queues", () => {
    const health = makeQueueHealth({
      overallSeverity: "critical",
      queues: [
        makeQueueEntry("invite_requests", { severity: "warning" }),
        makeQueueEntry("reports"),
      ],
    });
    expect(overviewSeverity(health)).toBe("critical");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.severity.critical",
    });
  });

  it("falls back to the level word when a warning overall has zero warning queues", () => {
    const health = makeQueueHealth({ overallSeverity: "warning" });
    expect(overviewSeverity(health)).toBe("warning");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.severity.warning",
    });
  });

  it("lifts an ok overall to warning while a queue sits at warning", () => {
    const health = makeQueueHealth({
      overallSeverity: "ok",
      queues: [
        makeQueueEntry("invite_requests"),
        makeQueueEntry("reports", { severity: "warning" }),
      ],
    });
    expect(overviewSeverity(health)).toBe("warning");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.overview.headline.warning",
      options: { count: 1 },
    });
  });

  it("lifts an ok overall to the worst queue level while queues sit at warning and critical", () => {
    const health = makeQueueHealth({
      overallSeverity: "ok",
      queues: [
        makeQueueEntry("invite_requests", { severity: "warning" }),
        makeQueueEntry("reports", { severity: "critical" }),
        makeQueueEntry("appeals", { severity: "warning" }),
      ],
    });
    expect(overviewSeverity(health)).toBe("critical");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.overview.headline.critical",
      options: { count: 1 },
    });
  });

  it("reads ok with the clear headline for an empty queue list", () => {
    const health = makeQueueHealth({ queues: [] });
    expect(overviewSeverity(health)).toBe("ok");
    expect(overviewHeadline(health)).toEqual({
      key: "admin:moderationHealth.overview.headline.ok",
    });
  });
});

describe("overdueEmphasis", () => {
  it("reads calm at zero overdue for every overall level", () => {
    expect(overdueEmphasis(0, "ok")).toBe("calm");
    expect(overdueEmphasis(0, "warning")).toBe("calm");
    expect(overdueEmphasis(0, "critical")).toBe("calm");
  });

  it("reads loud for overdue items while the overall level is past ok", () => {
    expect(overdueEmphasis(3, "warning")).toBe("loud");
    expect(overdueEmphasis(1, "critical")).toBe("loud");
  });

  it("reads plain for overdue items while the overall level is ok", () => {
    expect(overdueEmphasis(2, "ok")).toBe("plain");
  });
});
