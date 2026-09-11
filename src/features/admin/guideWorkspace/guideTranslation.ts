import type { GuideSection } from "../api/adminResourceGuides.api";
import {
  createDraftKey,
  newDraftBlock,
  sectionsToWire,
  type DraftSection,
  type GuideDraft,
} from "./guideDraft";
import type { GuideLanguage } from "./guideWorkspace.data";

export type TranslationFlag = "empty" | "noEnglishMatch";

export function sectionHasProse(section: DraftSection): boolean {
  return section.blocks.some((block) => block.text.trim() !== "");
}

export function findSectionById(
  sections: readonly DraftSection[],
  id: string,
): DraftSection | undefined {
  return sections.find((section) => section.id === id);
}

/** PT outline flags by PT section key, plus the EN sections with no PT
 *  section sharing their anchor. */
export function translationFlags(
  sections: readonly DraftSection[],
  sectionsPt: readonly DraftSection[],
): {
  flagsByPtKey: Record<string, TranslationFlag>;
  missingEnglishSections: DraftSection[];
} {
  const flagsByPtKey: Record<string, TranslationFlag> = {};
  for (const ptSection of sectionsPt) {
    const englishSection = findSectionById(sections, ptSection.id);
    if (!englishSection) flagsByPtKey[ptSection.key] = "noEnglishMatch";
    else if (sectionHasProse(englishSection) && !sectionHasProse(ptSection)) {
      flagsByPtKey[ptSection.key] = "empty";
    }
  }
  const missingEnglishSections = sections.filter(
    (section) => !findSectionById(sectionsPt, section.id),
  );
  return { flagsByPtKey, missingEnglishSections };
}

/**
 * PT sections in English order: each EN section's PT counterpart, or a new
 * empty one (same anchor, empty heading, one empty paragraph) when it has
 * none. PT sections with no English match stay, at the end. Nothing is
 * overwritten or removed.
 */
export function copyEnglishStructure(
  sections: readonly DraftSection[],
  sectionsPt: readonly DraftSection[],
): DraftSection[] {
  const usedKeys = new Set<string>();
  const ordered = sections.map((englishSection) => {
    const match = sectionsPt.find(
      (ptSection) =>
        ptSection.id === englishSection.id && !usedKeys.has(ptSection.key),
    );
    if (match) {
      usedKeys.add(match.key);
      return match;
    }
    return {
      key: createDraftKey(),
      id: englishSection.id,
      heading: "",
      isAnchorLocked: true,
      blocks: [newDraftBlock("paragraph")],
    };
  });
  const unmatched = sectionsPt.filter(
    (ptSection) => !usedKeys.has(ptSection.key),
  );
  return [...ordered, ...unmatched];
}

/** What `parseGuideSections` would serve: sections with a heading or at
 *  least one non-empty block. */
function servedSections(sections: readonly DraftSection[]): GuideSection[] {
  return sectionsToWire(sections).filter(
    (section) => section.heading !== "" || section.blocks.length > 0,
  );
}

/**
 * The sections a reader in `language` would get, matching `ManagedGuideBody`:
 * PT readers get the PT sections once at least one would be served, and the
 * whole English body until then.
 */
export function previewSections(
  draft: GuideDraft,
  language: GuideLanguage,
): { sections: GuideSection[]; isEnglishFallback: boolean } {
  const english = servedSections(draft.sections);
  if (language === "en") return { sections: english, isEnglishFallback: false };
  const portuguese = servedSections(draft.sectionsPt);
  return portuguese.length > 0
    ? { sections: portuguese, isEnglishFallback: false }
    : { sections: english, isEnglishFallback: true };
}
