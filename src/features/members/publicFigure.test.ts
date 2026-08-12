import { describe, expect, it } from "vitest";
import {
  evaluatePublicEligibility,
  TARGET_SCORE,
  type EligibilitySignals,
} from "./publicFigure";

/** A fully-qualifying member; individual tests override single fields. */
function baseSignals(overrides: Partial<EligibilitySignals> = {}): EligibilitySignals {
  return {
    nowIso: "2026-08-11T00:00:00.000Z",
    verified: true,
    tenureDays: 400,
    publishedPieces: [{ at: "2026-07-01T00:00:00.000Z" }],
    hostedOpenEvents: [{ at: "2026-06-01T00:00:00.000Z" }],
    workshopsTaught: 1,
    publishedSubprofiles: 1,
    vouchCount: 4,
    endorsementCount: 3,
    connectionCount: 8,
    eventsAttended: 5,
    communityPosts: 4,
    lastActiveDaysAgo: 3,
    standingOk: true,
    ...overrides,
  };
}

describe("evaluatePublicEligibility", () => {
  it("is eligible when gates pass, score >= target, and standing is clean", () => {
    const result = evaluatePublicEligibility(baseSignals());
    expect(result.score.total).toBeGreaterThanOrEqual(TARGET_SCORE);
    expect(result.eligible).toBe(true);
  });

  it("blocks when a hard gate is unmet, but still computes a score", () => {
    const result = evaluatePublicEligibility(baseSignals({ verified: false }));
    expect(result.gates.find((gate) => gate.key === "verified")?.met).toBe(false);
    expect(result.eligible).toBe(false);
    expect(result.score.total).toBeGreaterThan(0);
  });

  it("reports remaining days on the tenure gate", () => {
    const result = evaluatePublicEligibility(baseSignals({ tenureDays: 30 }));
    const tenure = result.gates.find((gate) => gate.key === "tenure");
    expect(tenure?.met).toBe(false);
    expect(tenure?.remainingCount).toBe(60);
  });

  it("caps a single family below the target — one dimension can't unlock", () => {
    // Maximal contribution, nothing else.
    const result = evaluatePublicEligibility({
      ...baseSignals(),
      vouchCount: 0,
      endorsementCount: 0,
      connectionCount: 0,
      eventsAttended: 0,
      communityPosts: 0,
      lastActiveDaysAgo: 999,
      tenureDays: 90,
      publishedPieces: Array.from({ length: 12 }, () => ({ at: "2026-07-01T00:00:00.000Z" })),
      hostedOpenEvents: [],
      workshopsTaught: 0,
      publishedSubprofiles: 0,
    });
    expect(result.score.families.find((f) => f.key === "contribution")?.points).toBe(50);
    expect(result.eligible).toBe(false);
  });

  it("still needs participation even with contribution + trust maxed (50 + 35 < 100)", () => {
    const result = evaluatePublicEligibility({
      ...baseSignals(),
      publishedPieces: Array.from({ length: 12 }, () => ({ at: "2026-07-01T00:00:00.000Z" })),
      vouchCount: 10,
      endorsementCount: 10,
      connectionCount: 10,
      eventsAttended: 0,
      communityPosts: 0,
      lastActiveDaysAgo: 999,
    });
    expect(result.score.families.find((f) => f.key === "contribution")?.points).toBe(50);
    expect(result.score.families.find((f) => f.key === "trust")?.points).toBe(35);
    expect(result.score.total).toBeLessThan(TARGET_SCORE);
    expect(result.eligible).toBe(false);
  });

  it("decays contribution pieces older than the recency window to half", () => {
    const recent = evaluatePublicEligibility({
      ...baseSignals(),
      publishedPieces: [{ at: "2026-08-01T00:00:00.000Z" }],
      hostedOpenEvents: [],
      workshopsTaught: 0,
      publishedSubprofiles: 0,
    });
    const stale = evaluatePublicEligibility({
      ...baseSignals(),
      publishedPieces: [{ at: "2024-01-01T00:00:00.000Z" }],
      hostedOpenEvents: [],
      workshopsTaught: 0,
      publishedSubprofiles: 0,
    });
    const recentPts = recent.score.families.find((f) => f.key === "contribution")!.points;
    const stalePts = stale.score.families.find((f) => f.key === "contribution")!.points;
    expect(stalePts).toBe(Math.round(recentPts * 0.5));
  });

  it("zeroes the active bonus when dormant for 90+ days", () => {
    const active = evaluatePublicEligibility(baseSignals({ lastActiveDaysAgo: 10 }));
    const dormant = evaluatePublicEligibility(baseSignals({ lastActiveDaysAgo: 120 }));
    const activePts = active.score.families.find((f) => f.key === "participation")!.points;
    const dormantPts = dormant.score.families.find((f) => f.key === "participation")!.points;
    expect(activePts - dormantPts).toBe(6);
  });

  it("blocks on a safety veto even with a full score and passing gates", () => {
    const result = evaluatePublicEligibility(baseSignals({ standingOk: false }));
    expect(result.score.total).toBeGreaterThanOrEqual(TARGET_SCORE);
    expect(result.standingOk).toBe(false);
    expect(result.eligible).toBe(false);
  });

  it("ranks score actions by payoff, with unmet gate actions first", () => {
    const result = evaluatePublicEligibility(
      baseSignals({ verified: false, vouchCount: 0, publishedPieces: [], hostedOpenEvents: [], workshopsTaught: 0, publishedSubprofiles: 0 }),
    );
    expect(result.nextActions[0]?.family).toBe("gate");
    const scoreActions = result.nextActions.filter((action) => action.family !== "gate");
    const points = scoreActions.map((action) => action.points);
    expect(points).toEqual([...points].sort((left, right) => right - left));
  });
});
