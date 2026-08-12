import { describe, expect, it } from "vitest";
import { normalizePoemBlocks, poemToPlainText, poemLineIsEmpty } from "./poemModel";

describe("normalizePoemBlocks", () => {
  it("passes through new lines-shaped blocks", () => {
    const blocks = [{ kind: "stanza", id: "a", lines: [[{ text: "hi", marks: [] }]] }];
    expect(normalizePoemBlocks(blocks)).toEqual(blocks);
  });
  it("converts a legacy html stanza into lines (br split)", () => {
    const out = normalizePoemBlocks([{ kind: "stanza", id: "a", html: "one<br>two" }]);
    expect(out).toEqual([
      { kind: "stanza", id: "a", lines: [[{ text: "one", marks: [] }], [{ text: "two", marks: [] }]] },
    ]);
  });
  it("keeps a break block as-is", () => {
    expect(normalizePoemBlocks([{ kind: "break", id: "b" }])).toEqual([{ kind: "break", id: "b" }]);
  });
  it("returns [] for junk", () => {
    expect(normalizePoemBlocks(null)).toEqual([]);
    expect(normalizePoemBlocks("nope")).toEqual([]);
  });
});

describe("poemToPlainText", () => {
  it("joins lines by \\n, stanzas by blank line, breaks as * * *", () => {
    const text = poemToPlainText([
      { kind: "stanza", id: "1", lines: [[{ text: "a", marks: [] }], [{ text: "b", marks: [] }]] },
      { kind: "break", id: "2" },
      { kind: "stanza", id: "3", lines: [[{ text: "c", marks: [] }]] },
    ]);
    expect(text).toBe("a\nb\n\n* * *\n\nc");
  });
});

describe("poemLineIsEmpty", () => {
  it("is true for [] and all-blank spans", () => {
    expect(poemLineIsEmpty([])).toBe(true);
    expect(poemLineIsEmpty([{ text: "  ", marks: [] }])).toBe(true);
    expect(poemLineIsEmpty([{ text: "x", marks: [] }])).toBe(false);
  });
});
