import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  gigCountdown,
  gigDateParts,
  gigSortTime,
  toGigDayValue,
} from "./gigDate";

/** Local noon on 1 Nov 2026, a Sunday. */
const FIXED_NOW = new Date(2026, 10, 1, 12, 0, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("gigDateParts", () => {
  it("shows the weekday for a day in the current year", () => {
    const parts = gigDateParts("2026-11-14", "en", FIXED_NOW);
    expect(parts.precision).toBe("day");
    expect(parts.monthLabel).toBe("NOV");
    expect(parts.dayLabel).toBe("14");
    expect(parts.bottomLabel).toBe("Sat");
    expect(parts.isUpcoming).toBe(true);
  });

  it("shows the year for a day in another year", () => {
    const parts = gigDateParts("2027-03-14", "en", FIXED_NOW);
    expect(parts.monthLabel).toBe("MAR");
    expect(parts.dayLabel).toBe("14");
    expect(parts.bottomLabel).toBe("2027");
  });

  it("parses the legacy day-month-year text", () => {
    const parts = gigDateParts("14 Mar 2027", "en", FIXED_NOW);
    expect(parts.precision).toBe("day");
    expect(parts.dayLabel).toBe("14");
    expect(parts.rawText).toBe("14 Mar 2027");
  });

  it("gives month precision for a month and year", () => {
    const parts = gigDateParts("Sep 2025", "en", FIXED_NOW);
    expect(parts.precision).toBe("month");
    expect(parts.monthLabel).toBe("SEP");
    expect(parts.dayLabel).toBe("");
    expect(parts.bottomLabel).toBe("2025");
    expect(parts.isUpcoming).toBe(false);
  });

  it("gives year precision for a bare year", () => {
    const parts = gigDateParts("2027", "en", FIXED_NOW);
    expect(parts.precision).toBe("year");
    expect(parts.monthLabel).toBe("");
    expect(parts.bottomLabel).toBe("2027");
  });

  it("keeps unparseable text as unknown with the raw text", () => {
    const parts = gigDateParts("Sundays", "en", FIXED_NOW);
    expect(parts.precision).toBe("unknown");
    expect(parts.rawText).toBe("Sundays");
    expect(parts.monthLabel).toBe("");
    expect(parts.isUpcoming).toBe(false);
  });

  it("treats an empty string as none and Past", () => {
    const parts = gigDateParts("", "en", FIXED_NOW);
    expect(parts.precision).toBe("none");
    expect(parts.isUpcoming).toBe(false);
  });

  it("rejects an impossible calendar day without throwing", () => {
    expect(gigDateParts("2027-02-31", "en", FIXED_NOW).precision).toBe(
      "unknown",
    );
  });

  it("does not throw for a malformed language tag", () => {
    expect(() => gigDateParts("2027-03-14", "!!", FIXED_NOW)).not.toThrow();
  });

  it("localizes month labels", () => {
    expect(gigDateParts("2027-02-14", "pt", FIXED_NOW).monthLabel).toBe("FEV");
  });
});

describe("toGigDayValue", () => {
  it("passes a yyyy-mm-dd day through", () => {
    expect(toGigDayValue("2027-03-14")).toBe("2027-03-14");
  });

  it("converts a legacy day with local date parts", () => {
    expect(toGigDayValue("14 Mar 2027")).toBe("2027-03-14");
  });

  it("returns empty for month text, free text and empty", () => {
    expect(toGigDayValue("Sep 2025")).toBe("");
    expect(toGigDayValue("Sundays")).toBe("");
    expect(toGigDayValue("")).toBe("");
  });
});

describe("gigSortTime", () => {
  it("orders days chronologically", () => {
    const earlier = gigSortTime("2027-03-14");
    const later = gigSortTime("2027-03-15");
    expect(earlier).not.toBeNull();
    expect(later).not.toBeNull();
    expect(earlier!).toBeLessThan(later!);
  });

  it("returns null for empty and unparseable text", () => {
    expect(gigSortTime("")).toBeNull();
    expect(gigSortTime("Sundays")).toBeNull();
  });
});

describe("gigCountdown", () => {
  it("says Today and Tomorrow", () => {
    expect(gigCountdown("2026-11-01", "en", FIXED_NOW)).toBe("Today");
    expect(gigCountdown("2026-11-02", "en", FIXED_NOW)).toBe("Tomorrow");
  });

  it("counts days inside the 30 day window", () => {
    expect(gigCountdown("2026-11-04", "en", FIXED_NOW)).toBe("in 3 days");
    expect(gigCountdown("2026-12-01", "en", FIXED_NOW)).toBe("in 30 days");
  });

  it("returns null past the window, for past gigs and for non-day dates", () => {
    expect(gigCountdown("2026-12-02", "en", FIXED_NOW)).toBeNull();
    expect(gigCountdown("2026-10-31", "en", FIXED_NOW)).toBeNull();
    expect(gigCountdown("Sep 2025", "en", FIXED_NOW)).toBeNull();
    expect(gigCountdown("", "en", FIXED_NOW)).toBeNull();
  });
});
