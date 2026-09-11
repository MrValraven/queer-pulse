import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiCoffee,
  FiDroplet,
  FiEyeOff,
  FiHeart,
  FiHome,
  FiMapPin,
  FiMessageCircle,
  FiMessageSquare,
  FiShield,
  FiSmile,
  FiStar,
  FiVolume2,
  FiZap,
} from "react-icons/fi";
import {
  allowedDetailKeys,
  type FormatDetailKey,
  type GatheringFamily,
} from "./gatheringCatalog";

/**
 * The care and access vocabularies a gathering carries beyond its format:
 * themes, content notes, when RSVPs close, what kind of cost it has, and which
 * questions the RSVP details form asks.
 *
 * Declared once per repo. The backend twin is
 * `queerpulse-backend/src/events/gathering-extras.ts`, and the two lists must
 * stay identical: the create DTO validates every key against its own copy, so
 * a value added here alone is a 400 on publish.
 *
 * Every label is a catalog key under `gatherings:extras.*`, resolved at render,
 * so a card cached in one language still reads in the other.
 */

// ── Themes ───────────────────────────────────────────────────────────────────

export const GATHERING_THEME_KEYS = [
  "trans-led",
  "sober",
  "adults-only",
  "beginners-welcome",
  "portuguese-practice",
  "newcomers-to-lisbon",
  "family-friendly",
  "sapphic",
] as const;
export type GatheringThemeKey = (typeof GATHERING_THEME_KEYS)[number];

/** A card has room for three, and more than three stops describing anything. */
export const MAX_GATHERING_THEMES = 3;

export const THEME_LABEL_KEYS: Record<GatheringThemeKey, string> = {
  "trans-led": "gatherings:extras.theme.transLed",
  sober: "gatherings:extras.theme.sober",
  "adults-only": "gatherings:extras.theme.adultsOnly",
  "beginners-welcome": "gatherings:extras.theme.beginnersWelcome",
  "portuguese-practice": "gatherings:extras.theme.portuguesePractice",
  "newcomers-to-lisbon": "gatherings:extras.theme.newcomersToLisbon",
  "family-friendly": "gatherings:extras.theme.familyFriendly",
  sapphic: "gatherings:extras.theme.sapphic",
};

export const THEME_ICONS: Record<GatheringThemeKey, IconType> = {
  "trans-led": FiStar,
  sober: FiCoffee,
  "adults-only": FiShield,
  "beginners-welcome": FiSmile,
  "portuguese-practice": FiMessageCircle,
  "newcomers-to-lisbon": FiMapPin,
  "family-friendly": FiHome,
  sapphic: FiHeart,
};

export function isGatheringThemeKey(
  value: unknown,
): value is GatheringThemeKey {
  return (
    typeof value === "string" &&
    (GATHERING_THEME_KEYS as readonly string[]).includes(value)
  );
}

/**
 * Ruling R6: three themes repeat a question a family's details already ask.
 *
 * A party asks "adults only?" and "sober friendly?", and a move gathering asks
 * "good for beginners?". While the chosen family asks one of those, the
 * matching theme chip is hidden and dropped from the form, so the host answers
 * the question once. Kept as a list of pairs, so a reader sees every overlap
 * in one place and each one is written out explicitly.
 */
export const THEME_DETAIL_OVERLAPS: readonly {
  theme: GatheringThemeKey;
  detailKey: FormatDetailKey;
}[] = [
  { theme: "adults-only", detailKey: "isAdultsOnly" },
  { theme: "sober", detailKey: "isSoberFriendly" },
  { theme: "beginners-welcome", detailKey: "isBeginnerFriendly" },
];

/** The theme keys this family's own detail questions already cover. */
export function hiddenThemeKeysForFamily(
  family: GatheringFamily | "" | null | undefined,
): GatheringThemeKey[] {
  const askedDetailKeys = allowedDetailKeys(family || null);
  return THEME_DETAIL_OVERLAPS.filter((overlap) =>
    askedDetailKeys.includes(overlap.detailKey),
  ).map((overlap) => overlap.theme);
}

/** A list of themes as the API would accept it for this family: known keys
 *  only, no repeats, none the family already asks about, at most three. */
export function sanitizeThemes(
  values: readonly unknown[] | null | undefined,
  family: GatheringFamily | "" | null | undefined,
): GatheringThemeKey[] {
  const hiddenThemeKeys = hiddenThemeKeysForFamily(family);
  const kept: GatheringThemeKey[] = [];
  for (const value of values ?? []) {
    if (!isGatheringThemeKey(value)) continue;
    if (kept.includes(value) || hiddenThemeKeys.includes(value)) continue;
    kept.push(value);
  }
  return kept.slice(0, MAX_GATHERING_THEMES);
}

// ── Content notes ────────────────────────────────────────────────────────────

export const CONTENT_NOTE_KEYS = [
  "sexual-content",
  "violence",
  "transphobia-discussion",
  "flashing-lights",
  "loud-sound",
  "alcohol-present",
] as const;
export type ContentNoteKey = (typeof CONTENT_NOTE_KEYS)[number];

export const CONTENT_NOTE_LABEL_KEYS: Record<ContentNoteKey, string> = {
  "sexual-content": "gatherings:extras.contentNote.sexualContent",
  violence: "gatherings:extras.contentNote.violence",
  "transphobia-discussion":
    "gatherings:extras.contentNote.transphobiaDiscussion",
  "flashing-lights": "gatherings:extras.contentNote.flashingLights",
  "loud-sound": "gatherings:extras.contentNote.loudSound",
  "alcohol-present": "gatherings:extras.contentNote.alcoholPresent",
};

export const CONTENT_NOTE_ICONS: Record<ContentNoteKey, IconType> = {
  "sexual-content": FiEyeOff,
  violence: FiAlertTriangle,
  "transphobia-discussion": FiMessageSquare,
  "flashing-lights": FiZap,
  "loud-sound": FiVolume2,
  "alcohol-present": FiDroplet,
};

export function isContentNoteKey(value: unknown): value is ContentNoteKey {
  return (
    typeof value === "string" &&
    (CONTENT_NOTE_KEYS as readonly string[]).includes(value)
  );
}

/** Known content-note keys only, each once. */
export function sanitizeContentNotes(
  values: readonly unknown[] | null | undefined,
): ContentNoteKey[] {
  const kept: ContentNoteKey[] = [];
  for (const value of values ?? []) {
    if (isContentNoteKey(value) && !kept.includes(value)) kept.push(value);
  }
  return kept;
}

// ── When RSVPs close ─────────────────────────────────────────────────────────

/** A stored cutoff. `at-start` closes RSVPs the moment the gathering starts.
 *  A cutoff of `null` (no cutoff) keeps them open until the gathering ends. */
export const RSVP_CUTOFF_VALUES = [
  "at-start",
  "one-hour-before",
  "day-before",
  "three-days-before",
] as const;
export type RsvpCutoff = (typeof RSVP_CUTOFF_VALUES)[number];

/**
 * How far before the start each cutoff closes RSVPs, in whole hours.
 * `at-start` is 0, so it closes at the start instant itself.
 *
 * Ruling R7: "a day before" is 24 hours before the start instant. Measured in
 * elapsed time on the absolute instant, so the answer is the same in every
 * zone and across a daylight-saving change, and it is exactly what the
 * backend's `rsvpClosesAt` computes.
 */
export const RSVP_CUTOFF_HOURS: Record<RsvpCutoff, number> = {
  "at-start": 0,
  "one-hour-before": 1,
  "day-before": 24,
  "three-days-before": 72,
};

export const RSVP_CUTOFF_LABEL_KEYS: Record<RsvpCutoff, string> = {
  "at-start": "gatherings:extras.rsvpCutoff.atStart",
  "one-hour-before": "gatherings:extras.rsvpCutoff.oneHourBefore",
  "day-before": "gatherings:extras.rsvpCutoff.dayBefore",
  "three-days-before": "gatherings:extras.rsvpCutoff.threeDaysBefore",
};

export function isRsvpCutoff(value: unknown): value is RsvpCutoff {
  return (
    typeof value === "string" &&
    (RSVP_CUTOFF_VALUES as readonly string[]).includes(value)
  );
}

/**
 * The select value for "When it ends", which is a cutoff of `null`.
 *
 * Front-end only. The wire carries `null` for it, and the backend reads `null`
 * as RSVPs staying open until the gathering ends.
 */
export const RSVP_CUTOFF_UNTIL_END_OPTION = "until-end";

/** The label for the "When it ends" option. */
export const RSVP_CUTOFF_UNTIL_END_LABEL_KEY =
  "gatherings:extras.rsvpCutoff.untilEnd";

/** A cutoff as the value a select holds: the cutoff itself, or the
 *  until-end option for `null`. */
export function rsvpCutoffToOptionValue(cutoff: RsvpCutoff | null): string {
  return cutoff ?? RSVP_CUTOFF_UNTIL_END_OPTION;
}

/**
 * A select value back as a cutoff: `null` for the until-end option, the
 * cutoff itself for a known value, and `undefined` for any other value, so the
 * caller can leave the form as it is.
 */
export function optionValueToRsvpCutoff(
  value: string | null | undefined,
): RsvpCutoff | null | undefined {
  if (value === RSVP_CUTOFF_UNTIL_END_OPTION) return null;
  return isRsvpCutoff(value) ? value : undefined;
}

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/** The instant RSVPs close for a gathering starting at `startAt`, or null when
 *  the gathering has no cutoff and RSVPs stay open until it ends. `at-start`
 *  returns `startAt` itself. */
export function rsvpClosesAt(
  startAt: Date,
  cutoff: RsvpCutoff | null,
): Date | null {
  if (!cutoff) return null;
  return new Date(
    startAt.getTime() - RSVP_CUTOFF_HOURS[cutoff] * MILLISECONDS_PER_HOUR,
  );
}

/**
 * The cutoff a family starts the wizard on, while the host has not picked one.
 *
 * A shared meal closes a day ahead because someone has to shop and cook for a
 * known number of plates. Every other family can take a yes up to an hour
 * before the door opens.
 */
export function defaultRsvpCutoffForFamily(
  family: GatheringFamily | "" | null | undefined,
): RsvpCutoff {
  return family === "eat" ? "day-before" : "one-hour-before";
}

// ── What it costs ────────────────────────────────────────────────────────────

export const COST_KIND_VALUES = ["free", "pay-what-you-can", "fixed"] as const;
export type CostKind = (typeof COST_KIND_VALUES)[number];

export const COST_KIND_LABEL_KEYS: Record<CostKind, string> = {
  free: "gatherings:extras.costKind.free",
  "pay-what-you-can": "gatherings:extras.costKind.payWhatYouCan",
  fixed: "gatherings:extras.costKind.fixed",
};

export function isCostKind(value: unknown): value is CostKind {
  return (
    typeof value === "string" &&
    (COST_KIND_VALUES as readonly string[]).includes(value)
  );
}

// ── RSVP details questions ───────────────────────────────────────────────────

export const RSVP_QUESTION_KEYS = ["dietary", "pronouns", "access"] as const;
export type RsvpQuestionKey = (typeof RSVP_QUESTION_KEYS)[number];

/** Which optional questions the RSVP details form asks. */
export type RsvpQuestions = Record<RsvpQuestionKey, boolean>;

/** What a new gathering asks until the host switches a question on. */
export const DEFAULT_RSVP_QUESTIONS: RsvpQuestions = {
  dietary: false,
  pronouns: false,
  access: false,
};

/**
 * Ruling R8: what a gathering created before these questions existed asks.
 *
 * The migration writes exactly this onto every existing row, because the RSVP
 * details form always asked dietary and access needs. A detail that arrives
 * without the field (an older API, a demo record) reads the same way, so the
 * form such a gathering shows does not change underneath its attendees.
 */
export const EXISTING_GATHERING_RSVP_QUESTIONS: RsvpQuestions = {
  dietary: true,
  pronouns: false,
  access: true,
};

/** A partial or loose answer map as a complete one, each missing key taken
 *  from `fallback`. */
export function normalizeRsvpQuestions(
  value: Partial<Record<RsvpQuestionKey, unknown>> | null | undefined,
  fallback: RsvpQuestions,
): RsvpQuestions {
  const readQuestion = (key: RsvpQuestionKey) => {
    const answer = value?.[key];
    return typeof answer === "boolean" ? answer : fallback[key];
  };
  return {
    dietary: readQuestion("dietary"),
    pronouns: readQuestion("pronouns"),
    access: readQuestion("access"),
  };
}

// ── Text limits, mirrored from the backend's column widths ───────────────────

export const MAX_HOUSE_RULES_LENGTH = 160;
export const MAX_CUSTOM_RSVP_QUESTION_LENGTH = 120;
export const MAX_RSVP_PRONOUNS_LENGTH = 60;
export const MAX_RSVP_CUSTOM_ANSWER_LENGTH = 500;
