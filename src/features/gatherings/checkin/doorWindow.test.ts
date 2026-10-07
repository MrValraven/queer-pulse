import { describe, expect, it } from "vitest";
import { HOUR_MS, gatheringLiveState, isDoorWindow } from "./doorWindow";

const start = new Date("2026-10-10T20:00:00Z");
const at = (offsetMs: number) => new Date(start.getTime() + offsetMs);

describe("isDoorWindow", () => {
  it("opens three hours before the start", () => {
    expect(isDoorWindow(start, null, at(-3 * HOUR_MS - 1))).toBe(false);
    expect(isDoorWindow(start, null, at(-3 * HOUR_MS))).toBe(true);
  });

  it("closes two hours after a stated end", () => {
    const end = at(4 * HOUR_MS);
    expect(isDoorWindow(start, end, at(6 * HOUR_MS))).toBe(true);
    expect(isDoorWindow(start, end, at(6 * HOUR_MS + 1))).toBe(false);
  });

  it("assumes eight hours when there is no end", () => {
    expect(isDoorWindow(start, undefined, at(8 * HOUR_MS))).toBe(true);
    expect(isDoorWindow(start, undefined, at(8 * HOUR_MS + 1))).toBe(false);
  });

  it("stays open across a multi-day gathering", () => {
    const end = at(48 * HOUR_MS);
    expect(isDoorWindow(start, end, at(30 * HOUR_MS))).toBe(true);
  });
});

describe("gatheringLiveState", () => {
  it("is upcoming more than a day out", () => {
    expect(gatheringLiveState(start, null, at(-25 * HOUR_MS))).toEqual({
      kind: "upcoming",
      startAt: start,
    });
  });

  it("counts down hours and minutes inside a day", () => {
    expect(
      gatheringLiveState(start, null, at(-(2 * HOUR_MS + 5 * 60_000))),
    ).toEqual({ kind: "startsIn", hours: 2, minutes: 5 });
  });

  it("is live from the start until the end", () => {
    expect(gatheringLiveState(start, at(HOUR_MS), start)).toEqual({
      kind: "live",
    });
  });

  it("is ended after the end, and after eight hours with no end", () => {
    expect(gatheringLiveState(start, at(HOUR_MS), at(HOUR_MS + 1))).toEqual({
      kind: "ended",
    });
    expect(gatheringLiveState(start, null, at(8 * HOUR_MS + 1))).toEqual({
      kind: "ended",
    });
  });
});
