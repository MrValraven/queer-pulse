export interface ChipGroup {
  options: string[];
  defaults: string[];
}

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

export const AGE_LABELS = ["Under 25", "25–35", "35–45", "45+"];
export const DEFAULT_AGE_INDEX = 1;

export const READING_PREFS = [
  "Long-form articles & essays",
  "Member stories & personal essays",
  "Resources & guides",
  "Community threads & discussions",
];

export interface FreqOption {
  key: string;
  title: string;
  desc: string;
}

export const FREQ_OPTIONS: FreqOption[] = [
  {
    key: "daily",
    title: "Daily digest",
    desc: "One email per day with your top updates",
  },
  {
    key: "weekly",
    title: "Weekly roundup",
    desc: "A curated weekly summary of what matters",
  },
  {
    key: "important",
    title: "Only important",
    desc: "Just notifications that need your action",
  },
];

export const DEFAULT_FREQ = "weekly";

export const CONTENT_SETTINGS = [
  "Dating & relationship content",
  "Mental health & wellbeing content",
  "Sexuality & identity exploration content",
];
