import { describe, expect, it } from "vitest";
import { serializePoemLines } from "./serializePoemLines";
import { parsePoemHtml } from "./parsePoemHtml";

describe("serializePoemLines", () => {
  it("joins lines with <br> and wraps marks", () => {
    expect(serializePoemLines([
      [{ text: "a", marks: [] }],
      [{ text: "b", marks: ["em"] }, { text: "c", marks: ["strong"] }],
    ])).toBe("a<br><em>b</em><strong>c</strong>");
  });
  it("escapes html", () => {
    expect(serializePoemLines([[{ text: "a<b>&", marks: [] }]])).toBe("a&lt;b&gt;&amp;");
  });
  it("round-trips through parsePoemHtml", () => {
    const lines = [[{ text: "x", marks: ["em"] as ("em" | "strong")[] }], [{ text: "y", marks: [] }]];
    expect(parsePoemHtml(serializePoemLines(lines))).toEqual(lines);
  });
});
