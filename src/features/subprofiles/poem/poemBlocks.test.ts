import { describe, expect, it } from "vitest";
import {
  newBreak,
  newStanza,
  poemFromDescription,
  poemHasContent,
  poemPlainFirstLine,
} from "./poemBlocks";

describe("poemBlocks", () => {
  it("poemHasContent ignores empty blocks and lone breaks", () => {
    expect(poemHasContent(null)).toBe(false);
    expect(poemHasContent([newBreak()])).toBe(false);
    expect(poemHasContent([newStanza()])).toBe(false);
    expect(poemHasContent([newStanza([[{ text: "a", marks: [] }]])])).toBe(
      true,
    );
  });

  it("poemHasContent normalizes raw/malformed jsonb without throwing", () => {
    expect(poemHasContent([null])).toBe(false);
    expect(poemHasContent([{ kind: "stanza" }])).toBe(false);
    expect(poemHasContent("nope")).toBe(false);
    expect(poemHasContent([{ kind: "stanza", id: "x", html: "a<br>b" }])).toBe(
      true,
    );
  });

  it("poemFromDescription seeds one stanza with split lines", () => {
    const blocks = poemFromDescription("one\ntwo\n\n");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      kind: "stanza",
      lines: [[{ text: "one", marks: [] }], [{ text: "two", marks: [] }]],
    });
  });

  it("poemPlainFirstLine returns first non-empty line text", () => {
    expect(
      poemPlainFirstLine([newStanza([[], [{ text: "hi", marks: [] }]])]),
    ).toBe("hi");
  });

  it("poemPlainFirstLine normalizes a legacy {html} block without throwing", () => {
    expect(
      poemPlainFirstLine([{ kind: "stanza", id: "x", html: "a<br>b" }]),
    ).toBe("a");
  });

  it("poemPlainFirstLine tolerates malformed jsonb (no crash)", () => {
    expect(poemPlainFirstLine([null])).toBe("");
    expect(poemPlainFirstLine([{ kind: "stanza" }])).toBe("");
    expect(poemPlainFirstLine("nope")).toBe("");
  });
});
