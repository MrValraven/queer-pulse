import { describe, expect, it } from "vitest";
import { emptyGuideDraft, newDraftBlock, type GuideDraft } from "./guideDraft";
import { validateGuideDraft } from "./guideValidation";
import { guideBlockDomId, guideFieldId } from "./guideWorkspace.data";

function validDraft(): GuideDraft {
  return {
    ...emptyGuideDraft(),
    slug: "new-guide",
    title: "New guide",
    description: "About it.",
    category: "health",
  };
}

function codes(draft: GuideDraft, isNew = true, chip: string | null = null) {
  return validateGuideDraft(draft, { isNew, chip }).map((issue) => issue.code);
}

describe("validateGuideDraft", () => {
  it("accepts a complete draft", () => {
    expect(codes(validDraft())).toEqual([]);
  });

  it("requires title, description, category and a new guide's slug", () => {
    expect(codes(emptyGuideDraft())).toEqual([
      "titleRequired",
      "descriptionRequired",
      "categoryRequired",
      "slugRequired",
    ]);
  });

  it("checks the slug only on a new guide", () => {
    const draft = { ...validDraft(), slug: "Not A Slug" };
    expect(codes(draft, true)).toEqual(["slugInvalid"]);
    expect(codes(draft, false)).toEqual([]);
  });

  it("rejects a page path that does not start with a slash", () => {
    expect(codes({ ...validDraft(), routePath: "resources/x" })).toEqual([
      "routePathInvalid",
    ]);
  });

  it("flags invalid and duplicate anchors", () => {
    const draft = validDraft();
    const first = { ...draft.sections[0]!, key: "one", id: "routes" };
    const second = { ...draft.sections[0]!, key: "two", id: "routes" };
    const third = { ...draft.sections[0]!, key: "three", id: "Bad Anchor" };
    const issues = validateGuideDraft(
      { ...draft, sections: [first, second, third] },
      { isNew: true, chip: null },
    );
    expect(issues.map((issue) => [issue.code, issue.sectionKey])).toEqual([
      ["anchorDuplicate", "two"],
      ["anchorInvalid", "three"],
    ]);
  });

  it("points a too-long block at the block", () => {
    const draft = validDraft();
    const block = newDraftBlock("paragraph", "x", "x".repeat(4001));
    const section = { ...draft.sections[0]!, blocks: [block] };
    const issues = validateGuideDraft(
      { ...draft, sections: [section] },
      { isNew: true, chip: null },
    );
    expect(issues).toEqual([
      {
        code: "blockTooLong",
        targetId: guideBlockDomId(block.key),
        language: "en",
        sectionKey: section.key,
        blockKey: block.key,
      },
    ]);
  });

  it("flags a chip over 120 characters", () => {
    const issues = validateGuideDraft(validDraft(), {
      isNew: true,
      chip: "x".repeat(121),
    });
    expect(issues).toEqual([
      { code: "chipTooLong", targetId: guideFieldId("chip") },
    ]);
  });
});
