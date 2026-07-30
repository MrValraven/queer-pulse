import { describe, it, expect } from "vitest";
import { openStatus } from "./directoryPlaces";

const at = (dayOffset: number, hour: number, minute = 0) => {
  // 2026-06-01 is a Monday; add `dayOffset` days, set the clock.
  return new Date(2026, 5, 1 + dayOffset, hour, minute);
};

describe("openStatus", () => {
  it("returns unknown when no hours are set", () => {
    expect(openStatus(undefined, at(4, 20)).state).toBe("unknown");
    expect(openStatus({}, at(4, 20)).state).toBe("unknown");
  });
  it("is open inside a normal same-day window", () => {
    const hours = { Fri: { open: true, from: "18:00", to: "23:00" } };
    expect(openStatus(hours, at(4, 20)).state).toBe("open"); // Fri 20:00
  });
  it("is closed before opening and on a closed day", () => {
    const hours = { Fri: { open: true, from: "18:00", to: "23:00" } };
    expect(openStatus(hours, at(4, 12)).state).toBe("closed"); // Fri 12:00
    expect(openStatus(hours, at(0, 20)).state).toBe("closed"); // Mon
  });
  it("handles a window that closes after midnight", () => {
    const hours = { Fri: { open: true, from: "18:00", to: "02:00" } };
    expect(openStatus(hours, at(5, 1)).state).toBe("open"); // Sat 01:00
  });
});
