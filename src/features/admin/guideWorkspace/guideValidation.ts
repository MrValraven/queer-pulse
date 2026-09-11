import type { DraftSection, GuideDraft } from "./guideDraft";
import {
  GUIDE_ANCHOR_PATTERN,
  GUIDE_LIMITS,
  GUIDE_ROUTE_PATH_PATTERN,
  GUIDE_SLUG_PATTERN,
  guideBlockDomId,
  guideFieldId,
  guideSectionHeadingId,
  type GuideLanguage,
} from "./guideWorkspace.data";

export type GuideIssueCode =
  | "titleRequired"
  | "titleTooLong"
  | "descriptionRequired"
  | "descriptionTooLong"
  | "categoryRequired"
  | "slugRequired"
  | "slugInvalid"
  | "slugTaken"
  | "routePathInvalid"
  | "chipTooLong"
  | "tooManySections"
  | "headingTooLong"
  | "anchorInvalid"
  | "anchorDuplicate"
  | "tooManyBlocks"
  | "blockTooLong";

export interface GuideValidationIssue {
  code: GuideIssueCode;
  /** DOM id of the control to focus (see `guideWorkspace.data.ts`). */
  targetId: string;
  /** Set when the issue belongs to one language's fields or prose. */
  language?: GuideLanguage;
  sectionKey?: string;
  blockKey?: string;
}

/** Every problem the backend would refuse, in reading order. */
export function validateGuideDraft(
  draft: GuideDraft,
  options: { isNew: boolean; chip: string | null },
): GuideValidationIssue[] {
  const issues: GuideValidationIssue[] = [];
  const titleId = guideFieldId("title", "en");
  if (!draft.title.trim()) {
    issues.push({ code: "titleRequired", targetId: titleId, language: "en" });
  } else if (draft.title.length > GUIDE_LIMITS.title) {
    issues.push({ code: "titleTooLong", targetId: titleId, language: "en" });
  }
  if (draft.titlePt.length > GUIDE_LIMITS.title) {
    issues.push({
      code: "titleTooLong",
      targetId: guideFieldId("title", "pt"),
      language: "pt",
    });
  }
  const descriptionId = guideFieldId("description", "en");
  if (!draft.description.trim()) {
    issues.push({
      code: "descriptionRequired",
      targetId: descriptionId,
      language: "en",
    });
  } else if (draft.description.length > GUIDE_LIMITS.description) {
    issues.push({
      code: "descriptionTooLong",
      targetId: descriptionId,
      language: "en",
    });
  }
  if (draft.descriptionPt.length > GUIDE_LIMITS.description) {
    issues.push({
      code: "descriptionTooLong",
      targetId: guideFieldId("description", "pt"),
      language: "pt",
    });
  }
  if (!draft.category.trim()) {
    issues.push({
      code: "categoryRequired",
      targetId: guideFieldId("category"),
    });
  }
  if (options.isNew) {
    const slugId = guideFieldId("slug");
    if (!draft.slug) {
      issues.push({ code: "slugRequired", targetId: slugId });
    } else if (
      !GUIDE_SLUG_PATTERN.test(draft.slug) ||
      draft.slug.length > GUIDE_LIMITS.slug
    ) {
      issues.push({ code: "slugInvalid", targetId: slugId });
    }
  }
  if (
    draft.routePath &&
    (!GUIDE_ROUTE_PATH_PATTERN.test(draft.routePath) ||
      draft.routePath.length > GUIDE_LIMITS.routePath)
  ) {
    issues.push({
      code: "routePathInvalid",
      targetId: guideFieldId("routePath"),
    });
  }
  if (options.chip !== null && options.chip.length > GUIDE_LIMITS.chip) {
    issues.push({ code: "chipTooLong", targetId: guideFieldId("chip") });
  }
  validateSections(draft.sections, "en", issues);
  validateSections(draft.sectionsPt, "pt", issues);
  return issues;
}

function validateSections(
  sections: readonly DraftSection[],
  language: GuideLanguage,
  issues: GuideValidationIssue[],
): void {
  const overflowSection = sections[GUIDE_LIMITS.sections];
  if (overflowSection) {
    issues.push({
      code: "tooManySections",
      targetId: guideSectionHeadingId(overflowSection.key),
      language,
      sectionKey: overflowSection.key,
    });
  }
  const seenAnchors = new Set<string>();
  for (const section of sections) {
    const headingId = guideSectionHeadingId(section.key);
    const sectionIssue = {
      targetId: headingId,
      language,
      sectionKey: section.key,
    };
    if (section.heading.length > GUIDE_LIMITS.heading) {
      issues.push({ code: "headingTooLong", ...sectionIssue });
    }
    if (
      !GUIDE_ANCHOR_PATTERN.test(section.id) ||
      section.id.length > GUIDE_LIMITS.anchor
    ) {
      issues.push({ code: "anchorInvalid", ...sectionIssue });
    } else if (seenAnchors.has(section.id)) {
      issues.push({ code: "anchorDuplicate", ...sectionIssue });
    }
    seenAnchors.add(section.id);
    if (section.blocks.length > GUIDE_LIMITS.blocksPerSection) {
      issues.push({ code: "tooManyBlocks", ...sectionIssue });
    }
    for (const block of section.blocks) {
      if (
        block.text.length > GUIDE_LIMITS.blockText ||
        block.html.length > GUIDE_LIMITS.blockHtml
      ) {
        issues.push({
          code: "blockTooLong",
          targetId: guideBlockDomId(block.key),
          language,
          sectionKey: section.key,
          blockKey: block.key,
        });
      }
    }
  }
}
