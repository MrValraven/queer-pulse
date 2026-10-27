import { describe, expect, it } from "vitest";
import { countdownPartsOf } from "./studioCountdown";

const now = new Date("2026-10-26T12:00:00.000Z");
const at = (hoursAhead: number) =>
  new Date(now.getTime() + hoursAhead * 3_600_000);

describe("countdownPartsOf", () => {
  it("reads days and hours, rounding the hours down", () => {
    expect(countdownPartsOf(at(4 * 24 + 17.9), now)).toEqual({
      kind: "daysAndHours",
      days: 4,
      hours: 17,
    });
    expect(countdownPartsOf(at(48), now)).toEqual({
      kind: "daysAndHours",
      days: 2,
      hours: 0,
    });
    expect(countdownPartsOf(at(5), now)).toEqual({
      kind: "daysAndHours",
      days: 0,
      hours: 5,
    });
  });

  it("reads under an hour, and now once the time has passed", () => {
    expect(countdownPartsOf(at(40 / 60), now)).toEqual({
      kind: "underAnHour",
    });
    expect(countdownPartsOf(at(-0.2), now)).toEqual({ kind: "now" });
    expect(countdownPartsOf(at(0), now)).toEqual({ kind: "now" });
  });
});
