import type { LocalActiveFilterCountFields } from "./localActiveFilterCount";
import {
  ADULT_LISTING_CATEGORY_SLUG,
  LOCAL_CATEGORIES,
  ONLINE_LISTING_CATEGORY_SLUGS,
} from "./localCategories";

/** The collapsible filter groups in the desktop sidebar of the Local
 *  directory. Order here is the render order in the sidebar. */
export type LocalFilterSectionKey =
  | "placeType"
  | "quick"
  | "ownedBy"
  | "entry"
  | "pay"
  | "languages"
  | "practices"
  | "access"
  | "more";

export const LOCAL_FILTER_SECTION_KEYS: LocalFilterSectionKey[] = [
  "placeType",
  "quick",
  "ownedBy",
  "entry",
  "pay",
  "languages",
  "practices",
  "access",
  "more",
];

/** Default view state: the place types and the one-tap narrowings start
 *  open, every other section starts collapsed. */
export const DEFAULT_OPEN_LOCAL_SECTIONS: Record<
  LocalFilterSectionKey,
  boolean
> = {
  placeType: true,
  quick: true,
  ownedBy: false,
  entry: false,
  pay: false,
  languages: false,
  practices: false,
  access: false,
  more: false,
};

/** Guard for the persisted open map: an object with a boolean for every key.
 *  A stored value missing a key (after this list changes, say) is rejected,
 *  so state falls back to the default. */
export function isLocalSectionOpenMap(
  value: unknown,
): value is Record<LocalFilterSectionKey, boolean> {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return LOCAL_FILTER_SECTION_KEYS.every(
    (key) => typeof record[key] === "boolean",
  );
}

/**
 * How many selections sit inside each section, for the badge on its header.
 * The parts add up to `countActiveLocalFilters` (the fact sections split
 * `countListingFactFilters` field by field), so the sidebar's badges and the
 * "Filters" toggle's badge always agree.
 */
export function countLocalSectionSelections({
  listingFacts,
  access,
  categories,
  safeOnly,
  owned,
  openNow,
  isOutAndAbout,
  isOnlineScope = false,
  isAdultShown,
}: LocalActiveFilterCountFields): Record<LocalFilterSectionKey, number> {
  return {
    placeType: categories.length,
    quick:
      (safeOnly ? 1 : 0) +
      (openNow ? 1 : 0) +
      (!isOnlineScope && isOutAndAbout ? 1 : 0) +
      (isOnlineScope && isAdultShown ? 1 : 0),
    ownedBy: owned.length,
    entry: listingFacts.entryMode ? 1 : 0,
    pay: listingFacts.payments.length,
    languages: listingFacts.languages.length,
    practices: listingFacts.practices.length,
    access: access.length,
    more: listingFacts.attributes.length,
  };
}

/** The category chips offered: what they sell on the Online tab (the 18+
 *  category only while it is shown), the place types everywhere else. */
export function localCategoryChipIds(
  isOnlineScope: boolean,
  isAdultShown: boolean | undefined,
): readonly string[] {
  if (!isOnlineScope) return LOCAL_CATEGORIES;
  return ONLINE_LISTING_CATEGORY_SLUGS.filter(
    (slug) => slug !== ADULT_LISTING_CATEGORY_SLUG || isAdultShown,
  );
}
