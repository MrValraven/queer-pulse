import { describe, expect, it } from "vitest";
import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import {
  estimateClockOffset,
  ownDeadlineOf,
  remainingMs,
  type QuizshowClockSample,
} from "./quizshowClock";

function sampleWith(roundTrip: number, offset: number): QuizshowClockSample {
  // Zero server processing time: roundTrip = received - sent, offset = server - client at the midpoint.
  const clientSentAt = 1_000_000;
  const clientReceivedAt = clientSentAt + roundTrip;
  const serverMoment = clientSentAt + roundTrip / 2 + offset;
  return {
    clientSentAt,
    serverReceivedAt: serverMoment,
    serverSentAt: serverMoment,
    clientReceivedAt,
  };
}

function cursorWith(overrides: Partial<QuizshowCursor>): QuizshowCursor {
  return {
    phaseId: "1",
    status: "running",
    phase: "open",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 1,
    phaseStartedAt: 0,
    deadline: 100,
    extraTimeDeadline: 150,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    ...overrides,
  };
}

describe("quizshow clock", () => {
  it("keeps the countdown right on a phone whose clock runs 40 seconds fast", () => {
    const sample: QuizshowClockSample = {
      clientSentAt: 1_040_000,
      serverReceivedAt: 1_000_050,
      serverSentAt: 1_000_051,
      clientReceivedAt: 1_040_101,
    };
    const offset = estimateClockOffset([sample]);
    expect(offset).toBe(-40_000);
    expect(remainingMs(1_020_000, 1_045_000, offset)).toBe(15_000);
  });

  it("uses the median of the three fastest round trips", () => {
    const samples = [
      sampleWith(100, 900),
      sampleWith(30, 10),
      sampleWith(500, 700),
      sampleWith(40, 30),
      sampleWith(35, 20),
    ];
    expect(estimateClockOffset(samples)).toBe(20);
  });

  it("answers zero for no samples and averages the middle two for an even count", () => {
    expect(estimateClockOffset([])).toBe(0);
    expect(
      estimateClockOffset([sampleWith(10, 100), sampleWith(20, 200)]),
    ).toBe(150);
  });

  it("floors the time left at zero and answers null without a deadline", () => {
    expect(remainingMs(1_000, 5_000, 0)).toBe(0);
    expect(remainingMs(null, 5_000, 0)).toBeNull();
  });

  it("gives an extra-time player their own deadline", () => {
    const cursor = cursorWith({ deadline: 100, extraTimeDeadline: 150 });
    expect(ownDeadlineOf(cursor, true)).toBe(150);
    expect(ownDeadlineOf(cursor, false)).toBe(100);
    const withoutExtra = cursorWith({ deadline: 100, extraTimeDeadline: null });
    expect(ownDeadlineOf(withoutExtra, true)).toBe(100);
    expect(ownDeadlineOf(withoutExtra, false)).toBe(100);
  });
});
