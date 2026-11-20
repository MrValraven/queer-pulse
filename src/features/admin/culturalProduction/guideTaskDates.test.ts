import { describe, expect, it } from "vitest";
import { addCalendarDays, dueOnForStep } from "./guideTaskDates";

// The same table as the backend's `cultural-guide-sections.spec.ts`, so the
// preview and the created tasks agree on every due day.
describe("dueOnForStep", () => {
  it.each([
    ["2026-12-12", 42, "2026-10-31"],
    ["2026-12-12", 0, "2026-12-12"],
    ["2026-12-12", -1, "2026-12-13"],
    ["2027-03-01", 1, "2027-02-28"],
    ["2028-03-01", 1, "2028-02-29"],
    ["2026-12-12", null, null],
    ["2027-03-01", null, null],
  ] as const)(
    "reads %s with %s days before as %s",
    (eventOn, daysBefore, dueOn) => {
      expect(dueOnForStep(eventOn, daysBefore)).toBe(dueOn);
    },
  );
});

describe("addCalendarDays", () => {
  it("crosses month and year ends", () => {
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addCalendarDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(addCalendarDays("2026-03-29", 1)).toBe("2026-03-30");
  });

  it("keeps text that is no day unchanged", () => {
    expect(addCalendarDays("soon", 3)).toBe("soon");
  });
});
