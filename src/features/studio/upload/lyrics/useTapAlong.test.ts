import { describe, expect, it } from "vitest";
import { initialStampsFor, nudgeStamp, stampNext } from "./useTapAlong";

describe("tap-along stamps", () => {
  it("stamps the next empty line and never goes backwards", () => {
    expect(stampNext([null, null], 1500)).toEqual([1500, null]);
    expect(stampNext([1500, null], 1200)).toEqual([1500, 1500]);
    expect(stampNext([1500, 2000], 3000)).toEqual([1500, 2000]);
  });

  it("nudges by 100 ms between its neighbours", () => {
    expect(nudgeStamp([1000, 1500, 1550], 1, 100)).toEqual([1000, 1550, 1550]);
    expect(nudgeStamp([1000, 1050, 2000], 1, -100)).toEqual([1000, 1000, 2000]);
    expect(nudgeStamp([50, 2000], 0, -100)).toEqual([0, 2000]);
    expect(nudgeStamp([null, 2000], 0, 100)).toEqual([null, 2000]);
  });

  it("reuses saved timings only when they match the lyric lines", () => {
    const saved = [
      { ms: 100, text: "One" },
      { ms: 900, text: "" },
      { ms: 2000, text: "Two" },
    ];
    expect(initialStampsFor(["One", "Two"], saved)).toEqual([100, 2000]);
    expect(initialStampsFor(["One", "Three"], saved)).toEqual([null, null]);
    expect(initialStampsFor(["One"], null)).toEqual([null]);
  });
});
