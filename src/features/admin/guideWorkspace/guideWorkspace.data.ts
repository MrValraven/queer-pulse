import type { GuideBlockKind } from "../api/adminResourceGuides.api";

export type GuideLanguage = "en" | "pt";
export const GUIDE_LANGUAGES: readonly GuideLanguage[] = ["en", "pt"];

export type GuideViewMode = "edit" | "split" | "preview";
export const GUIDE_VIEW_MODES: readonly GuideViewMode[] = [
  "edit",
  "split",
  "preview",
];

export function isGuideViewMode(value: unknown): value is GuideViewMode {
  return (
    typeof value === "string" &&
    (GUIDE_VIEW_MODES as readonly string[]).includes(value)
  );
}

export const GUIDE_VIEW_MODE_STORAGE_KEY = "qp:guide-workspace:view-mode";
export const GUIDE_DRAFT_STORAGE_PREFIX = "qp:guide-draft:";
export const GUIDE_DRAFT_WRITE_DELAY_MS = 800;
/** Below this viewport width Split is unavailable. */
export const GUIDE_SPLIT_MIN_WIDTH = 1100;
export const WORDS_PER_MINUTE = 200;

/** Add bar and "/" menu order. */
export const GUIDE_BLOCK_KIND_ORDER: readonly GuideBlockKind[] = [
  "paragraph",
  "subheading",
  "listItem",
  "note",
];

/** The "/" menu's extra row next to the block kinds. */
export const NEW_SECTION_OPTION_ID = "section";

/** Markdown prefix shown as each "/" menu row's hint. Not translated: it is
 *  what the editor types. */
export const GUIDE_BLOCK_KIND_HINTS: Record<GuideBlockKind, string> = {
  paragraph: "",
  subheading: "##",
  listItem: "-",
  note: ">",
};

/** Mirrors `queerpulse-backend/src/resources/guide-section.ts` and the
 *  resource DTOs, so a save the backend would refuse is caught first. */
export const GUIDE_LIMITS = {
  sections: 40,
  blocksPerSection: 60,
  blockText: 4000,
  blockHtml: 8000,
  heading: 300,
  anchor: 80,
  title: 300,
  description: 2000,
  chip: 120,
  slug: 120,
  routePath: 200,
} as const;

export const GUIDE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const GUIDE_ANCHOR_PATTERN = GUIDE_SLUG_PATTERN;
export const GUIDE_ROUTE_PATH_PATTERN = /^\/[A-Za-z0-9\-/]*$/;

export type GuideField =
  "title" | "description" | "category" | "chip" | "routePath" | "slug";

/** DOM ids shared by the controls, validation and focus handling. */
export function guideFieldId(
  field: GuideField,
  language?: GuideLanguage,
): string {
  return language ? `guide-field-${field}-${language}` : `guide-field-${field}`;
}

export function guideSectionDomId(sectionKey: string): string {
  return `guide-section-${sectionKey}`;
}

export function guideSectionHeadingId(sectionKey: string): string {
  return `guide-section-heading-${sectionKey}`;
}

export function guideSectionAnchorId(sectionKey: string): string {
  return `guide-section-anchor-${sectionKey}`;
}

export function guideBlockDomId(blockKey: string): string {
  return `guide-block-${blockKey}`;
}
