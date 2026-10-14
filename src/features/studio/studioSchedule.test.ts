import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import {
  defaultScheduleValues,
  instantFromValues,
  scheduleInputBounds,
  scheduleProblemOf,
  scheduleReadback,
} from "./studioSchedule";

const now = new Date(2026, 9, 13, 10, 0);

describe("schedule values", () => {
  it("defaults to tomorrow at 18:00 in the member's zone", () => {
    expect(defaultScheduleValues(now)).toEqual({
      date: "2026-10-14",
      time: "18:00",
    });
  });

  it("reads a local date and time as one instant", () => {
    const instant = instantFromValues({ date: "2026-10-20", time: "18:00" });
    expect(instant?.getFullYear()).toBe(2026);
    expect(instant?.getMonth()).toBe(9);
    expect(instant?.getDate()).toBe(20);
    expect(instant?.getHours()).toBe(18);
  });

  it("refuses a half-filled or impossible date", () => {
    expect(instantFromValues({ date: "", time: "18:00" })).toBeNull();
    expect(instantFromValues({ date: "2026-10-20", time: "" })).toBeNull();
    expect(instantFromValues({ date: "2026-02-30", time: "10:00" })).toBeNull();
  });
});

describe("a clock change in the member's zone", () => {
  // Pinned per test: the global afterEach (src/test/setup.ts) unstubs every
  // env after each test.
  beforeEach(() => {
    vi.stubEnv("TZ", "Europe/Lisbon");
  });

  it("refuses a time the spring-forward night skips", () => {
    // Lisbon jumps from 01:00 to 02:00 on 28 March 2027.
    const skipped = { date: "2027-03-28", time: "01:30" };
    expect(instantFromValues(skipped)).toBeNull();
    expect(scheduleProblemOf(instantFromValues(skipped), now)).toBe(
      "incomplete",
    );
  });

  it("reads the hour after the jump as itself", () => {
    const instant = instantFromValues({ date: "2027-03-28", time: "02:30" });
    expect(instant?.getHours()).toBe(2);
    expect(instant?.getMinutes()).toBe(30);
    expect(instant?.toISOString()).toBe("2027-03-28T01:30:00.000Z");
  });

  it("accepts the hour the autumn night repeats, at its first pass", () => {
    // Lisbon falls back from 02:00 to 01:00 on 31 October 2027, so 01:30
    // happens twice; the first one is 01:30 +01:00.
    const instant = instantFromValues({ date: "2027-10-31", time: "01:30" });
    expect(instant?.getHours()).toBe(1);
    expect(instant?.getMinutes()).toBe(30);
    expect(instant?.toISOString()).toBe("2027-10-31T00:30:00.000Z");
  });
});

describe("the server's window", () => {
  it("needs at least 15 minutes", () => {
    expect(scheduleProblemOf(new Date(2026, 9, 13, 10, 10), now)).toBe(
      "tooSoon",
    );
    expect(scheduleProblemOf(new Date(2026, 9, 13, 10, 15), now)).toBeNull();
  });

  it("stops at 365 days", () => {
    expect(scheduleProblemOf(new Date(2027, 9, 14, 10, 0), now)).toBe("tooFar");
    expect(scheduleProblemOf(new Date(2027, 9, 12, 10, 0), now)).toBeNull();
  });

  it("asks for both fields first", () => {
    expect(scheduleProblemOf(null, now)).toBe("incomplete");
  });

  it("bounds the date input to the window", () => {
    expect(scheduleInputBounds(now)).toEqual({
      min: "2026-10-13",
      max: "2027-10-13",
    });
  });
});

describe("read-back", () => {
  it("names the weekday, the day, the month and a 24-hour time", () => {
    const readback = scheduleReadback(
      new Date(2026, 9, 20, 18, 0),
      createFormatters("en"),
    );
    expect(readback.date).toMatch(/Tue,? (Oct 20|20 Oct)/);
    expect(readback.time).toBe("18:00");
    const pt = scheduleReadback(
      new Date(2026, 9, 20, 18, 0),
      createFormatters("pt-PT"),
    );
    expect(pt.time).toBe("18:00");
  });
});
