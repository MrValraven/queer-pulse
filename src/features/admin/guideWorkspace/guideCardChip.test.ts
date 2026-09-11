import { describe, expect, it } from "vitest";
import {
  chipForDraft,
  composeChip,
  parseChipFormat,
  readMinutes,
} from "./guideCardChip";
import type { DraftSection } from "./guideDraft";

function makeSection(text: string, heading = ""): DraftSection {
  return {
    key: `section-${text.length}`,
    id: "a",
    heading,
    isAnchorLocked: true,
    blocks: [{ key: "block-1", kind: "paragraph", html: "", text }],
  };
}

const LONG_TEXT = Array.from({ length: 450 }, () => "word").join(" ");

describe("guideCardChip", () => {
  it("composes format, read time and languages", () => {
    expect(composeChip("checklist", [makeSection(LONG_TEXT)], [])).toBe(
      "Checklist · 3 min",
    );
    expect(
      composeChip("checklist", [makeSection(LONG_TEXT)], [makeSection("Olá")]),
    ).toBe("Checklist · 3 min · PT / EN");
  });

  it("never reads less than one minute", () => {
    expect(readMinutes([])).toBe(1);
  });

  it("ignores a PT section with no prose", () => {
    expect(composeChip("guide", [makeSection("Hi")], [makeSection("  ")])).toBe(
      "Guide · 1 min",
    );
  });

  it("parses the format from a stored chip", () => {
    expect(parseChipFormat("Guide · 12 min · PT / EN")).toBe("guide");
    expect(parseChipFormat("template · 6 min")).toBe("template");
    expect(parseChipFormat("Handbook")).toBe("keep");
    expect(parseChipFormat(null)).toBe("keep");
  });

  it("keeps the stored chip while the format is keep", () => {
    const draft = { chipFormat: "keep" as const, sections: [], sectionsPt: [] };
    expect(chipForDraft(draft, "Handbook")).toBe("Handbook");
    expect(chipForDraft(draft, null)).toBeNull();
  });
});
