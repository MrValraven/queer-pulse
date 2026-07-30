import { type Tint } from "./directoryPlaces";

/* Category labels are now resolved through the single `categoryLabel` helper in
 * localPlaces.ts (slug-keyed `LOCAL_CATEGORY_LABEL_KEYS`), which normalizes
 * legacy display-string categories too. The former local `CAT_LABEL_KEYS`
 * duplicate lived here — removed to keep one source of truth. */

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
