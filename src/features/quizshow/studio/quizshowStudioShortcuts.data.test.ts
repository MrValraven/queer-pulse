import { describe, expect, it } from "vitest";
import { STUDIO_SHORTCUTS } from "./quizshowStudioShortcuts.data";

describe("STUDIO_SHORTCUTS", () => {
  it("lists each action once, so no label repeats in the sheet", () => {
    const labelKeys = STUDIO_SHORTCUTS.map((shortcut) => shortcut.labelKey);
    expect(new Set(labelKeys).size).toBe(labelKeys.length);
  });

  it("gives redo both of its combinations in one row", () => {
    const redoRows = STUDIO_SHORTCUTS.filter(
      (shortcut) => shortcut.labelKey === "quizshow:studio.shortcuts.redo",
    );
    expect(redoRows).toHaveLength(1);
    expect(redoRows[0]?.keys.map((key) => key.kind)).toEqual([
      "text",
      "command",
      "text",
    ]);
    expect(redoRows[0]?.alternativeKeys).toEqual([
      { kind: "text", text: "Ctrl" },
      { kind: "text", text: "Y" },
    ]);
  });
});
