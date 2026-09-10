/**
 * i18n Pattern A — this file holds catalog *keys* (and, where the underlying
 * value is submitted to the backend or compared in state, a stable canonical
 * `value` alongside the key). Every option here is platform-authored chrome
 * (the neighbourhood picker, the language list, the accessibility checklist),
 * so it is translated. `value` never changes with
 * language, only the resolved label shown to the host does. The gathering's
 * own vocabulary moved to `gatheringCatalog.ts`.
 */

// Pricing/ticketing (formerly step 4) was removed from the active wizard flow:
// the backend has no price columns and no payment integration anywhere (see
// `PricingStep`'s deletion + `events.adapters.ts`'s `formToCreateEventDto`
// doc), so the step implied a capture-and-honor promise the platform never
// kept. Matches this platform's pattern of removing a fake-functional step
// rather than leaving a "coming soon" stub that still looks interactive.
//
// `RepeatsStep` (MSG-10) took the freed slot right after date/place — a
// gathering's cadence is a scheduling decision, so it reads naturally next
// to when/where it happens.
export const TOTAL_STEPS = 5;

export const PILL_LABEL_KEYS = [
  "gatherings:create.pill.type",
  "gatherings:create.pill.datePlace",
  "gatherings:create.pill.repeats",
  "gatherings:create.pill.capacity",
  "gatherings:create.pill.review",
];

export const TIP_KEYS = [
  "gatherings:create.tip.type",
  "gatherings:create.tip.datePlace",
  "gatherings:create.tip.repeats",
  "gatherings:create.tip.capacity",
  "gatherings:create.tip.review",
];

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

// "slidingScale" (ticket-pricing honesty) dropped along with the pricing
// step above — there is no pricing to confirm honest anymore.
export const CONFIRM_CHECK_KEYS = [
  "gatherings:create.confirm.codeOfCare",
  "gatherings:create.confirm.accessibility",
];

/**
 * The same two pledges, phrased as the action still outstanding, for the
 * "what is still missing" checklist above the publish button. Index-aligned
 * with `CONFIRM_CHECK_KEYS`: the checklist reads `form.checks[i]`. The pledge
 * text itself is a full sentence the host is signing, which reads wrong in a
 * to-do line, so the two are worded separately rather than reused.
 */
export const CONFIRM_GATE_LABEL_KEYS = [
  "gatherings:create.gate.confirm.codeOfCare",
  "gatherings:create.gate.confirm.accessibility",
];

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
 * Only one wizard step is mounted at a time, so a constant id per field is
 * unique on the page. Ids are attached in the step components and read in
 * `StepRequirementChecklist`; `stepRequirements()` is what pairs them with a
 * row.
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
} as const;

/** The anchor of one publish pledge, index-aligned with
 *  `CONFIRM_CHECK_KEYS` / `CONFIRM_GATE_LABEL_KEYS`. */
export function confirmAnchor(index: number): string {
  return `cg-gate-confirm-${index}`;
}
