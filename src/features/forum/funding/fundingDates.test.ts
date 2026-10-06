import { describe, expect, it } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import {
  deadlineCountdown,
  formatLisbonDeadline,
  formatViewerDeadline,
  isoToLisbonWallClock,
  isViewerOffsetFromLisbon,
  lisbonEndOfDayIso,
  lisbonWallClockToIso,
} from "./fundingDates";

const fmt = createFormatters("en");
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

describe("fundingDates", () => {
  it("converts a summer Lisbon wall clock (UTC+1) to the right instant", () => {
    expect(lisbonWallClockToIso("2026-07-31T17:00")).toBe(
      "2026-07-31T16:00:00.000Z",
    );
  });

  it("converts a winter Lisbon wall clock (UTC+0) after the October change", () => {
    expect(lisbonWallClockToIso("2026-11-30T17:00")).toBe(
      "2026-11-30T17:00:00.000Z",
    );
  });

  it("reads an instant back as a Lisbon wall clock", () => {
    expect(isoToLisbonWallClock("2026-07-31T16:00:00.000Z")).toBe(
      "2026-07-31T17:00",
    );
  });

  it("ends a fundraiser at 23:59 Lisbon time on its last day", () => {
    expect(lisbonEndOfDayIso("2026-07-31")).toBe("2026-07-31T22:59:00.000Z");
  });

  it("settles times around the 25 October 2026 change", () => {
    expect(lisbonWallClockToIso("2026-10-24T23:59")).toBe(
      "2026-10-24T22:59:00.000Z",
    );
    expect(lisbonWallClockToIso("2026-10-25T00:30")).toBe(
      "2026-10-24T23:30:00.000Z",
    );
    expect(lisbonWallClockToIso("2026-10-25T02:00")).toBe(
      "2026-10-25T02:00:00.000Z",
    );
    expect(lisbonEndOfDayIso("2026-10-24")).toBe("2026-10-24T22:59:00.000Z");
    expect(lisbonEndOfDayIso("2026-10-25")).toBe("2026-10-25T23:59:00.000Z");
  });

  it("round-trips a deadline on each side of the change", () => {
    for (const wallClock of ["2026-10-24T23:59", "2026-10-25T02:00"]) {
      const iso = lisbonWallClockToIso(wallClock);
      expect(iso && isoToLisbonWallClock(iso)).toBe(wallClock);
    }
  });

  it("reads a London viewer around the change as level with Lisbon", () => {
    expect(
      isViewerOffsetFromLisbon("2026-10-25T00:30:00.000Z", "Europe/London"),
    ).toBe(false);
    expect(
      isViewerOffsetFromLisbon("2026-10-25T01:30:00.000Z", "Europe/London"),
    ).toBe(false);
    expect(
      isViewerOffsetFromLisbon("2026-10-25T01:30:00.000Z", "America/New_York"),
    ).toBe(true);
  });

  it("refuses an out-of-range wall clock", () => {
    expect(lisbonWallClockToIso("2026-13-01T10:00")).toBeNull();
    expect(lisbonWallClockToIso("2026-02-30T10:00")).toBeNull();
    expect(lisbonWallClockToIso("2026-07-31T24:00")).toBeNull();
    expect(lisbonWallClockToIso("2026-07-31T10:60")).toBeNull();
  });

  it("refuses a wall clock it cannot read", () => {
    expect(lisbonWallClockToIso("31/07/2026 17:00")).toBeNull();
  });

  it("prints Lisbon time whatever zone the runner is in", () => {
    expect(formatLisbonDeadline(fmt, "2026-07-31T16:00:00.000Z")).toContain(
      "17:00",
    );
  });

  it("prints the viewer's own time for a New York viewer", () => {
    expect(
      formatViewerDeadline(fmt, "2026-07-31T16:00:00.000Z", "America/New_York"),
    ).toContain("12:00");
  });

  it("knows when a viewer is offset from Lisbon at that instant", () => {
    const deadline = "2026-07-31T16:00:00.000Z";
    expect(isViewerOffsetFromLisbon(deadline, "America/New_York")).toBe(true);
    expect(isViewerOffsetFromLisbon(deadline, "Europe/Lisbon")).toBe(false);
    expect(isViewerOffsetFromLisbon(deadline, "Europe/London")).toBe(false);
  });

  it("counts down in days, hours and the last hour, then closes", () => {
    const deadline = "2026-07-31T16:00:00.000Z";
    const deadlineMs = Date.parse(deadline);
    expect(
      deadlineCountdown(deadline, deadlineMs - 3 * DAY_MS - HOUR_MS),
    ).toEqual({ kind: "days", count: 3 });
    expect(deadlineCountdown(deadline, deadlineMs - 5 * HOUR_MS)).toEqual({
      kind: "hours",
      count: 5,
    });
    expect(deadlineCountdown(deadline, deadlineMs - 10 * 60 * 1000)).toEqual({
      kind: "withinHour",
    });
    expect(deadlineCountdown(deadline, deadlineMs)).toEqual({ kind: "closed" });
  });
});
