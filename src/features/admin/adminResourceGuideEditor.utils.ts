import type {
  AdminResourceGuideDTO,
  GuideBlockKind,
  GuideSection,
  ResourceGuideWriteBody,
} from "./api/adminResourceGuides.api";

export const GUIDE_BLOCK_KINDS: GuideBlockKind[] = [
  "paragraph",
  "subheading",
  "listItem",
  "note",
];

export interface GuideFormDraft {
  title: string;
  titlePt: string;
  description: string;
  descriptionPt: string;
  category: string;
  routePath: string;
  meta: string;
  sections: GuideSection[];
  sectionsPt: GuideSection[];
}

export function draftFromGuide(guide: AdminResourceGuideDTO): GuideFormDraft {
  return {
    title: guide.title,
    titlePt: guide.titlePt ?? "",
    description: guide.description,
    descriptionPt: guide.descriptionPt ?? "",
    category: guide.category,
    routePath: guide.routePath ?? "",
    meta: guide.meta ?? "",
    // Deep-copied so editing a draft never mutates the cached query data
    // under react-query, which would make a cancelled edit stick.
    sections: cloneSections(guide.sections),
    sectionsPt: cloneSections(guide.sectionsPt ?? []),
  };
}

export function cloneSections(sections: GuideSection[]): GuideSection[] {
  return sections.map((section) => ({
    id: section.id,
    heading: section.heading,
    blocks: section.blocks.map((block) => ({ ...block })),
  }));
}

/**
 * Only what changed. A PATCH that resent every field would let two editors
 * working at once silently overwrite each other's untouched fields, and on a
 * crisis guide that is exactly the failure worth avoiding.
 */
export function draftToWriteBody(
  draft: GuideFormDraft,
  original: AdminResourceGuideDTO,
): ResourceGuideWriteBody {
  const body: ResourceGuideWriteBody = {};
  if (draft.title !== original.title) body.title = draft.title;
  if (draft.titlePt !== (original.titlePt ?? "")) body.titlePt = draft.titlePt;
  if (draft.description !== original.description) {
    body.description = draft.description;
  }
  if (draft.descriptionPt !== (original.descriptionPt ?? "")) {
    body.descriptionPt = draft.descriptionPt;
  }
  if (draft.category !== original.category) body.category = draft.category;
  if (draft.routePath !== (original.routePath ?? "")) {
    body.routePath = draft.routePath;
  }
  if (draft.meta !== (original.meta ?? "")) body.meta = draft.meta;
  if (!sectionsEqual(draft.sections, original.sections)) {
    body.sections = draft.sections;
  }
  if (!sectionsEqual(draft.sectionsPt, original.sectionsPt ?? [])) {
    body.sectionsPt = draft.sectionsPt;
  }
  return body;
}

function sectionsEqual(left: GuideSection[], right: GuideSection[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/** A blank section, ready for an editor to name. `id` doubles as the
 *  section's anchor, so it stays kebab-case and unique within the guide. */
export function newSection(existing: GuideSection[]): GuideSection {
  let index = existing.length + 1;
  const taken = new Set(existing.map((section) => section.id));
  while (taken.has(`section-${index}`)) index += 1;
  return { id: `section-${index}`, heading: "", blocks: [] };
}
