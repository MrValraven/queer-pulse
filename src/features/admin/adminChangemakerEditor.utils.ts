import type {
  ChangemakerDTO,
  ChangemakerTint,
  CreateChangemakerBody,
} from "../community/api/changemakers.api";

/**
 * Form-friendly draft of a `ChangemakerDTO` — every array field is held as
 * plain text (comma-separated tags, one-per-line impact, blank-line-separated
 * body paragraphs) so it can bind directly to inputs/textareas. Converted
 * to/from `ChangemakerDTO`/`CreateChangemakerBody` at the editor boundary.
 */
export interface ChangemakerFormDraft {
  name: string;
  initials: string;
  cause: string;
  tint: ChangemakerTint;
  tagsText: string;
  summary: string;
  imageUrl: string;
  impactText: string;
  byline: string;
  heroNote: string;
  lead: string;
  bodyText: string;
  pullQuoteText: string;
  pullQuoteCite: string;
  isFeatured: boolean;
  sortOrder: number;
}

function tagsTextToArray(text: string): string[] {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function arrayToTagsText(tags: string[]): string {
  return tags.join(", ");
}

function linesTextToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLinesText(lines: string[]): string {
  return lines.join("\n");
}

function paragraphsTextToArray(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function arrayToParagraphsText(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

export function emptyDraft(): ChangemakerFormDraft {
  return {
    name: "",
    initials: "",
    cause: "",
    tint: "coral",
    tagsText: "",
    summary: "",
    imageUrl: "",
    impactText: "",
    byline: "",
    heroNote: "",
    lead: "",
    bodyText: "",
    pullQuoteText: "",
    pullQuoteCite: "",
    isFeatured: false,
    sortOrder: 0,
  };
}

export function draftFromProfile(
  profile: ChangemakerDTO,
): ChangemakerFormDraft {
  return {
    name: profile.name,
    initials: profile.initials,
    cause: profile.cause,
    tint: profile.tint,
    tagsText: arrayToTagsText(profile.tags),
    summary: profile.summary,
    imageUrl: profile.imageUrl ?? "",
    impactText: arrayToLinesText(profile.impact),
    byline: profile.byline,
    heroNote: profile.heroNote,
    lead: profile.lead,
    bodyText: arrayToParagraphsText(profile.body),
    pullQuoteText: profile.pullQuoteText,
    pullQuoteCite: profile.pullQuoteCite,
    isFeatured: profile.isFeatured,
    sortOrder: profile.sortOrder,
  };
}

export function draftToBody(
  draft: ChangemakerFormDraft,
): CreateChangemakerBody {
  return {
    name: draft.name.trim(),
    initials: draft.initials.trim(),
    cause: draft.cause.trim(),
    tint: draft.tint,
    tags: tagsTextToArray(draft.tagsText),
    summary: draft.summary.trim(),
    imageUrl: draft.imageUrl.trim() || undefined,
    impact: linesTextToArray(draft.impactText),
    byline: draft.byline.trim(),
    heroNote: draft.heroNote.trim(),
    lead: draft.lead.trim(),
    body: paragraphsTextToArray(draft.bodyText),
    pullQuoteText: draft.pullQuoteText.trim(),
    pullQuoteCite: draft.pullQuoteCite.trim(),
    isFeatured: draft.isFeatured,
    sortOrder: draft.sortOrder,
  };
}
