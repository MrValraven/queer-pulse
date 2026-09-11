import type {
  AdminResourceGuideDTO,
  GuideBlock,
  GuideBlockKind,
  GuideSection,
  ResourceGuideWriteBody,
} from "../api/adminResourceGuides.api";
import {
  chipForDraft,
  parseChipFormat,
  type ChipChoice,
} from "./guideCardChip";

export interface DraftBlock {
  /** Client-only React key. Stripped before sending. */
  key: string;
  kind: GuideBlockKind;
  /** Inline HTML for formatted kinds; always "" for a subheading. */
  html: string;
  /** Plain text: what counts words, validates length and is sent as `text`. */
  text: string;
}

export interface DraftSection {
  key: string;
  /** The anchor. Editable, so it cannot double as the React key. */
  id: string;
  heading: string;
  /** False while a new section's anchor still follows its heading. */
  isAnchorLocked: boolean;
  blocks: DraftBlock[];
}

export interface GuideDraft {
  slug: string;
  /** False while a new guide's slug still follows its title. */
  isSlugLocked: boolean;
  title: string;
  titlePt: string;
  description: string;
  descriptionPt: string;
  category: string;
  chipFormat: ChipChoice;
  routePath: string;
  sections: DraftSection[];
  sectionsPt: DraftSection[];
}

export type GuideDraftField =
  | "slug"
  | "title"
  | "titlePt"
  | "description"
  | "descriptionPt"
  | "category"
  | "chipFormat"
  | "routePath"
  | "sections"
  | "sectionsPt";

const FORMATTED_KINDS: readonly GuideBlockKind[] = [
  "paragraph",
  "listItem",
  "note",
];

export function isFormattedKind(kind: GuideBlockKind): boolean {
  return FORMATTED_KINDS.includes(kind);
}

let draftKeyCounter = 0;

export function createDraftKey(): string {
  draftKeyCounter += 1;
  return `draft-${draftKeyCounter}`;
}

/** Plain text as the inline HTML a contentEditable would hold for it. */
export function textToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br>");
}

export function newDraftBlock(
  kind: GuideBlockKind,
  html = "",
  text = "",
): DraftBlock {
  return {
    key: createDraftKey(),
    kind,
    html: isFormattedKind(kind) ? html : "",
    text,
  };
}

/** A section with one empty paragraph, ready to type into. */
export function newDraftSection(id: string, heading = ""): DraftSection {
  return {
    key: createDraftKey(),
    id,
    heading,
    isAnchorLocked: false,
    blocks: [newDraftBlock("paragraph")],
  };
}

function blockToDraft(block: GuideBlock): DraftBlock {
  return {
    key: createDraftKey(),
    kind: block.kind,
    html: isFormattedKind(block.kind)
      ? (block.html ?? textToHtml(block.text))
      : "",
    text: block.text,
  };
}

export function sectionsToDraft(
  sections: readonly GuideSection[],
): DraftSection[] {
  return sections.map((section) => ({
    key: createDraftKey(),
    id: section.id,
    heading: section.heading,
    isAnchorLocked: true,
    blocks: section.blocks.map(blockToDraft),
  }));
}

export function emptyGuideDraft(): GuideDraft {
  return {
    slug: "",
    isSlugLocked: false,
    title: "",
    titlePt: "",
    description: "",
    descriptionPt: "",
    category: "",
    chipFormat: "guide",
    routePath: "",
    sections: [newDraftSection("section")],
    sectionsPt: [],
  };
}

export function draftFromGuide(guide: AdminResourceGuideDTO): GuideDraft {
  return {
    slug: guide.slug,
    isSlugLocked: true,
    title: guide.title,
    titlePt: guide.titlePt ?? "",
    description: guide.description,
    descriptionPt: guide.descriptionPt ?? "",
    category: guide.category,
    chipFormat: parseChipFormat(guide.meta),
    routePath: guide.routePath ?? "",
    sections: sectionsToDraft(guide.sections),
    sectionsPt: sectionsToDraft(guide.sectionsPt ?? []),
  };
}

/** Fresh keys throughout, for a draft restored from storage whose keys could
 *  collide with ones this session already handed out. */
export function rekeyDraft(draft: GuideDraft): GuideDraft {
  const rekeySections = (sections: DraftSection[]) =>
    sections.map((section) => ({
      ...section,
      key: createDraftKey(),
      blocks: section.blocks.map((block) => ({
        ...block,
        key: createDraftKey(),
      })),
    }));
  return {
    ...draft,
    sections: rekeySections(draft.sections),
    sectionsPt: rekeySections(draft.sectionsPt),
  };
}

/**
 * Collapses the serialization differences between a browser's `innerHTML`
 * and the sanitizers, so a draft that only went through a save round trip
 * never reads as changed: `<br />` against `<br>`, `&nbsp;` against a space,
 * `&quot;`/`&#39;` against literal quotes (decoding them keeps the comparison
 * stable whichever side carries an entity-encoded quote), and the
 * `rel`/`target` pair the sanitizers add to every link.
 */
export function normalizeHtmlForCompare(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s(?:rel|target)="[^"]*"/g, "")
    .trim();
}

function blockToWire(block: DraftBlock): GuideBlock | null {
  if (block.text.trim() === "") return null;
  if (!isFormattedKind(block.kind))
    return { kind: block.kind, text: block.text };
  return { kind: block.kind, text: block.text, html: block.html };
}

/** Draft sections as the API takes them: keys stripped, empty blocks dropped. */
export function sectionsToWire(
  sections: readonly DraftSection[],
): GuideSection[] {
  return sections.map((section) => ({
    id: section.id,
    heading: section.heading,
    blocks: section.blocks
      .map(blockToWire)
      .filter((block): block is GuideBlock => block !== null),
  }));
}

/** Formatted blocks compare by normalized html, subheadings by text. */
function sectionsSignature(sections: readonly DraftSection[]): string {
  return JSON.stringify(
    sectionsToWire(sections).map((section) => ({
      id: section.id,
      heading: section.heading,
      blocks: section.blocks.map((block) =>
        block.html === undefined
          ? { kind: block.kind, text: block.text }
          : { kind: block.kind, html: normalizeHtmlForCompare(block.html) },
      ),
    })),
  );
}

const SCALAR_FIELDS = [
  "slug",
  "title",
  "titlePt",
  "description",
  "descriptionPt",
  "category",
  "chipFormat",
  "routePath",
] as const;

export function changedDraftFields(
  draft: GuideDraft,
  clean: GuideDraft,
): GuideDraftField[] {
  const changed: GuideDraftField[] = SCALAR_FIELDS.filter(
    (field) => draft[field] !== clean[field],
  );
  if (sectionsSignature(draft.sections) !== sectionsSignature(clean.sections)) {
    changed.push("sections");
  }
  if (
    sectionsSignature(draft.sectionsPt) !== sectionsSignature(clean.sectionsPt)
  ) {
    changed.push("sectionsPt");
  }
  return changed;
}

export function isDraftDirty(draft: GuideDraft, clean: GuideDraft): boolean {
  return changedDraftFields(draft, clean).length > 0;
}

/**
 * Only what changed since `clean`, the draft as last loaded or saved. A PATCH
 * that resent every field would let two editors silently overwrite each
 * other's untouched fields. The chip is recomputed alongside any other change,
 * so its read time follows the prose; an untouched guide still sends nothing.
 */
export function draftToWriteBody(
  draft: GuideDraft,
  clean: GuideDraft,
  storedMeta: string | null,
): ResourceGuideWriteBody {
  const changed = changedDraftFields(draft, clean);
  const body: ResourceGuideWriteBody = {};
  for (const field of changed) {
    if (field === "sections") body.sections = sectionsToWire(draft.sections);
    else if (field === "sectionsPt") {
      body.sectionsPt = sectionsToWire(draft.sectionsPt);
    } else if (field !== "chipFormat") body[field] = draft[field];
  }
  const chip = chipForDraft(draft, storedMeta);
  if (changed.length > 0 && chip !== null && chip !== storedMeta) {
    body.meta = chip;
  }
  return body;
}

export function draftToCreateBody(
  draft: GuideDraft,
): ResourceGuideWriteBody & { slug: string } {
  const body: ResourceGuideWriteBody & { slug: string } = {
    slug: draft.slug,
    title: draft.title,
    description: draft.description,
    category: draft.category,
  };
  if (draft.titlePt.trim()) body.titlePt = draft.titlePt;
  if (draft.descriptionPt.trim()) body.descriptionPt = draft.descriptionPt;
  if (draft.routePath.trim()) body.routePath = draft.routePath;
  const chip = chipForDraft(draft, null);
  if (chip) body.meta = chip;
  const sections = sectionsToWire(draft.sections);
  if (sections.length > 0) body.sections = sections;
  const sectionsPt = sectionsToWire(draft.sectionsPt);
  if (sectionsPt.length > 0) body.sectionsPt = sectionsPt;
  return body;
}
