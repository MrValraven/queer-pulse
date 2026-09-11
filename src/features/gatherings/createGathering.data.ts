/**
 * i18n Pattern A — this file holds catalog *keys* (and, where the underlying
 * value is submitted to the backend or compared in state, a stable canonical
 * `value` alongside the key). Every option here is platform-authored chrome
 * (the neighbourhood picker, the language list, the accessibility checklist),
 * so it is translated. `value` never changes with
 * language, only the resolved label shown to the host does. The gathering's
 * own vocabulary moved to `gatheringCatalog.ts`.
 */

// ── Repeats (MSG-10) ─────────────────────────────────────────────────────
// `value` matches the backend's `RecurrenceCadence`/`RecurrenceEndType`
// literal unions exactly (see events.api.ts) — never translated, only the
// label is.
export const CADENCE_OPTIONS: {
  value: "weekly" | "biweekly" | "monthly";
  labelKey: string;
}[] = [
  { value: "weekly", labelKey: "gatherings:create.repeats.cadence.weekly" },
  { value: "biweekly", labelKey: "gatherings:create.repeats.cadence.biweekly" },
  { value: "monthly", labelKey: "gatherings:create.repeats.cadence.monthly" },
];

// Backend cap (`MAX_OCCURRENCES`, events.service.ts) — mirrored here so the
// count input's own bounds match what the server will actually accept.
export const MAX_RECURRENCE_OCCURRENCES = 52;
export const MIN_RECURRENCE_OCCURRENCES = 2;

/** The longest a single gathering may run, start to end. A festival or a
 *  multi-night retreat fits comfortably; a typo that would pin a gathering to
 *  the top of browse for two years does not. Mirrored server-side by
 *  `MAX_GATHERING_SPAN_DAYS` in the backend's `events.service.ts`, so the
 *  wizard never offers a span the API would reject. */
export const MAX_GATHERING_SPAN_DAYS = 14;

/**
 * Lisbon neighbourhood names are proper nouns and read identically in both
 * catalogs, but the picker still routes through keys for uniformity — and
 * because "Online" / "Other in Lisbon" genuinely need translating. `value` is
 * the canonical English string `useGatheringForm` stores (the create-event
 * adapter compares it to `"Online"` directly), reused from the flagship
 * `gatherings:hood.*` keys where the neighbourhood matches.
 */
export const HOODS: { value: string; labelKey: string }[] = [
  { value: "Mouraria", labelKey: "gatherings:hood.mouraria" },
  { value: "Intendente", labelKey: "gatherings:create.hood.intendente" },
  { value: "Alfama", labelKey: "gatherings:hood.alfama" },
  { value: "Graça", labelKey: "gatherings:hood.graca" },
  { value: "Príncipe Real", labelKey: "gatherings:hood.principeReal" },
  { value: "Bairro Alto", labelKey: "gatherings:hood.bairroAlto" },
  { value: "Cais do Sodré", labelKey: "gatherings:hood.caisDoSodre" },
  { value: "Santos", labelKey: "gatherings:create.hood.santos" },
  { value: "Marvila", labelKey: "gatherings:hood.marvila" },
  { value: "Arroios", labelKey: "gatherings:hood.arroios" },
  { value: "Online", labelKey: "gatherings:create.hood.online" },
  {
    value: "Other in Lisbon",
    labelKey: "gatherings:create.hood.otherInLisbon",
  },
];

/** Resolve a stored `form.hood` value back to its display key. */
export function hoodLabelKey(value: string): string | undefined {
  return HOODS.find((hood) => hood.value === value)?.labelKey;
}

export const LANGS: { value: string; labelKey: string }[] = [
  { value: "PT / EN bilingual", labelKey: "gatherings:create.lang.bilingual" },
  { value: "Portuguese only", labelKey: "gatherings:create.lang.ptOnly" },
  { value: "English only", labelKey: "gatherings:create.lang.enOnly" },
  { value: "Other", labelKey: "gatherings:create.lang.other" },
];

/** Resolve a stored `form.lang` value back to its display key. */
export function langLabelKey(value: string): string | undefined {
  return LANGS.find((lang) => lang.value === value)?.labelKey;
}

/**
 * The accessibility checklist that used to live here was five tick boxes, and
 * a tick box can only say "yes" or say nothing. "There is a step at the door"
 * and "nobody has told us" came out as the same blank, which is precisely the
 * ambiguity someone who uses a wheelchair cannot plan around.
 *
 * The wizard now asks the SAME six three-valued questions a business listing
 * answers (`marketing/listBusiness/listingAccessibility.data.ts`), so a member
 * reads one vocabulary across the directory and the gatherings board, and the
 * host's "the accessibility information I have given is accurate" pledge is a
 * pledge about answers that are actually stored.
 */

/**
 * Where each requirement in the "what is still missing" checklist actually
 * lives on the page.
 *
 * The checklist named the outstanding field and then left the host to find it:
 * on step 1 that is a scroll back past a grid of eight cards, and on the review
 * step past the whole recap. Every row is a button now, and these are the ids
 * it jumps to, put on the field GROUP (label, control and hint together) so
 * the flash marks the thing the row names rather than a bare input.
 *
 * Create Gathering v2 keeps all five chapter bodies mounted (a closed chapter
 * is `hidden`), and each field is rendered exactly once, so a constant id per
 * field is still unique on the page. Ids are attached by the chapter bodies
 * and read by `jumpToAnchor` (createGatheringChapters.ts), which the ready
 * panel and the chapter footers call.
 */
export const GATE_ANCHOR = {
  type: "cg-gate-type",
  /** The host's own words for a format, which is a field of its own below the
   *  grid: the "Name your own format" row lands the cursor in the empty box
   *  rather than back on the card that revealed it. */
  format: "cg-gate-format",
  title: "cg-gate-title",
  date: "cg-gate-date",
  joinLink: "cg-gate-join-link",
  recurrence: "cg-gate-recurrence",
  /** Chapter 1's cover image field (a soft readiness row). */
  cover: "cg-gate-cover",
  /** Chapter 2's neighbourhood field (a soft readiness row). */
  hood: "cg-gate-hood",
  /** Chapter 4's six accessibility questions (a soft readiness row). */
  accessibility: "cg-gate-accessibility",
} as const;

/** The anchor of one publish pledge, index-aligned with `PLEDGE_TEXT_KEYS`. */
export function confirmAnchor(index: number): string {
  return `cg-gate-confirm-${index}`;
}

// ── Create Gathering v2: chapters, ready panel, drafts ────────────────────

export type CreateGatheringChapterId =
  "what" | "whenWhere" | "who" | "access" | "care";

export interface CreateGatheringChapterDefinition {
  id: CreateGatheringChapterId;
  /** The serif title, with its coral `<em>` run. */
  titleKey: string;
  /** The muted paragraph at the top of the open chapter. */
  introKey: string;
  /** Shows the "optional" tag in the collapsed head. */
  isOptional: boolean;
}

/** The five chapters, in page order. Index-aligned with the gates and
 *  summaries in `createGatheringChapters.ts`. */
export const CREATE_GATHERING_CHAPTERS: readonly CreateGatheringChapterDefinition[] =
  [
    {
      id: "what",
      titleKey: "gatherings:create.v2.chapter.what.title",
      introKey: "gatherings:create.v2.chapter.what.intro",
      isOptional: false,
    },
    {
      id: "whenWhere",
      titleKey: "gatherings:create.v2.chapter.whenWhere.title",
      introKey: "gatherings:create.v2.chapter.whenWhere.intro",
      isOptional: false,
    },
    {
      id: "who",
      titleKey: "gatherings:create.v2.chapter.who.title",
      introKey: "gatherings:create.v2.chapter.who.intro",
      isOptional: false,
    },
    {
      id: "access",
      titleKey: "gatherings:create.v2.chapter.access.title",
      introKey: "gatherings:create.v2.chapter.access.intro",
      isOptional: false,
    },
    {
      id: "care",
      titleKey: "gatherings:create.v2.chapter.care.title",
      introKey: "gatherings:create.v2.chapter.care.intro",
      isOptional: true,
    },
  ];

/** The `<section>` of one chapter (0-based). Continue scrolls to it. */
export function chapterSectionId(chapterIndex: number): string {
  return `cg-chapter-${chapterIndex}`;
}

/** The head button of one chapter. Continue moves focus to it. */
export function chapterHeadId(chapterIndex: number): string {
  return `cg-chapter-${chapterIndex}-head`;
}

/** The body region of one chapter, named by the head's `aria-controls`. */
export function chapterBodyId(chapterIndex: number): string {
  return `cg-chapter-${chapterIndex}-body`;
}

/** The ready panel. "Looks good" on the last chapter scrolls to it. */
export const READY_PANEL_ANCHOR = "cg-ready";

/** The two publish pledges shown in the ready panel, index-aligned with
 *  `form.checks` and `confirmAnchor(index)`. */
export const PLEDGE_TEXT_KEYS = [
  "gatherings:create.v2.confirm.codeOfCare",
  "gatherings:create.v2.confirm.accessibility",
];

/** Index-aligned with `PLEDGE_TEXT_KEYS`: the label of the Code of Care link
 *  shown under a pledge, or null for a pledge without one. The link sits
 *  beside the checkbox, outside it, so it stays reachable. */
export const PLEDGE_LINK_LABEL_KEYS: readonly (string | null)[] = [
  "gatherings:create.v2.confirm.codeOfCareLink",
  null,
];

/** At or under this width the rail stacks above the form, the ready panel
 *  moves under the chapters and the mobile publish bar appears. Matches the
 *  `--wide` breakpoint token. */
export const COMPACT_LAYOUT_QUERY = "(max-width: 900px)";

/** A draft is stored under `${prefix}:${memberId or "anon"}`. */
export const CREATE_GATHERING_DRAFT_KEY_PREFIX = "qp-create-gathering-draft-v1";

/** How long the form has to stay still before the draft is written. */
export const DRAFT_SAVE_DELAY_MS = 700;

/** How often "Saved · N min" re-reads the clock. */
export const DRAFT_CLOCK_TICK_MS = 30_000;

/**
 * The role and commitment a co-host picked in the wizard is invited with
 * (ruling R12). The wizard asks only who; `POST /events/:slug/cohost-invites`
 * also needs these two, and the lightest pair describes what the wizard
 * promises ("they appear on the card and receive RSVPs too"). The invitee
 * reads both on their invite page, and the host can send a fuller invite from
 * the manage page.
 */
export const COHOST_INVITE_DEFAULT_ROLE = "greeter";
export const COHOST_INVITE_DEFAULT_COMMITMENT = "light";
