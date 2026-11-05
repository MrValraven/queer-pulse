import { describe, expect, it } from "vitest";
import {
  isLeadFollowUpDay,
  isLeadFollowUpDue,
  lisbonLeadDay,
  shiftLeadDay,
} from "./leadDates";

const TODAY = "2026-11-05";
const YESTERDAY = "2026-11-04";
const TOMORROW = "2026-11-06";

describe("leadDates", () => {
  it("reads the Lisbon day across UTC midnight", () => {
    expect(lisbonLeadDay(new Date("2026-07-01T23:30:00Z"))).toBe("2026-07-02");
    expect(lisbonLeadDay(new Date("2026-01-01T23:30:00Z"))).toBe("2026-01-01");
  });

  it("shifts a day across a month end", () => {
    expect(shiftLeadDay("2026-10-30", 3)).toBe("2026-11-02");
    expect(shiftLeadDay("2026-10-30", -31)).toBe("2026-09-29");
    expect(shiftLeadDay("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftLeadDay(TODAY, 0)).toBe(TODAY);
  });

  it("accepts only real days in range", () => {
    expect(isLeadFollowUpDay("2026-02-29")).toBe(false);
    expect(isLeadFollowUpDay("2028-02-29")).toBe(true);
    expect(isLeadFollowUpDay("1999-12-31")).toBe(false);
    expect(isLeadFollowUpDay("2101-01-01")).toBe(false);
    expect(isLeadFollowUpDay("2026-1-5")).toBe(false);
    expect(isLeadFollowUpDay("2000-01-01")).toBe(true);
    expect(isLeadFollowUpDay("2100-12-31")).toBe(true);
    expect(isLeadFollowUpDay(20261105)).toBe(false);
    expect(isLeadFollowUpDay(null)).toBe(false);
  });

  it("calls a follow-up due only in an open stage", () => {
    expect(isLeadFollowUpDue("in_talks", TODAY, TODAY)).toBe(true);
    expect(isLeadFollowUpDue("contacted", YESTERDAY, TODAY)).toBe(true);
    expect(isLeadFollowUpDue("on_board", YESTERDAY, TODAY)).toBe(false);
    expect(isLeadFollowUpDue("not_now", YESTERDAY, TODAY)).toBe(false);
    expect(isLeadFollowUpDue("to_contact", TOMORROW, TODAY)).toBe(false);
    expect(isLeadFollowUpDue("to_contact", null, TODAY)).toBe(false);
  });
});
