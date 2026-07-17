import { type Tint } from "./directoryPlaces";

/** i18n Pattern A — resolved via `t()` by DirectorySpaceMain.tsx and DirectoryPage.tsx. */
export const CAT_LABEL_KEYS: Record<string, string> = {
  food: "marketing:directory.cat.food",
  design: "marketing:directory.cat.design",
  health: "marketing:directory.cat.health",
  space: "marketing:directory.cat.space",
  culture: "marketing:directory.cat.culture",
  tech: "marketing:directory.cat.tech",
  grooming: "marketing:directory.cat.grooming",
  fitness: "marketing:directory.cat.fitness",
};

/**
 * "Members here lately" is mock activity content, but `whenKey` (relative
 * time chrome) resolves via `t()` — the member names/initials stay as-is.
 */
export const MEMBERS_HERE: {
  initials: string;
  name: string;
  tint: Tint;
  whenKey: string;
}[] = [
  {
    initials: "RV",
    name: "Rita V.",
    tint: "jade",
    whenKey: "marketing:directory.relative.yesterday",
  },
  {
    initials: "AK",
    name: "Anika K.",
    tint: "coral",
    whenKey: "marketing:directory.relative.twoDaysAgo",
  },
  {
    initials: "NA",
    name: "Nuno A.",
    tint: "plum",
    whenKey: "marketing:directory.relative.threeDaysAgo",
  },
  {
    initials: "SC",
    name: "Sofia C.",
    tint: "coral",
    whenKey: "marketing:directory.relative.lastWeek",
  },
];

export const STAR_SLOTS = [1, 2, 3, 4, 5];
