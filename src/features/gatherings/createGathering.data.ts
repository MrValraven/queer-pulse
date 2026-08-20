import type { IconType } from "react-icons";
import {
  FiBook,
  FiCoffee,
  FiFeather,
  FiFilm,
  FiMessageCircle,
  FiStar,
  FiUsers,
} from "react-icons/fi";

/**
 * i18n Pattern A — this file holds catalog *keys* (and, where the underlying
 * value is submitted to the backend or compared in state, a stable canonical
 * `value` alongside the key). Every option here is platform-authored chrome
 * (fixed gathering types, the sliding-scale tiers, the accessibility
 * checklist), so it is translated. `value` never changes with language —
 * it's what `useGatheringForm` stores and what the create-event adapter reads
 * — only the resolved label shown to the host does.
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
export const CADENCE_OPTIONS: { value: "weekly" | "biweekly" | "monthly"; labelKey: string }[] = [
  { value: "weekly", labelKey: "gatherings:create.repeats.cadence.weekly" },
  { value: "biweekly", labelKey: "gatherings:create.repeats.cadence.biweekly" },
  { value: "monthly", labelKey: "gatherings:create.repeats.cadence.monthly" },
];

// Backend cap (`MAX_OCCURRENCES`, events.service.ts) — mirrored here so the
// count input's own bounds match what the server will actually accept.
export const MAX_RECURRENCE_OCCURRENCES = 52;
export const MIN_RECURRENCE_OCCURRENCES = 2;

export const TYPES: {
  icon: IconType;
  value: string;
  nameKey: string;
  subKey: string;
}[] = [
  {
    icon: FiCoffee,
    value: "Supper club",
    nameKey: "gatherings:create.type.supperClub.name",
    subKey: "gatherings:create.type.supperClub.sub",
  },
  {
    icon: FiBook,
    value: "Workshop / talk",
    nameKey: "gatherings:create.type.workshopTalk.name",
    subKey: "gatherings:create.type.workshopTalk.sub",
  },
  {
    icon: FiFilm,
    value: "Screening",
    nameKey: "gatherings:create.type.screening.name",
    subKey: "gatherings:create.type.screening.sub",
  },
  {
    icon: FiFeather,
    value: "Studio visit",
    nameKey: "gatherings:create.type.studioVisit.name",
    subKey: "gatherings:create.type.studioVisit.sub",
  },
  {
    icon: FiUsers,
    value: "Walk or outdoor",
    nameKey: "gatherings:create.type.walkOutdoor.name",
    subKey: "gatherings:create.type.walkOutdoor.sub",
  },
  {
    icon: FiMessageCircle,
    value: "Discussion",
    nameKey: "gatherings:create.type.discussion.name",
    subKey: "gatherings:create.type.discussion.sub",
  },
  {
    icon: FiUsers,
    value: "Skills exchange",
    nameKey: "gatherings:create.type.skillsExchange.name",
    subKey: "gatherings:create.type.skillsExchange.sub",
  },
  {
    icon: FiStar,
    value: "Other",
    nameKey: "gatherings:create.type.other.name",
    subKey: "gatherings:create.type.other.sub",
  },
];

/** Resolve a stored `form.type` value back to its display key. */
export function typeNameKey(value: string): string | undefined {
  return TYPES.find((type) => type.value === value)?.nameKey;
}

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

export const ACCESS_OPTIONS: { value: string; labelKey: string }[] = [
  {
    value: "Step-free access throughout",
    labelKey: "gatherings:create.access.stepFree",
  },
  { value: "Accessible toilet", labelKey: "gatherings:create.access.toilet" },
  {
    value: "Seating available throughout",
    labelKey: "gatherings:create.access.seating",
  },
  {
    value: "Low sensory / quiet option available",
    labelKey: "gatherings:create.access.lowSensory",
  },
  {
    value: "Dietary requirements can be accommodated",
    labelKey: "gatherings:create.access.dietary",
  },
];

/** Resolve a stored `form.access` entry back to its display key. */
export function accessLabelKey(value: string): string | undefined {
  return ACCESS_OPTIONS.find((option) => option.value === value)?.labelKey;
}

// "slidingScale" (ticket-pricing honesty) dropped along with the pricing
// step above — there is no pricing to confirm honest anymore.
export const CONFIRM_CHECK_KEYS = [
  "gatherings:create.confirm.codeOfCare",
  "gatherings:create.confirm.accessibility",
];
