import { describe, it, expect } from "vitest";
import {
  parseDate,
  formatIsoDate,
  addDays,
  addMonths,
  getDaysInMonth,
  weekdayOf,
  compareDate,
  isSameDate,
  firstDayOfWeek,
  startOfWeek,
  todayPlain,
} from "./plainDate";

describe("plainDate", () => {
  it("parses yyyy-mm-dd without UTC off-by-one", () => {
    // The classic bug: new Date('2026-03-05') is UTC midnight -> 4th in the Americas.
    expect(parseDate("2026-03-05")).toEqual({ year: 2026, month: 3, day: 5 });
  });
  it("rejects malformed input", () => {
    expect(parseDate("nope")).toBeNull();
    expect(parseDate("2026-13-40")).toBeNull();
  });
  it("round-trips format", () => {
    expect(formatIsoDate({ year: 2026, month: 3, day: 5 })).toBe("2026-03-05");
  });
  it("addDays crosses month and year boundaries", () => {
    expect(addDays({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 1,
    });
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
  });
  it("addMonths clamps overflowing day (Jan 31 + 1mo = Feb 28)", () => {
    expect(addMonths({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
  });
  it("getDaysInMonth handles leap years", () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
    expect(getDaysInMonth(2026, 2)).toBe(28);
  });
  it("weekdayOf: 2026-03-05 is Thursday (4)", () => {
    expect(weekdayOf({ year: 2026, month: 3, day: 5 })).toBe(4);
  });
  it("compareDate / isSameDate", () => {
    expect(
      compareDate(
        { year: 2026, month: 1, day: 1 },
        { year: 2026, month: 1, day: 2 },
      ),
    ).toBeLessThan(0);
    expect(
      isSameDate(
        { year: 2026, month: 1, day: 1 },
        { year: 2026, month: 1, day: 1 },
      ),
    ).toBe(true);
    expect(isSameDate(null, null)).toBe(false);
  });
  it("firstDayOfWeek: en=Sunday(0), pt=Monday(1)", () => {
    expect(firstDayOfWeek("en-US")).toBe(0);
    expect(firstDayOfWeek("pt")).toBe(1);
  });
  it("startOfWeek respects weekStart", () => {
    // 2026-03-05 is Thursday; week starting Sunday -> 2026-03-01
    expect(startOfWeek({ year: 2026, month: 3, day: 5 }, 0)).toEqual({
      year: 2026,
      month: 3,
      day: 1,
    });
    // week starting Monday -> 2026-03-02
    expect(startOfWeek({ year: 2026, month: 3, day: 5 }, 1)).toEqual({
      year: 2026,
      month: 3,
      day: 2,
    });
  });
  it("todayPlain returns a valid plain date", () => {
    const today = todayPlain();
    expect(today.month).toBeGreaterThanOrEqual(1);
    expect(today.month).toBeLessThanOrEqual(12);
  });
});
