import { describe, expect, it } from "vitest";
import { WORD_DIFF_MAX_CELLS, wordDiff, type DiffSegment } from "./wordDiff";

/** The `same` + `removed` segments, concatenated in order, must reproduce `before`. */
function reconstructBefore(segments: DiffSegment[]): string {
  return segments
    .filter((segment) => segment.kind === "same" || segment.kind === "removed")
    .map((segment) => segment.text)
    .join("");
}

/** The `same` + `added` segments, concatenated in order, must reproduce `after`. */
function reconstructAfter(segments: DiffSegment[]): string {
  return segments
    .filter((segment) => segment.kind === "same" || segment.kind === "added")
    .map((segment) => segment.text)
    .join("");
}

describe("wordDiff", () => {
  it("reports no change for identical strings", () => {
    expect(wordDiff("Hello world", "Hello world")).toEqual([
      { kind: "same", text: "Hello world" },
    ]);
  });

  it("returns nothing for two empty strings", () => {
    expect(wordDiff("", "")).toEqual([]);
  });

  it("reports a whole added segment when before was empty", () => {
    expect(wordDiff("", "Hello world")).toEqual([
      { kind: "added", text: "Hello world" },
    ]);
  });

  it("reports a whole removed segment when after is empty", () => {
    expect(wordDiff("Hello world", "")).toEqual([
      { kind: "removed", text: "Hello world" },
    ]);
  });

  it("isolates one changed word in the middle of a sentence", () => {
    expect(wordDiff("the quick fox jumps", "the slow fox jumps")).toEqual([
      { kind: "same", text: "the " },
      { kind: "removed", text: "quick" },
      { kind: "added", text: "slow" },
      { kind: "same", text: " fox jumps" },
    ]);
  });

  it("groups a multi-word replacement instead of alternating word by word", () => {
    expect(wordDiff("the quick brown", "the slow red")).toEqual([
      { kind: "same", text: "the " },
      { kind: "removed", text: "quick brown" },
      { kind: "added", text: "slow red" },
    ]);
  });

  it("preserves a newline inside an unchanged run", () => {
    expect(wordDiff("line one\nline two", "line one\nline three")).toEqual([
      { kind: "same", text: "line one\nline " },
      { kind: "removed", text: "two" },
      { kind: "added", text: "three" },
    ]);
  });

  it("never emits an empty-text segment", () => {
    const segments = wordDiff("a b c", "a b c d");
    for (const segment of segments) {
      expect(segment.text.length).toBeGreaterThan(0);
    }
  });

  it("exposes the cap used to fall back on a whole-middle replacement", () => {
    expect(WORD_DIFF_MAX_CELLS).toBe(250_000);
  });

  it("falls back to one removed and one added block once the middle exceeds the cell cap", () => {
    const beforeWords = Array.from(
      { length: 600 },
      (_unused, index) => `beforeWord${index}`,
    );
    const afterWords = Array.from(
      { length: 600 },
      (_unused, index) => `afterWord${index}`,
    );
    const before = `same start ${beforeWords.join(" ")} same end`;
    const after = `same start ${afterWords.join(" ")} same end`;

    // The middle alone (600 words plus the 599 spaces between them, each side)
    // is well past WORD_DIFF_MAX_CELLS once multiplied, so this exercises the
    // fallback branch rather than the LCS table.
    expect(1199 * 1199).toBeGreaterThan(WORD_DIFF_MAX_CELLS);

    expect(wordDiff(before, after)).toEqual([
      { kind: "same", text: "same start " },
      { kind: "removed", text: beforeWords.join(" ") },
      { kind: "added", text: afterWords.join(" ") },
      { kind: "same", text: " same end" },
    ]);
  });

  describe("the reconstruction invariant", () => {
    const pairs: Array<[string, string]> = [
      ["the quick fox jumps", "the slow fox jumps"],
      ["the quick brown", "the slow red"],
      ["line one\nline two", "line one\nline three"],
      ["", "hello there"],
      ["hello there", ""],
      ["same text throughout", "same text throughout"],
      ["  leading and trailing  ", " leading and trailing "],
      ["one two three", "four five six seven"],
      ["a repeated repeated word", "a repeated word"],
    ];

    it.each(pairs)("rebuilds both sides for %j -> %j", (before, after) => {
      const segments = wordDiff(before, after);
      expect(reconstructBefore(segments)).toBe(before);
      expect(reconstructAfter(segments)).toBe(after);
    });
  });
});
