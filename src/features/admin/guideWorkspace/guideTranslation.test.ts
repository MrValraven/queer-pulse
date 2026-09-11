import { describe, expect, it } from "vitest";
import { emptyGuideDraft, type DraftSection } from "./guideDraft";
import {
  copyEnglishStructure,
  previewSections,
  translationFlags,
} from "./guideTranslation";

function makeSection(key: string, id: string, text = "Text"): DraftSection {
  return {
    key,
    id,
    heading: id,
    isAnchorLocked: true,
    blocks: text
      ? [{ key: `${key}-block`, kind: "paragraph", html: text, text }]
      : [],
  };
}

describe("translationFlags", () => {
  it("flags empty and unmatched PT sections and lists untranslated EN ones", () => {
    const english = [makeSection("en-a", "a"), makeSection("en-b", "b")];
    const portuguese = [makeSection("pt-a", "a", ""), makeSection("pt-z", "z")];
    const result = translationFlags(english, portuguese);
    expect(result.flagsByPtKey).toEqual({
      "pt-a": "empty",
      "pt-z": "noEnglishMatch",
    });
    expect(result.missingEnglishSections.map((section) => section.id)).toEqual([
      "b",
    ]);
  });
});

describe("copyEnglishStructure", () => {
  it("adds missing sections in English order and keeps every PT section", () => {
    const english = [makeSection("en-a", "a"), makeSection("en-b", "b")];
    const portuguese = [makeSection("pt-b", "b"), makeSection("pt-z", "z")];
    const result = copyEnglishStructure(english, portuguese);
    expect(result.map((section) => section.id)).toEqual(["a", "b", "z"]);
    expect(result[1]?.key).toBe("pt-b");
    expect(result[0]?.heading).toBe("");
    expect(result[0]?.blocks).toHaveLength(1);
  });
});

describe("previewSections", () => {
  it("shows English to Portuguese readers until a PT section would be served", () => {
    const draft = {
      ...emptyGuideDraft(),
      sections: [makeSection("en-a", "a")],
      sectionsPt: [{ ...makeSection("pt-a", "a", ""), heading: "" }],
    };
    expect(previewSections(draft, "pt")).toEqual({
      sections: [
        {
          id: "a",
          heading: "a",
          blocks: [{ kind: "paragraph", text: "Text", html: "Text" }],
        },
      ],
      isEnglishFallback: true,
    });
  });

  it("shows PT sections once one would be served", () => {
    const draft = {
      ...emptyGuideDraft(),
      sections: [makeSection("en-a", "a")],
      sectionsPt: [makeSection("pt-a", "a", "Texto")],
    };
    expect(previewSections(draft, "pt").isEnglishFallback).toBe(false);
    expect(previewSections(draft, "pt").sections[0]?.blocks[0]?.text).toBe(
      "Texto",
    );
  });
});
