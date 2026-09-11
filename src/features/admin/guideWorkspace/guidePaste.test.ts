import { describe, expect, it } from "vitest";
import { splitPastedText } from "./guidePaste";

describe("splitPastedText", () => {
  it("returns null for a single line", () => {
    expect(splitPastedText("just one line")).toBeNull();
    expect(splitPastedText("  one line\n")).toBeNull();
  });

  it("splits paragraphs on blank lines and joins wrapped lines", () => {
    expect(splitPastedText("First line\nstill first\n\nSecond")).toEqual([
      { kind: "paragraph", text: "First line still first" },
      { kind: "paragraph", text: "Second" },
    ]);
  });

  it("turns - and * lines into list items", () => {
    expect(splitPastedText("Bring:\n- ID\n* Health card")).toEqual([
      { kind: "paragraph", text: "Bring:" },
      { kind: "listItem", text: "ID" },
      { kind: "listItem", text: "Health card" },
    ]);
  });

  it("handles Windows line endings", () => {
    expect(splitPastedText("One\r\n\r\nTwo")).toEqual([
      { kind: "paragraph", text: "One" },
      { kind: "paragraph", text: "Two" },
    ]);
  });
});
