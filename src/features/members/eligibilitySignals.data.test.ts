import { describe, expect, it } from "vitest";
import { demoEligibilitySignals, liveEligibilitySignals } from "./eligibilitySignals.data";
import type { PublicEligibilitySignalsDto } from "./api/publicProfile.api";

const NOW = "2026-08-11T00:00:00.000Z";

const dto: PublicEligibilitySignalsDto = {
  verified: true,
  tenureDays: 400,
  publishedPieces: ["2026-07-01T00:00:00.000Z", "2026-05-01T00:00:00.000Z"],
  hostedOpenEvents: ["2026-06-01T00:00:00.000Z"],
  workshopsTaught: 1,
  publishedSubprofiles: 2,
  vouchCount: 3,
  vouchesGivenCount: 1,
  endorsementCount: 4,
  connectionCount: 12,
  eventsAttended: 6,
  communityPosts: 5,
  lastActiveDaysAgo: 0,
  standingOk: true,
};

describe("eligibility signal builders", () => {
  it("demo fixture produces an eligible-shaped, fully-populated signal set", () => {
    const signals = demoEligibilitySignals(NOW);
    expect(signals.nowIso).toBe(NOW);
    expect(signals.verified).toBe(true);
    expect(signals.tenureDays).toBeGreaterThanOrEqual(90);
    expect(signals.publishedPieces.length + signals.hostedOpenEvents.length).toBeGreaterThan(0);
  });

  it("live builder maps the DTO to EligibilitySignals, wrapping timestamps as { at }", () => {
    const signals = liveEligibilitySignals(dto, NOW);
    expect(signals.nowIso).toBe(NOW);
    expect(signals.verified).toBe(true);
    expect(signals.tenureDays).toBe(400);
    expect(signals.publishedPieces).toEqual([
      { at: "2026-07-01T00:00:00.000Z" },
      { at: "2026-05-01T00:00:00.000Z" },
    ]);
    expect(signals.hostedOpenEvents).toEqual([{ at: "2026-06-01T00:00:00.000Z" }]);
    expect(signals.workshopsTaught).toBe(1);
    expect(signals.endorsementCount).toBe(4);
    expect(signals.connectionCount).toBe(12);
    expect(signals.eventsAttended).toBe(6);
    expect(signals.communityPosts).toBe(5);
    expect(signals.standingOk).toBe(true);
  });
});
