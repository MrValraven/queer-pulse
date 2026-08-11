import type { SubprofileKind } from "./api/subprofiles.api";
import { skinFor, type SkinFamily } from "./subprofile-skins";

/**
 * Descriptor tables for the per-skin "Page blocks" editor pane
 * (`SubprofileSkinBlocksEditor`), mirroring `richFields.data.ts`'s descriptor
 * style. Each `SkinFamily` maps to the persona-level `SkinData` blocks its skin
 * renders, and each block to the labelled controls the owner fills in. The pane
 * reads/writes these through `useSubprofileSkinBlocksEditor`, and they save via
 * the single meta PATCH (folded into `skinData` in `useEditorSaveGraph`).
 *
 * A control's `path` is a dot-path into `SkinData` — either a whole top-level
 * block (`"beforeYouSit"`, `"colophon"`) or a sub-field of one (`"chair.rate"`,
 * `"excerpt.lines"`). The block's `blockKey` (the first path segment) is the
 * diff/dirty granularity used by the pending-changes list.
 *
 * Control kinds:
 *  - `text`      — single-line `<input>` (sub-field of an object block).
 *  - `textarea`  — multi-line `<textarea>` (e.g. `colophon`, a gaps note).
 *  - `stringList`— an ordered `string[]` list editor (add/remove/reorder lines).
 *  - `objectList`— an ordered array of small objects, each with `itemFields`.
 *
 * All copy is i18n KEYS resolved by the pane via `t(...)`; the intended EN
 * strings live in the build's `b2-i18n-keys.json` (catalogs updated separately).
 */

export type SkinControlKind = "text" | "textarea" | "stringList" | "objectList";

/** One field within an `objectList` entry (e.g. a first-session step's
 *  title/body, a referral's name/note). */
export interface SkinItemFieldDescriptor {
  key: string;
  labelKey: string;
  placeholderKey?: string;
  multiline?: boolean;
}

export interface SkinBlockControl {
  /** Dot-path into `SkinData`: `"chair.rate"`, `"excerpt.lines"`, `"colophon"`. */
  path: string;
  kind: SkinControlKind;
  /** Visible label for this control (FormField label, or the list heading). */
  labelKey: string;
  placeholderKey?: string;
  /** `objectList` only — the fields rendered for each entry. */
  itemFields?: SkinItemFieldDescriptor[];
}

export interface SkinBlockDescriptor {
  /** Top-level `SkinData` key this block writes to (diff/pending granularity). */
  blockKey: string;
  /** Block heading, also the label shown in the pending-changes list. */
  titleKey: string;
  /** Optional helper line under the heading. */
  helperKey?: string;
  controls: SkinBlockControl[];
}

// ── Block builders ──────────────────────────────────────────────────────────

/** A flat object block: each sub-field is a single-line text input. */
function objectBlock(
  blockKey: string,
  titleKey: string,
  fields: { key: string; labelKey: string; multiline?: boolean }[],
): SkinBlockDescriptor {
  return {
    blockKey,
    titleKey,
    controls: fields.map((field) => ({
      path: `${blockKey}.${field.key}`,
      kind: field.multiline ? "textarea" : "text",
      labelKey: field.labelKey,
    })),
  };
}

/** A whole-block `string[]` list: one `stringList` control at the block root. */
function stringListBlock(
  blockKey: string,
  titleKey: string,
): SkinBlockDescriptor {
  return {
    blockKey,
    titleKey,
    controls: [{ path: blockKey, kind: "stringList", labelKey: titleKey }],
  };
}

/** A whole-block object array: one `objectList` control at the block root. */
function objectListBlock(
  blockKey: string,
  titleKey: string,
  itemFields: SkinItemFieldDescriptor[],
): SkinBlockDescriptor {
  return {
    blockKey,
    titleKey,
    controls: [{ path: blockKey, kind: "objectList", labelKey: titleKey, itemFields }],
  };
}

const label = (family: SkinFamily, block: string, field: string): string =>
  `subprofiles:skinBlock.${family}.${block}.${field}`;
const title = (family: SkinFamily, block: string): string =>
  `subprofiles:skinBlock.${family}.${block}.title`;

// ── Per-family block tables ─────────────────────────────────────────────────

const STAGE_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("booker", title("stage", "booker"), [
    { key: "fee", labelKey: label("stage", "booker", "fee") },
    { key: "rider", labelKey: label("stage", "booker", "rider") },
    { key: "press", labelKey: label("stage", "booker", "press") },
    { key: "contact", labelKey: label("stage", "booker", "contact") },
  ]),
];

const PAGE_BLOCKS: SkinBlockDescriptor[] = [
  {
    blockKey: "excerpt",
    titleKey: title("page", "excerpt"),
    controls: [
      { path: "excerpt.from", kind: "text", labelKey: label("page", "excerpt", "from") },
      { path: "excerpt.lines", kind: "stringList", labelKey: label("page", "excerpt", "lines") },
    ],
  },
  {
    blockKey: "colophon",
    titleKey: title("page", "colophon"),
    controls: [
      { path: "colophon", kind: "textarea", labelKey: title("page", "colophon") },
    ],
  },
];

const TABLE_BLOCKS: SkinBlockDescriptor[] = [
  {
    blockKey: "menuMeta",
    titleKey: title("table", "menuMeta"),
    controls: [
      { path: "menuMeta.no", kind: "text", labelKey: label("table", "menuMeta", "no") },
      { path: "menuMeta.when", kind: "text", labelKey: label("table", "menuMeta", "when") },
      {
        path: "menuMeta.practical",
        kind: "stringList",
        labelKey: label("table", "menuMeta", "practical"),
      },
    ],
  },
];

const PRACTICE_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("practical", title("practice", "practical"), [
    { key: "fee", labelKey: label("practice", "practical", "fee") },
    { key: "sliding", labelKey: label("practice", "practical", "sliding") },
    { key: "length", labelKey: label("practice", "practical", "length") },
    { key: "languages", labelKey: label("practice", "practical", "languages") },
    { key: "mode", labelKey: label("practice", "practical", "mode") },
    { key: "next", labelKey: label("practice", "practical", "next") },
  ]),
  objectListBlock("firstSession", title("practice", "firstSession"), [
    { key: "title", labelKey: label("practice", "firstSession", "stepTitle") },
    { key: "body", labelKey: label("practice", "firstSession", "body"), multiline: true },
  ]),
  stringListBlock("access", title("practice", "access")),
  objectListBlock("referrals", title("practice", "referrals"), [
    { key: "name", labelKey: label("practice", "referrals", "name") },
    { key: "note", labelKey: label("practice", "referrals", "note"), multiline: true },
  ]),
];

const CHART_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("sky", title("chart", "sky"), [
    { key: "moon", labelKey: label("chart", "sky", "moon") },
    { key: "phase", labelKey: label("chart", "sky", "phase") },
    { key: "note", labelKey: label("chart", "sky", "note"), multiline: true },
  ]),
  objectBlock("birthData", title("chart", "birthData"), [
    { key: "date", labelKey: label("chart", "birthData", "date") },
    { key: "time", labelKey: label("chart", "birthData", "time") },
    { key: "place", labelKey: label("chart", "birthData", "place") },
    { key: "note", labelKey: label("chart", "birthData", "note"), multiline: true },
  ]),
  stringListBlock("ethics", title("chart", "ethics")),
];

const CHAIR_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("chair", title("chair", "chair"), [
    { key: "rate", labelKey: label("chair", "chair", "rate") },
    { key: "walkins", labelKey: label("chair", "chair", "walkins") },
    { key: "where", labelKey: label("chair", "chair", "where") },
    { key: "quiet", labelKey: label("chair", "chair", "quiet") },
  ]),
  stringListBlock("beforeYouSit", title("chair", "beforeYouSit")),
];

const RUNWAY_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("credits", title("runway", "credits"), [
    { key: "press", labelKey: label("runway", "credits", "press") },
    { key: "stockists", labelKey: label("runway", "credits", "stockists") },
    { key: "made", labelKey: label("runway", "credits", "made") },
    { key: "contact", labelKey: label("runway", "credits", "contact") },
  ]),
];

const GALLERY_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("onView", title("gallery", "onView"), [
    // Field key is literally "title"; use a distinct label suffix so it doesn't
    // collide with the block's own ".title" heading key.
    { key: "title", labelKey: label("gallery", "onView", "showTitle") },
    { key: "artist", labelKey: label("gallery", "onView", "artist") },
    { key: "dates", labelKey: label("gallery", "onView", "dates") },
    { key: "room", labelKey: label("gallery", "onView", "room") },
  ]),
  objectBlock("visit", title("gallery", "visit"), [
    { key: "hours", labelKey: label("gallery", "visit", "hours") },
    { key: "address", labelKey: label("gallery", "visit", "address") },
    { key: "access", labelKey: label("gallery", "visit", "access") },
    { key: "admission", labelKey: label("gallery", "visit", "admission") },
  ]),
];

const HISTORY_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("record", title("history", "record"), [
    { key: "held", labelKey: label("history", "record", "held") },
    { key: "access", labelKey: label("history", "record", "access") },
    { key: "consent", labelKey: label("history", "record", "consent") },
    { key: "gaps", labelKey: label("history", "record", "gaps"), multiline: true },
  ]),
];

const COLLECTIVE_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("nextAction", title("collective", "nextAction"), [
    { key: "what", labelKey: label("collective", "nextAction", "what") },
    { key: "when", labelKey: label("collective", "nextAction", "when") },
    { key: "where", labelKey: label("collective", "nextAction", "where") },
  ]),
  stringListBlock("principles", title("collective", "principles")),
];

const CLASSROOM_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("fees", title("classroom", "fees"), [
    { key: "cost", labelKey: label("classroom", "fees", "cost") },
    { key: "materials", labelKey: label("classroom", "fees", "materials") },
    { key: "where", labelKey: label("classroom", "fees", "where") },
    { key: "extras", labelKey: label("classroom", "fees", "extras") },
    { key: "note", labelKey: label("classroom", "fees", "note"), multiline: true },
  ]),
  stringListBlock("promises", title("classroom", "promises")),
];

/**
 * Editable `SkinData` blocks per family. `studio`/`workshop` have no
 * owner-editable persona-level block (their skins render only from section
 * items), so they are absent — a persona in those families shows no "Page
 * blocks" rail entry. The per-dish menu COURSES (`ItemStructured.courses`) are
 * item-structured, not `SkinData`, and are edited elsewhere — out of scope here.
 */
export const SKIN_BLOCKS_BY_FAMILY: Partial<Record<SkinFamily, SkinBlockDescriptor[]>> = {
  stage: STAGE_BLOCKS,
  page: PAGE_BLOCKS,
  table: TABLE_BLOCKS,
  practice: PRACTICE_BLOCKS,
  chart: CHART_BLOCKS,
  chair: CHAIR_BLOCKS,
  runway: RUNWAY_BLOCKS,
  gallery: GALLERY_BLOCKS,
  history: HISTORY_BLOCKS,
  collective: COLLECTIVE_BLOCKS,
  classroom: CLASSROOM_BLOCKS,
};

/** The editable skin blocks for a persona's kind (via its derived family). */
export function skinBlocksForKind(kind: SubprofileKind): SkinBlockDescriptor[] {
  return SKIN_BLOCKS_BY_FAMILY[skinFor(kind)] ?? [];
}

/** Whether this persona's skin has any owner-editable `SkinData` block — gates
 *  the "Page blocks" rail entry + pane. */
export function hasSkinBlocks(kind: SubprofileKind): boolean {
  return skinBlocksForKind(kind).length > 0;
}
