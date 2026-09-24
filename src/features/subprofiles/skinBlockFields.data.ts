import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";
import { skinFor, type SkinFamily } from "./subprofile-skins";
import {
  THERAPIST_BLOCKS,
  THERAPIST_CHAPTERS,
} from "./therapistEditorChapters.data";

/**
 * Descriptor tables for the per-skin "Page blocks" editor pane
 * (`SubprofileSkinBlocksEditor`), mirroring `richFields.data.ts`'s descriptor
 * style. Each `SkinFamily` maps to the persona-level `SkinData` blocks its skin
 * renders, and each block to the labelled controls the owner fills in. The pane
 * reads/writes these through `useSubprofileSkinBlocksEditor`, and they save via
 * the single meta PATCH (folded into `skinData` in `useEditorSaveGraph`).
 *
 * A control's `path` is a dot-path into `SkinData`: either a whole top-level
 * block (`"beforeYouSit"`, `"colophon"`) or a sub-field of one (`"chair.rate"`,
 * `"excerpt.lines"`). The block's `blockKey` (the first path segment) is the
 * diff/dirty granularity used by the pending-changes list.
 *
 * Control kinds:
 *  - `text`: single-line `<input>` (sub-field of an object block).
 *  - `textarea`: multi-line `<textarea>` (e.g. `colophon`, a gaps note).
 *  - `stringList`: an ordered `string[]` list editor (add/remove/reorder lines).
 *  - `objectList`: an ordered array of small objects, each with `itemFields`.
 *  - `grid`: a 4×7 availability calendar editor (Practice skin only):
 *    start date + slot time + 28 tap-to-cycle day cells.
 *  - `select`: one choice from a fixed `options` list, stored as the
 *    option's string value (an `objectList` item field's kind).
 *
 * Kinds used by the chaptered therapist editor (`therapistEditorChapters.data.ts`):
 *  - `segmented`: the `select` choice as a segmented control, each option
 *    optionally carrying a status `tone` dot (therapist status, online answer).
 *  - `money`: a euro amount stored as a digit string with at most one decimal
 *    separator ("65", "32,50"), shown with a € sign and a decimal keypad.
 *  - `count`: a whole number stored as a digit string (places, people waiting).
 *  - `chips`: a `string[]` edited as chips (type + Enter to add, reorder,
 *    edit in place), for lists the public page shows as chips.
 *  - `paragraphs`: a `string[]` edited as one textarea per paragraph.
 *  - `pairs`: an object[] with exactly two `itemFields`, edited as compact
 *    table rows (session lengths, reimbursement, hours).
 *  - `entries`: an object[] edited as a numbered list whose first item field
 *    reads as the entry's title (FAQ, first-session steps, referrals).
 *  - `lines`: a `string[]` edited as compact one-line rows (address lines).
 *  - `choice`: one of a fixed `options` list as a row of toggle chips, stored
 *    as the option's string value ("" once cleared). A stored string that is
 *    no option (older owner-typed text) shows as an extra chip until replaced
 *    (session frequency, when receipts arrive, cancellation notice).
 *  - `multiChoice`: several of a fixed `options` list as toggle chips, stored
 *    as a `string[]` in the options' order (payment methods).
 *  - `multiSelect`: several of a fixed `options` list picked from a dropdown
 *    of checkboxes, stored as a `string[]` in pick order: option ids plus,
 *    with `allowsCustom`, the owner's own trimmed entries. An older
 *    comma-separated string reads as its parts, and a stored option label
 *    counts as that option (lived experience, languages).
 *  - `sectionItems`: the items of a persona section (`section`), each a
 *    heading plus one line per topic (what a therapist helps with). Its
 *    `path` is `"section:<name>"`; it saves with the section's own rows and
 *    derives no `SkinData` block.
 *
 * All copy is i18n KEYS resolved by the pane via `t(...)`; the intended EN
 * strings live in the build's `b2-i18n-keys.json` (catalogs updated separately).
 */

export type SkinControlKind =
  | "text"
  | "textarea"
  | "stringList"
  | "objectList"
  | "grid"
  | "select"
  | "segmented"
  | "money"
  | "count"
  | "chips"
  | "paragraphs"
  | "pairs"
  | "entries"
  | "lines"
  | "choice"
  | "multiChoice"
  | "multiSelect"
  | "sectionItems";

/** A status dot shown before a `segmented` option's label. */
export type SkinOptionTone = "jade" | "amber" | "muted";

/** One choice of a `select`/`segmented` control or item field: the stored
 *  value plus the i18n key of its visible label. */
export interface SkinSelectOption {
  value: string;
  labelKey: string;
  tone?: SkinOptionTone;
}

/** One field within an `objectList` entry (e.g. a first-session step's
 *  title/body, a referral's name/note). */
export interface SkinItemFieldDescriptor {
  key: string;
  labelKey: string;
  placeholderKey?: string;
  multiline?: boolean;
  /** When set, the field renders as a select over these choices. */
  options?: SkinSelectOption[];
  /** `pairs` only: the value is a euro amount, shown with a € prefix. */
  isMoney?: boolean;
}

/** Show a control only while another control's value is one of `values`
 *  (the waitlist note only for status "wait"). A control with no stored value
 *  counts as holding its own `defaultValue`. Hidden values stay stored. */
export interface SkinShowWhen {
  path: string;
  values: string[];
}

export interface SkinBlockControl {
  /** Dot-path into `SkinData`: `"chair.rate"`, `"excerpt.lines"`, `"colophon"`. */
  path: string;
  kind: SkinControlKind;
  /** Visible label for this control (FormField label, or the list heading). */
  labelKey: string;
  placeholderKey?: string;
  /** Optional helper line under a `text`/`textarea`/`select` control. */
  helperKey?: string;
  /** `objectList` only: the fields rendered for each entry. */
  itemFields?: SkinItemFieldDescriptor[];
  /** `select`, `segmented`, `choice`, `multiChoice` and `multiSelect`: the
   *  choices, in display order. */
  options?: SkinSelectOption[];
  /** `select` only: the choice shown while nothing is stored yet. It matches
   *  what the public page assumes for a missing value. */
  defaultValue?: string;
  /** Chaptered editor only: render this control only under a condition (every
   *  condition in an array must hold). */
  showWhen?: SkinShowWhen | SkinShowWhen[];
  /** `text` only: a one-line field that wraps long values onto more lines
   *  (a `rows=1` textarea that never stores a newline). */
  isWrapping?: boolean;
  /** `textarea` only: show a live line under the field with `*word*` rendered
   *  as the page's coral italic emphasis (the therapist hero quote). */
  hasEmphasisPreview?: boolean;
  /** List kinds only: label of the add button (defaults to "Add"). */
  addLabelKey?: string;
  /** `text` only: warn under the field when the value is one the public page
   *  would drop (it only links a valid email / website). */
  validate?: "email" | "url";
  /** `multiChoice` only: a sibling text path holding the older free-text
   *  answer this control replaces (`therapyFees.payment`). Shown under the
   *  chips while none is ticked, and cleared by the first tick. */
  legacyTextPath?: string;
  /** `multiSelect` only: offer an "Add your own" input under the options, so
   *  the owner can store an entry the list lacks. */
  allowsCustom?: boolean;
  /** `multiSelect` with `allowsCustom`: placeholder of the "Add your own"
   *  input ("Another language"). */
  customPlaceholderKey?: string;
  /** Chapter editor only: the field is sized to a short value. */
  size?: "narrow";
  /** Chapter editor only: the helper is a privacy promise and leads with a
   *  lock. */
  helperTone?: "private";
  /** Chapter `multiSelect` only: option values shown as inline toggle chips;
   *  the rest stay in the full list. */
  featuredValues?: string[];
  /** `sectionItems` only: the persona section whose items this control edits. */
  section?: SubprofileSection;
}

/** One card of a chapter: an optional heading and helper over its controls. */
export interface SkinChapterGroup {
  titleKey?: string;
  helperKey?: string;
  /** `row`: the controls sit side by side, `joinerKey` between them
   *  ("40 € to 65 €", "2 of 4 open"). Default `stack`. */
  layout?: "stack" | "row";
  joinerKey?: string;
  /** A cross-field check on a two-control `row`, shown as a warning under
   *  it: `ascending` (first ≤ second), `partOfWhole` (first ≤ second, read as
   *  "open places can't exceed places"). Blank values never warn. */
  check?: "ascending" | "partOfWhole";
  checkMessageKey?: string;
  controls: SkinBlockControl[];
}

/** One page of the chaptered editor, selected by `?chapter=<key>`. */
export interface SkinChapterDescriptor {
  key: string;
  titleKey: string;
  ledeKey: string;
  groups: SkinChapterGroup[];
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
  fields: {
    key: string;
    labelKey: string;
    multiline?: boolean;
    placeholderKey?: string;
  }[],
): SkinBlockDescriptor {
  return {
    blockKey,
    titleKey,
    controls: fields.map((field) => ({
      path: `${blockKey}.${field.key}`,
      kind: field.multiline ? "textarea" : "text",
      labelKey: field.labelKey,
      placeholderKey: field.placeholderKey,
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
    controls: [
      { path: blockKey, kind: "objectList", labelKey: titleKey, itemFields },
    ],
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
      {
        path: "excerpt.from",
        kind: "text",
        labelKey: label("page", "excerpt", "from"),
      },
      {
        path: "excerpt.lines",
        kind: "stringList",
        labelKey: label("page", "excerpt", "lines"),
      },
    ],
  },
  {
    blockKey: "colophon",
    titleKey: title("page", "colophon"),
    controls: [
      {
        path: "colophon",
        kind: "textarea",
        labelKey: title("page", "colophon"),
      },
    ],
  },
];

const TABLE_BLOCKS: SkinBlockDescriptor[] = [
  {
    blockKey: "menuMeta",
    titleKey: title("table", "menuMeta"),
    controls: [
      {
        path: "menuMeta.no",
        kind: "text",
        labelKey: label("table", "menuMeta", "no"),
      },
      {
        path: "menuMeta.when",
        kind: "text",
        labelKey: label("table", "menuMeta", "when"),
      },
      {
        path: "menuMeta.practical",
        kind: "stringList",
        labelKey: label("table", "menuMeta", "practical"),
      },
    ],
  },
];

const PRACTICE_FIRST_SESSION_BLOCK = objectListBlock(
  "firstSession",
  title("practice", "firstSession"),
  [
    { key: "title", labelKey: label("practice", "firstSession", "stepTitle") },
    {
      key: "body",
      labelKey: label("practice", "firstSession", "body"),
      multiline: true,
    },
  ],
);
const PRACTICE_REFERRALS_BLOCK = objectListBlock(
  "referrals",
  title("practice", "referrals"),
  [
    { key: "name", labelKey: label("practice", "referrals", "name") },
    {
      key: "note",
      labelKey: label("practice", "referrals", "note"),
      multiline: true,
    },
  ],
);
const PRACTICE_APPROACH_BLOCK = stringListBlock(
  "approach",
  title("practice", "approach"),
);
const PRACTICE_VENUE_BLOCK: SkinBlockDescriptor = {
  blockKey: "venue",
  titleKey: title("practice", "venue"),
  controls: [
    {
      path: "venue.name",
      kind: "text",
      labelKey: label("practice", "venue", "name"),
    },
    {
      path: "venue.lines",
      kind: "stringList",
      labelKey: label("practice", "venue", "lines"),
    },
  ],
};

const PRACTICE_BLOCKS: SkinBlockDescriptor[] = [
  objectBlock("practical", title("practice", "practical"), [
    { key: "fee", labelKey: label("practice", "practical", "fee") },
    { key: "sliding", labelKey: label("practice", "practical", "sliding") },
    { key: "length", labelKey: label("practice", "practical", "length") },
    { key: "languages", labelKey: label("practice", "practical", "languages") },
    { key: "mode", labelKey: label("practice", "practical", "mode") },
    { key: "next", labelKey: label("practice", "practical", "next") },
  ]),
  PRACTICE_FIRST_SESSION_BLOCK,
  stringListBlock("access", title("practice", "access")),
  PRACTICE_REFERRALS_BLOCK,
  PRACTICE_APPROACH_BLOCK,
  stringListBlock("training", title("practice", "training")),
  objectListBlock("feeSchedule", title("practice", "feeSchedule"), [
    { key: "label", labelKey: label("practice", "feeSchedule", "label") },
    { key: "value", labelKey: label("practice", "feeSchedule", "value") },
  ]),
  PRACTICE_VENUE_BLOCK,
  {
    blockKey: "availability",
    titleKey: title("practice", "availability"),
    controls: [
      {
        path: "availability",
        kind: "grid",
        labelKey: title("practice", "availability"),
      },
    ],
  },
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
    {
      key: "note",
      labelKey: label("chart", "birthData", "note"),
      multiline: true,
    },
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
    {
      key: "gaps",
      labelKey: label("history", "record", "gaps"),
      multiline: true,
    },
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
    {
      key: "note",
      labelKey: label("classroom", "fees", "note"),
      multiline: true,
    },
  ]),
  stringListBlock("promises", title("classroom", "promises")),
];

/**
 * Editable `SkinData` blocks per family. `studio`/`workshop` have no
 * owner-editable persona-level block (their skins render only from section
 * items), so they are absent and a persona in those families shows no "Page
 * blocks" rail entry. The per-dish menu COURSES (`ItemStructured.courses`) are
 * item-structured data edited elsewhere, so they are out of scope here.
 */
export const SKIN_BLOCKS_BY_FAMILY: Partial<
  Record<SkinFamily, SkinBlockDescriptor[]>
> = {
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

/**
 * Kinds with a page layout of their own carry their own block table, checked
 * before the family lookup. A therapist renders the therapist layout, and its
 * table is derived from the chaptered editor (`therapistEditorChapters.data.ts`);
 * the other practice kinds keep `PRACTICE_BLOCKS`. The therapist table leaves
 * out `practical`, `training` and the `availability` grid because that layout
 * never reads them; any stored values stay in `skinData` untouched.
 */
const SKIN_BLOCKS_BY_KIND: Partial<
  Record<SubprofileKind, SkinBlockDescriptor[]>
> = {
  therapist: THERAPIST_BLOCKS,
};

/** The editable skin blocks for a persona's kind: its own table when it has
 *  one, else its derived family's. */
export function skinBlocksForKind(kind: SubprofileKind): SkinBlockDescriptor[] {
  return (
    SKIN_BLOCKS_BY_KIND[kind] ?? SKIN_BLOCKS_BY_FAMILY[skinFor(kind)] ?? []
  );
}

/** Kinds whose "Page blocks" pane is split into chapters (`?chapter=`). Every
 *  control in a kind's chapters also sits in its `SKIN_BLOCKS_BY_KIND` table,
 *  except a `sectionItems` control, which saves with its section. */
const SKIN_CHAPTERS_BY_KIND: Partial<
  Record<SubprofileKind, SkinChapterDescriptor[]>
> = {
  therapist: THERAPIST_CHAPTERS,
};

/** The chapters of a persona kind's "Page blocks" pane, or `[]` when the kind
 *  keeps the single-scroll block editor. */
export function skinChaptersForKind(
  kind: SubprofileKind,
): SkinChapterDescriptor[] {
  return SKIN_CHAPTERS_BY_KIND[kind] ?? [];
}

/** Whether this persona's skin has any owner-editable `SkinData` block. Gates
 *  the "Page blocks" rail entry + pane. */
export function hasSkinBlocks(kind: SubprofileKind): boolean {
  return skinBlocksForKind(kind).length > 0;
}
