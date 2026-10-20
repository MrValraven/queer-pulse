import { describe, expect, it } from "vitest";
import { orderRevealEntries } from "./quizshowRevealOrder";

interface TestEntry {
  optionId: string;
  isTruth: boolean;
  voteCount: number;
}

function entry(
  optionId: string,
  voteCount: number,
  isTruth = false,
): TestEntry {
  return { optionId, voteCount, isTruth };
}

function optionIdsOf(entries: readonly TestEntry[]): string[] {
  return entries.map((orderedEntry) => orderedEntry.optionId);
}

describe("orderRevealEntries", () => {
  it("lists the entries with the most votes first", () => {
    const ordered = orderRevealEntries([
      entry("few", 1),
      entry("most", 5),
      entry("some", 3),
    ]);
    expect(optionIdsOf(ordered)).toEqual(["most", "some", "few"]);
  });

  it("puts the truth first whatever its vote count", () => {
    const ordered = orderRevealEntries([
      entry("popular-lie", 6),
      entry("truth", 0, true),
      entry("quiet-lie", 2),
    ]);
    expect(optionIdsOf(ordered)).toEqual(["truth", "popular-lie", "quiet-lie"]);
  });

  it("keeps the arrival order between entries with equal votes", () => {
    const ordered = orderRevealEntries([
      entry("first-tied", 2),
      entry("leader", 4),
      entry("second-tied", 2),
      entry("third-tied", 2),
    ]);
    expect(optionIdsOf(ordered)).toEqual([
      "leader",
      "first-tied",
      "second-tied",
      "third-tied",
    ]);
  });

  it("returns a new array and leaves the input untouched", () => {
    const entries = [entry("low", 1), entry("high", 2)];
    const ordered = orderRevealEntries(entries);
    expect(ordered).not.toBe(entries);
    expect(optionIdsOf(entries)).toEqual(["low", "high"]);
    expect(orderRevealEntries([])).toEqual([]);
  });
});
