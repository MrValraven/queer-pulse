import { describe, expect, it } from "vitest";
import { vjClockTimeOf, vjCountdownDurationMs } from "./vjCountdownTarget";

/** 6 November 2026, 21:00:00 on the test machine's own clock. */
const NINE_PM = new Date(2026, 10, 6, 21, 0, 0, 0).getTime();

describe("vjCountdownDurationMs", () => {
  it("minutes from now", () => {
    expect(
      vjCountdownDurationMs({ mode: "minutes", minutes: 10 }, NINE_PM),
    ).toBe(600_000);
    expect(
      vjCountdownDurationMs({ mode: "minutes", minutes: 1 }, NINE_PM),
    ).toBe(60_000);
  });

  it("a clock time later today", () => {
    expect(
      vjCountdownDurationMs({ mode: "clock", hours: 21, minutes: 30 }, NINE_PM),
    ).toBe(30 * 60_000);
    expect(
      vjCountdownDurationMs(
        { mode: "clock", hours: 23, minutes: 59 },
        NINE_PM + 15_000,
      ),
    ).toBe((2 * 60 + 59) * 60_000 - 15_000);
  });

  it("a clock time already past is past", () => {
    expect(
      vjCountdownDurationMs({ mode: "clock", hours: 20, minutes: 45 }, NINE_PM),
    ).toBe("past");
    expect(
      vjCountdownDurationMs({ mode: "clock", hours: 21, minutes: 0 }, NINE_PM),
    ).toBe("past");
  });

  it("a clock time under one second away is past", () => {
    expect(
      vjCountdownDurationMs(
        { mode: "clock", hours: 21, minutes: 1 },
        NINE_PM + 59_500,
      ),
    ).toBe("past");
  });

  it("a length over 24 hours is too far", () => {
    expect(
      vjCountdownDurationMs({ mode: "minutes", minutes: 24 * 60 + 1 }, NINE_PM),
    ).toBe("tooFar");
  });
});

describe("vjClockTimeOf", () => {
  it("reads hours and minutes from a time input value", () => {
    expect(vjClockTimeOf("21:30")).toEqual({ hours: 21, minutes: 30 });
    expect(vjClockTimeOf("07:05:00")).toEqual({ hours: 7, minutes: 5 });
  });

  it("answers null for an empty or impossible value", () => {
    expect(vjClockTimeOf("")).toBeNull();
    expect(vjClockTimeOf("25:00")).toBeNull();
  });
});
