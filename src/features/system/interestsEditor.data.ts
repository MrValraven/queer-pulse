/**
 * i18n Pattern A. Chip labels are chrome, so the data holds a stable `id` (used
 * for selection state and defaults) plus a `labelKey` the component resolves
 * with `t()` — the `id` never changes with locale, unlike the old English
 * label strings that used to double as both the displayed text and the
 * selection key (which would have silently broken selection matching once the
 * displayed label was translated).
 */
export interface InterestOption {
  id: string;
  labelKey: string;
}

/** Interest chips offered in the pending-review interests editor. */
export const INTEREST_OPTIONS: InterestOption[] = [
  { id: "filmCinema", labelKey: "system:interestsEditor.options.filmCinema" },
  {
    id: "readingGroups",
    labelKey: "system:interestsEditor.options.readingGroups",
  },
  { id: "mutualAid", labelKey: "system:interestsEditor.options.mutualAid" },
  { id: "activism", labelKey: "system:interestsEditor.options.activism" },
  { id: "nightlife", labelKey: "system:interestsEditor.options.nightlife" },
  {
    id: "transHealthcare",
    labelKey: "system:interestsEditor.options.transHealthcare",
  },
  {
    id: "migrationVisas",
    labelKey: "system:interestsEditor.options.migrationVisas",
  },
  { id: "housing", labelKey: "system:interestsEditor.options.housing" },
  { id: "mentorship", labelKey: "system:interestsEditor.options.mentorship" },
  {
    id: "musicStudio",
    labelKey: "system:interestsEditor.options.musicStudio",
  },
  {
    id: "soberSpaces",
    labelKey: "system:interestsEditor.options.soberSpaces",
  },
  {
    id: "parentingFamily",
    labelKey: "system:interestsEditor.options.parentingFamily",
  },
  { id: "sports", labelKey: "system:interestsEditor.options.sports" },
  { id: "artMaking", labelKey: "system:interestsEditor.options.artMaking" },
  { id: "techWork", labelKey: "system:interestsEditor.options.techWork" },
  { id: "wellbeing", labelKey: "system:interestsEditor.options.wellbeing" },
];

/** Interest ids pre-selected for the member when the editor opens. */
export const DEFAULT_INTERESTS: string[] = [
  "filmCinema",
  "mutualAid",
  "readingGroups",
];
