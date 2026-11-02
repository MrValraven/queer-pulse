import { describe, expect, it } from "vitest";
import {
  dateAfterCalendarKey,
  dateLabelLocale,
  formatCreatedEventWhen,
  formatMonthCaption,
  formatRowDate,
  formatRowDateLong,
  isDateSelectable,
  isEndNextDay,
  lastAllowedDate,
  monthCells,
  monthOf,
  rovingStartDate,
  shiftMonth,
  sortedDates,
  wallClockNow,
} from "./addMonthDates";

describe("addMonthDates", () => {
  it("wallClockNow reads the date and time in the template's zone", () => {
    // 2026-11-02T23:30:00Z is already 3 Nov 08:30 in Tokyo and still 2 Nov 23:30 in Lisbon
    expect(
      wallClockNow("Asia/Tokyo", new Date("2026-11-02T23:30:00Z")),
    ).toEqual({ date: "2026-11-03", time: "08:30" });
    expect(
      wallClockNow("Europe/Lisbon", new Date("2026-11-02T23:30:00Z")),
    ).toEqual({ date: "2026-11-02", time: "23:30" });
  });

  it("wallClockNow falls back to the device zone for a zone Intl cannot read", () => {
    expect(
      wallClockNow("Not/AZone", new Date("2026-11-02T10:00:00Z")).date,
    ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("lastAllowedDate is twelve calendar months ahead", () => {
    expect(lastAllowedDate("2026-11-02")).toBe("2027-11-02");
  });

  it("lastAllowedDate clamps the day into a shorter month", () => {
    expect(lastAllowedDate("2027-02-28")).toBe("2028-02-28");
    expect(lastAllowedDate("2028-02-29")).toBe("2029-02-28");
  });

  it("isDateSelectable keeps today and the last date and refuses the days outside", () => {
    const bounds = { today: "2026-11-02", lastDate: "2027-11-02" };
    expect(isDateSelectable("2026-11-02", bounds)).toBe(true);
    expect(isDateSelectable("2027-11-02", bounds)).toBe(true);
    expect(isDateSelectable("2026-11-01", bounds)).toBe(false);
    expect(isDateSelectable("2027-11-03", bounds)).toBe(false);
  });

  it("monthOf keeps the year and month of a date", () => {
    expect(monthOf("2026-11-07")).toBe("2026-11");
  });

  it("shiftMonth crosses a year in both directions", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2027-01", -1)).toBe("2026-12");
  });

  it("monthCells pads the first week to the locale's week start", () => {
    const mondayFirst = monthCells("2026-11", 1); // 1 Nov 2026 is a Sunday
    expect(mondayFirst.slice(0, 7)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      "2026-11-01",
    ]);
    expect(mondayFirst.filter(Boolean)).toHaveLength(30);
    expect(monthCells("2026-11", 0)[0]).toBe("2026-11-01");
  });

  it("sortedDates orders dates across months and drops repeats", () => {
    expect(sortedDates(["2026-12-05", "2026-11-28", "2026-12-05"])).toEqual([
      "2026-11-28",
      "2026-12-05",
    ]);
  });

  it("isEndNextDay reads an end at or before the start as the next day", () => {
    expect(isEndNextDay("22:00", "02:00")).toBe(true);
    expect(isEndNextDay("19:00", "19:00")).toBe(true);
    expect(isEndNextDay("19:00", "23:00")).toBe(false);
    expect(isEndNextDay("19:00", null)).toBe(false);
  });

  it("formatRowDate reads a calendar date the same in every device zone", () => {
    expect(formatRowDate("2026-11-06", "en")).toBe("Fri 6 Nov");
    expect(formatRowDate("2026-11-06", "pt")).toBe("sex. 6 nov.");
    expect(formatRowDate("2026-11-27", "pt")).toBe("sex. 27 nov.");
    expect(formatRowDate("2027-07-19", "pt")).toBe("seg. 19 jul.");
  });

  it("formatRowDateLong names the whole date for the calendar's buttons", () => {
    expect(formatRowDateLong("2026-11-07", "en")).toBe(
      "Saturday 7 November 2026",
    );
  });

  it("formatMonthCaption names the month and year", () => {
    expect(formatMonthCaption("2026-11", "en")).toBe("November 2026");
  });

  it("formatCreatedEventWhen formats the instant in the template's zone", () => {
    expect(
      formatCreatedEventWhen("2026-11-07T21:00:00Z", "Europe/Lisbon", "en"),
    ).toBe("Sat 7 Nov, 21:00");
    expect(
      formatCreatedEventWhen("2026-11-07T21:00:00Z", "Asia/Tokyo", "en"),
    ).toBe("Sun 8 Nov, 06:00");
  });

  it("formatCreatedEventWhen reads short Portuguese weekday and month names", () => {
    expect(
      formatCreatedEventWhen("2026-11-27T21:00:00Z", "Europe/Lisbon", "pt"),
    ).toBe("sex. 27 nov., 21:00");
  });

  it("formatRowDateLong and formatMonthCaption read whole Portuguese names", () => {
    expect(formatRowDateLong("2026-11-27", "pt")).toBe(
      "sexta-feira 27 novembro 2026",
    );
    expect(formatMonthCaption("2026-11", "pt")).toBe("novembro 2026");
  });

  it("dateLabelLocale hands Intl the bare language id the shared Calendar uses", () => {
    expect(dateLabelLocale("pt")).toBe("pt");
    expect(dateLabelLocale("en")).toBe("en");
  });

  it("dateAfterCalendarKey steps a day with the side arrows and a week with the others", () => {
    expect(dateAfterCalendarKey("2026-11-30", "ArrowRight", 1)).toBe(
      "2026-12-01",
    );
    expect(dateAfterCalendarKey("2026-11-01", "ArrowLeft", 1)).toBe(
      "2026-10-31",
    );
    expect(dateAfterCalendarKey("2026-11-10", "ArrowDown", 1)).toBe(
      "2026-11-17",
    );
    expect(dateAfterCalendarKey("2026-11-10", "ArrowUp", 1)).toBe("2026-11-03");
  });

  it("dateAfterCalendarKey keeps Home and End inside the day's month", () => {
    // Wednesday 11 Nov 2026 in a Monday-first week runs from 9 to 15 Nov
    expect(dateAfterCalendarKey("2026-11-11", "Home", 1)).toBe("2026-11-09");
    expect(dateAfterCalendarKey("2026-11-11", "End", 1)).toBe("2026-11-15");
    // Thursday 3 Dec sits in a week that starts on Monday 30 Nov
    expect(dateAfterCalendarKey("2026-12-03", "Home", 1)).toBe("2026-12-01");
    // Monday 30 Nov sits in a week that ends on 6 Dec
    expect(dateAfterCalendarKey("2026-11-30", "End", 1)).toBe("2026-11-30");
  });

  it("dateAfterCalendarKey pages a month with the day clamped and ignores other keys", () => {
    expect(dateAfterCalendarKey("2027-01-31", "PageDown", 1)).toBe(
      "2027-02-28",
    );
    expect(dateAfterCalendarKey("2026-12-15", "PageUp", 1)).toBe("2026-11-15");
    expect(dateAfterCalendarKey("2026-11-15", "Tab", 1)).toBeNull();
  });

  it("rovingStartDate prefers a picked day, then today, then the first pickable day", () => {
    const bounds = { today: "2026-11-02", lastDate: "2027-11-02" };
    expect(rovingStartDate("2026-11", new Set(["2026-11-20"]), bounds)).toBe(
      "2026-11-20",
    );
    expect(rovingStartDate("2026-11", new Set(["2026-12-05"]), bounds)).toBe(
      "2026-11-02",
    );
    expect(rovingStartDate("2026-12", new Set(), bounds)).toBe("2026-12-01");
  });
});
