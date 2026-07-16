export interface ChipGroup {
  options: string[];
  defaults: string[];
}

// NOTE (i18n sweep — stored-value corruption trap): IDENTITIES.options and
// LOOKING_FOR.options below are the literal *stored* values of
// draft.identities / draft.lookingFor, persisted on the Member record and
// read elsewhere in the app (member directory filtering) outside this
// sweep's scope. Translating the label without a same-scope id/label-key
// split — which would require touching the Member type + directory
// filtering together — would silently desync the stored value from its own
// display in pt mode. Left in English on purpose; flagged in the sweep
// report for a coordinated follow-up.
export const IDENTITIES: ChipGroup = {
  options: [
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
    "Prefer not to say",
  ],
  defaults: ["Gay", "Bisexual", "Queer"],
};

export const LOOKING_FOR: ChipGroup = {
  options: [
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
  ],
  defaults: [
    "Community & friendship",
    "Professional networking",
    "Gatherings & events",
    "Creative collaboration",
    "Reading & culture",
  ],
};

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

// UI-only toggles — no persisted value beyond local component state.
export interface ContentSetting {
  id: string;
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
