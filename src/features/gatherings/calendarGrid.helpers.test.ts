import { describe, expect, it } from "vitest";
import { sameDay, spansDay } from "./calendarGrid.helpers";

/**
 * The month grid asks each day cell "is anything on today?". It used to ask
 * "does anything START today?", so a three-day festival showed one dot and
 * clicking day two claimed the day was empty.
 */

/** A local-zone calendar day at noon, so no test depends on the runner's zone. */
function day(year: number, month: number, dayOfMonth: number): Date {
  return new Date(year, month - 1, dayOfMonth, 12, 0, 0);
}

describe("sameDay", () => {
  it("compares calendar days, ignoring the clock", () => {
    expect(sameDay(day(2026, 10, 17), new Date(2026, 9, 17, 23, 30))).toBe(
      true,
    );
    expect(sameDay(day(2026, 10, 17), day(2026, 10, 18))).toBe(false);
  });
});

describe("spansDay", () => {
  it("covers every day a three-day festival runs on", () => {
    const start = new Date(2026, 9, 17, 18, 0);
    const end = new Date(2026, 9, 19, 22, 0);
    expect(spansDay(start, end, day(2026, 10, 17))).toBe(true);
    expect(spansDay(start, end, day(2026, 10, 18))).toBe(true);
    expect(spansDay(start, end, day(2026, 10, 19))).toBe(true);
  });

  it("stops at the days either side of the span", () => {
    const start = new Date(2026, 9, 17, 18, 0);
    const end = new Date(2026, 9, 19, 22, 0);
    expect(spansDay(start, end, day(2026, 10, 16))).toBe(false);
    expect(spansDay(start, end, day(2026, 10, 20))).toBe(false);
  });

  it("covers both days of an overnight gathering", () => {
    const start = new Date(2026, 9, 17, 23, 0);
    const end = new Date(2026, 9, 18, 4, 0);
    expect(spansDay(start, end, day(2026, 10, 17))).toBe(true);
    expect(spansDay(start, end, day(2026, 10, 18))).toBe(true);
  });

  it("occupies only its start day when there is no end", () => {
    const start = new Date(2026, 9, 17, 19, 0);
    expect(spansDay(start, undefined, day(2026, 10, 17))).toBe(true);
    expect(spansDay(start, undefined, day(2026, 10, 18))).toBe(false);
  });

  it("reads an end that lands before the start as no end at all", () => {
    const start = new Date(2026, 9, 17, 19, 0);
    const brokenEnd = new Date(2026, 9, 16, 19, 0);
    expect(spansDay(start, brokenEnd, day(2026, 10, 17))).toBe(true);
    expect(spansDay(start, brokenEnd, day(2026, 10, 16))).toBe(false);
  });
});
