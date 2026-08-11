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
    expect(poemHasContent([newStanza("   ")])).toBe(false);
    expect(poemHasContent([newStanza("a line")])).toBe(true);
  });

  it("poemFromDescription seeds one stanza with <br> line joins", () => {
    const blocks = poemFromDescription("one\ntwo\n\n");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ kind: "stanza", html: "one<br>two" });
  });

  it("poemPlainFirstLine returns the first non-empty verse line as text", () => {
    expect(
      poemPlainFirstLine([newStanza("<em>hi</em><br>there")]),
    ).toBe("hi");
  });
});
