import type { TFunction } from "../../shared/i18n/types";
import type { ContentSettingId } from "./api/useContentSensitivity";

export interface ChipGroup {
  options: string[];
  defaults: string[];
}

// i18n sweep (DES-430): IDENTITIES.options and LOOKING_FOR.options below stay
// the literal *stored* values of draft.identities / draft.lookingFor,
// persisted on the Member record and read elsewhere in the app (member
// directory filtering) outside this sweep's scope. The stored value itself
// is never translated, or the directory filtering and the backend's
// canonical list would silently desync from what a pt member typed. Display
// goes through the *_LABEL_KEYS maps below: a same-scope render-time lookup
// that leaves the stored value alone, resolved with identityLabel /
// lookingForLabel.
const IDENTITY_VALUES = [
  "Gay",
  "Lesbian",
  "Bisexual",
  "Pansexual",
  "Queer",
  "Trans",
  "Non-binary",
  "Genderqueer",
  "Genderfluid",
  "Asexual",
  "Aromantic",
  "Intersex",
  "Two-spirit",
  "Questioning",
  "Ally",
  // Added alongside the discoverability work: the member directory offers
  // "QPOC / queer of colour" and "Disabled / chronic illness" as filter
  // facets, but there was no way to declare either privately, so those two
  // filters could never have matched anyone. Both are also in the backend's
  // canonical list (src/profiles/identities.ts).
  "Queer person of colour",
  "Disabled or chronically ill",
  "Prefer not to say",
] as const;

export type IdentityValue = (typeof IDENTITY_VALUES)[number];

export const IDENTITIES: ChipGroup = {
  options: [...IDENTITY_VALUES],
  defaults: ["Gay", "Bisexual", "Queer"],
};

/** Render-time label key for each stored identity value (Pattern A). A full
 *  Record, so adding a value to IDENTITY_VALUES without a label here fails
 *  typecheck, catching an untranslated chip before it ships. */
export const IDENTITY_LABEL_KEYS: Record<IdentityValue, string> = {
  Gay: "settings:identity.chip.gay",
  Lesbian: "settings:identity.chip.lesbian",
  Bisexual: "settings:identity.chip.bisexual",
  Pansexual: "settings:identity.chip.pansexual",
  Queer: "settings:identity.chip.queer",
  Trans: "settings:identity.chip.trans",
  "Non-binary": "settings:identity.chip.nonBinary",
  Genderqueer: "settings:identity.chip.genderqueer",
  Genderfluid: "settings:identity.chip.genderfluid",
  Asexual: "settings:identity.chip.asexual",
  Aromantic: "settings:identity.chip.aromantic",
  Intersex: "settings:identity.chip.intersex",
  "Two-spirit": "settings:identity.chip.twoSpirit",
  Questioning: "settings:identity.chip.questioning",
  Ally: "settings:identity.chip.ally",
  "Queer person of colour": "settings:identity.chip.queerPersonOfColour",
  "Disabled or chronically ill":
    "settings:identity.chip.disabledOrChronicallyIll",
  "Prefer not to say": "settings:identity.chip.preferNotToSay",
};

/** Render-time label for any *stored* identity value, including a legacy
 *  value no longer offered as a chip. A mapped value is translated through
 *  `t()`; an unmapped one renders the raw stored value directly, without
 *  going through `t()` at all, so it neither logs a missing key on every
 *  render nor risks being parsed as a namespaced key (see
 *  `shared/i18n/translate.ts`'s `parseKey`). */
export function identityLabel(t: TFunction, value: string): string {
  const key = (IDENTITY_LABEL_KEYS as Partial<Record<string, string>>)[value];
  return key ? t(key) : value;
}

/**
 * "Prefer not to say" is a refusal to disclose. Offering it as something you
 * can publish to a searchable directory is incoherent — a member who ticked it
 * to mean "leave me out of this" must never be handed a switch that puts that
 * refusal into a search index. Mirrors NON_PUBLISHABLE_INTEREST_LABELS on the
 * backend, which rejects it too.
 */
export const NON_PUBLISHABLE_IDENTITIES = ["Prefer not to say"];

/** The identities a member could publish for directory discovery, in their own
 *  order. Everything else is private-only. */
export function publishableIdentities(identities: string[]): string[] {
  return identities.filter(
    (label) =>
      IDENTITIES.options.includes(label) &&
      !NON_PUBLISHABLE_IDENTITIES.includes(label),
  );
}

const LOOKING_FOR_VALUES = [
  "Community & friendship",
  "Professional networking",
  "Gatherings & events",
  "Creative collaboration",
  "Housing & flatmates",
  "Resources & support",
  "Activism & organising",
  "Dating & relationships",
  "Mentorship (giving)",
  "Mentorship (seeking)",
  "Reading & culture",
  "Queer parenting",
  "Nightlife",
] as const;

export type LookingForValue = (typeof LOOKING_FOR_VALUES)[number];

export const LOOKING_FOR: ChipGroup = {
  options: [...LOOKING_FOR_VALUES],
  defaults: [
    "Community & friendship",
    "Professional networking",
    "Gatherings & events",
    "Creative collaboration",
    "Reading & culture",
  ],
};

/** Render-time label key for each stored "looking for" value (Pattern A),
 *  mirroring IDENTITY_LABEL_KEYS above. A full Record. */
export const LOOKING_FOR_LABEL_KEYS: Record<LookingForValue, string> = {
  "Community & friendship": "settings:lookingFor.chip.communityFriendship",
  "Professional networking": "settings:lookingFor.chip.professionalNetworking",
  "Gatherings & events": "settings:lookingFor.chip.gatheringsEvents",
  "Creative collaboration": "settings:lookingFor.chip.creativeCollaboration",
  "Housing & flatmates": "settings:lookingFor.chip.housingFlatmates",
  "Resources & support": "settings:lookingFor.chip.resourcesSupport",
  "Activism & organising": "settings:lookingFor.chip.activismOrganising",
  "Dating & relationships": "settings:lookingFor.chip.datingRelationships",
  "Mentorship (giving)": "settings:lookingFor.chip.mentorshipGiving",
  "Mentorship (seeking)": "settings:lookingFor.chip.mentorshipSeeking",
  "Reading & culture": "settings:lookingFor.chip.readingCulture",
  "Queer parenting": "settings:lookingFor.chip.queerParenting",
  Nightlife: "settings:lookingFor.chip.nightlife",
};

/** Render-time label for any stored "looking for" value, falling back to the
 *  raw stored value for a legacy option no longer offered, the same way
 *  `identityLabel` above does. */
export function lookingForLabel(t: TFunction, value: string): string {
  const key = (LOOKING_FOR_LABEL_KEYS as Partial<Record<string, string>>)[
    value
  ];
  return key ? t(key) : value;
}

// Only the index (DEFAULT_AGE_INDEX) is stored anywhere; the labels
// themselves are display-only, so they resolve through a catalog key
// (Pattern A) with a stable `id` kept for React keys.
export interface AgeLabel {
  id: string;
  labelKey: string;
}

export const AGE_LABELS: AgeLabel[] = [
  { id: "under25", labelKey: "settings:interests.age.under25" },
  { id: "25to35", labelKey: "settings:interests.age.25to35" },
  { id: "35to45", labelKey: "settings:interests.age.35to45" },
  { id: "45plus", labelKey: "settings:interests.age.45plus" },
];
export const DEFAULT_AGE_INDEX = 1;

// UI-only toggles — no persisted value beyond local component state.
export interface ReadingPref {
  id: string;
  labelKey: string;
}

export const READING_PREFS: ReadingPref[] = [
  { id: "longform", labelKey: "settings:interests.readingPref.longform" },
  {
    id: "memberStories",
    labelKey: "settings:interests.readingPref.memberStories",
  },
  {
    id: "resourcesGuides",
    labelKey: "settings:interests.readingPref.resourcesGuides",
  },
  {
    id: "communityThreads",
    labelKey: "settings:interests.readingPref.communityThreads",
  },
];

export interface FreqOption {
  key: string;
  titleKey: string;
  descKey: string;
}

export const FREQ_OPTIONS: FreqOption[] = [
  {
    key: "daily",
    titleKey: "settings:interests.freq.daily.title",
    descKey: "settings:interests.freq.daily.desc",
  },
  {
    key: "weekly",
    titleKey: "settings:interests.freq.weekly.title",
    descKey: "settings:interests.freq.weekly.desc",
  },
  {
    key: "important",
    titleKey: "settings:interests.freq.important.title",
    descKey: "settings:interests.freq.important.desc",
  },
];

export const DEFAULT_FREQ = "weekly";

/**
 * The three content-sensitivity switches, persisted since PRD-10 through
 * `GET|PUT /me/content-sensitivity`.
 *
 * `id` is typed as `ContentSettingId` rather than `string` on purpose: the
 * hook owns the map from each id to the field it stores, so adding a switch
 * here that nothing persists is now a compile error instead of the silent dead
 * toggle this list used to be.
 */
export interface ContentSetting {
  id: ContentSettingId;
  labelKey: string;
}

export const CONTENT_SETTINGS: ContentSetting[] = [
  { id: "dating", labelKey: "settings:interests.contentSetting.dating" },
  {
    id: "mentalHealth",
    labelKey: "settings:interests.contentSetting.mentalHealth",
  },
  {
    id: "sexualityIdentity",
    labelKey: "settings:interests.contentSetting.sexualityIdentity",
  },
];
