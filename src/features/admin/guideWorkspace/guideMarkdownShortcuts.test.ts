import { describe, expect, it } from "vitest";
import { matchMarkdownShortcut } from "./guideMarkdownShortcuts";

describe("matchMarkdownShortcut", () => {
  it("maps each prefix typed into an empty block", () => {
    expect(matchMarkdownShortcut("## ", "paragraph")).toBe("subheading");
    expect(matchMarkdownShortcut("- ", "paragraph")).toBe("listItem");
    expect(matchMarkdownShortcut("* ", "note")).toBe("listItem");
    expect(matchMarkdownShortcut("> ", "paragraph")).toBe("note");
  });

  it("accepts the non-breaking space a contentEditable types", () => {
    expect(matchMarkdownShortcut("-\u00a0", "paragraph")).toBe("listItem");
  });

  it("ignores a prefix followed by text, or the kind the block already has", () => {
    expect(matchMarkdownShortcut("- milk", "paragraph")).toBeNull();
    expect(matchMarkdownShortcut("- ", "listItem")).toBeNull();
  });
});
