import { describe, expect, it } from "vitest";
import { communityDraftProgress } from "./startCommunityDraftProgress";

describe("community draft progress", () => {
  it("names the panels still invalid by their keys", () => {
    const missingByStep = {
      0: [],
      1: ["communities:start.missing.name"],
      2: [],
      3: ["communities:start.missing.access"],
      4: [],
      5: [],
      6: [],
      7: [],
      8: ["communities:start.missing.handle"],
    };
    expect(communityDraftProgress(missingByStep, 3).missing).toEqual([
      "why",
      "safety",
      "confirm",
    ]);
  });

  it("counts the step reached out of every panel", () => {
    expect(communityDraftProgress({}, 0).progress).toEqual({
      done: 1,
      total: 9,
    });
    expect(communityDraftProgress({}, 8).progress).toEqual({
      done: 9,
      total: 9,
    });
  });
});
