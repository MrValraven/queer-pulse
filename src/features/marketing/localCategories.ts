/* ===========================================================
   Unified directory categories — ids, folds and labels.

   Deliberately a LEAF module: it imports nothing but the `TFunction` type.
   `listBusiness.data.ts` needs the category ids, and `directoryPlaces.ts`
   needs `listBusiness.data.ts` at module-init time (its demo rows call
   `normalizeHours`), so pulling these out of `localPlaces.ts` — which imports
   `directoryPlaces` — is what keeps that from closing into an import cycle.
   Nothing here may grow a runtime import back into the directory modules.
   =========================================================== */

import type { TFunction } from "../../shared/i18n/types";

/** Venue `type` → unified category id (folds bar/club/sauna into "nightlife"). */
export const VENUE_TYPE_TO_CATEGORY: Record<string, string> = {
  café: "food",
  clinic: "health",
  gym: "fitness",
  barbershop: "grooming",
  bookshop: "culture",
  "community space": "space",
  bar: "nightlife",
  club: "nightlife",
  sauna: "nightlife",
};

/** Unified category ids, in chip order. "nightlife" is new; the rest mirror the directory. */
export const LOCAL_CATEGORIES = [
  "food",
  "design",
  "health",
  "space",
  "culture",
  "tech",
  "grooming",
  "fitness",
  "nightlife",
] as const;

/**
 * The categories an ONLINE-ONLY listing picks from, in chip order. Mirrors the
 * backend's `ONLINE_LISTING_CATEGORY_SLUGS`, which checks a listing's
 * categories against the set that matches its `online` flag. `food` is the
 * one slug both sets share: an online roaster, a bakery that delivers.
 */
export const ONLINE_LISTING_CATEGORY_SLUGS = [
  "apparel",
  "handmade",
  "books-music",
  "food",
  "body-care",
  "therapy",
  "classes",
  "services",
  "digital",
  "intimacy",
] as const;

export type OnlineListingCategory =
  (typeof ONLINE_LISTING_CATEGORY_SLUGS)[number];

/** The 18+ category. Online only, behind an acknowledgement in the form, and
 *  left out of every public read by the backend. */
export const ADULT_LISTING_CATEGORY_SLUG = "intimacy";

/** Every category id the directory knows, place ids first, each once. */
export const DIRECTORY_CATEGORY_IDS: readonly string[] = [
  ...LOCAL_CATEGORIES,
  ...ONLINE_LISTING_CATEGORY_SLUGS.filter(
    (slug) => !(LOCAL_CATEGORIES as readonly string[]).includes(slug),
  ),
];

/** The categories a listing of this kind picks from. */
export function listingCategoriesFor(isOnline: boolean): readonly string[] {
  return isOnline ? ONLINE_LISTING_CATEGORY_SLUGS : LOCAL_CATEGORIES;
}

/** True when the picked categories include the 18+ one. */
export function isAdultCategoryPicked(cats: readonly string[]): boolean {
  return cats.includes(ADULT_LISTING_CATEGORY_SLUG);
}

/**
 * The online category a place category reads as, where the two vocabularies
 * meet: the Online tab's chips (which also match places that sell online) and
 * the session and registration questions a place that sells online is asked.
 * The same pairs as the 2026-10-07 data migration; `space` and `nightlife`
 * have no online counterpart.
 */
export const ONLINE_CATEGORY_FOR_PLACE_CATEGORY: Readonly<
  Record<string, string>
> = {
  food: "food",
  design: "handmade",
  culture: "books-music",
  health: "therapy",
  tech: "digital",
  grooming: "body-care",
  fitness: "classes",
};

/** A category id as the online vocabulary reads it. */
export function asOnlineCategory(category: string): string {
  const slug = normalizeCategory(category);
  return ONLINE_CATEGORY_FOR_PLACE_CATEGORY[slug] ?? slug;
}

/**
 * The place category an online category reads as: the same pairs turned
 * around, so the List tab's place chips also find the online-only listings
 * filed under their online counterpart (`handmade` sits under Design).
 * `apparel`, `services` and `intimacy` have no place counterpart.
 */
export const PLACE_CATEGORY_FOR_ONLINE_CATEGORY: Readonly<
  Record<string, string>
> = Object.fromEntries(
  Object.entries(ONLINE_CATEGORY_FOR_PLACE_CATEGORY).map(
    ([placeCategory, onlineCategory]) => [onlineCategory, placeCategory],
  ),
);

/** A category id as the place vocabulary reads it. */
export function asPlaceCategory(category: string): string {
  const slug = normalizeCategory(category);
  return PLACE_CATEGORY_FOR_ONLINE_CATEGORY[slug] ?? slug;
}

/**
 * Legacy wizard display strings → canonical slug. Early listings stored the
 * visible label ("Food & drink") as the category, which matches no map/filter
 * slug and paints a black pin. This heals those rows at read time so no DB
 * migration is needed; new places are written as slugs directly.
 */
const CATEGORY_LABEL_TO_SLUG: Record<string, string> = {
  "food & drink": "food",
  "design & craft": "design",
  "health & care": "health",
  spaces: "space",
  culture: "culture",
  tech: "tech",
  "barbershop & salon": "grooming",
  "gym & fitness": "fitness",
  nightlife: "nightlife",
};

const CANONICAL_CATEGORIES: ReadonlySet<string> = new Set(
  DIRECTORY_CATEGORY_IDS,
);

/**
 * Canonicalize any category token to a unified slug. Accepts already-canonical
 * slugs (pass through), the legacy wizard display strings, and folded venue
 * types. Unknown values return unchanged so the `var(--ink)` pin fallback still
 * guards genuinely unmapped data.
 */
export function normalizeCategory(value: string): string {
  if (!value) return value;
  if (CANONICAL_CATEGORIES.has(value)) return value;
  const key = value.trim().toLowerCase();
  return CATEGORY_LABEL_TO_SLUG[key] ?? VENUE_TYPE_TO_CATEGORY[key] ?? value;
}

/** Category id to i18n label key, place and online. */
export const LOCAL_CATEGORY_LABEL_KEYS: Record<string, string> = {
  food: "marketing:directory.cat.food",
  design: "marketing:directory.cat.design",
  health: "marketing:directory.cat.health",
  space: "marketing:directory.cat.space",
  culture: "marketing:directory.cat.culture",
  tech: "marketing:directory.cat.tech",
  grooming: "marketing:directory.cat.grooming",
  fitness: "marketing:directory.cat.fitness",
  nightlife: "marketing:local.cat.nightlife",
  apparel: "marketing:directory.cat.apparel",
  handmade: "marketing:directory.cat.handmade",
  "books-music": "marketing:directory.cat.booksMusic",
  "body-care": "marketing:directory.cat.bodyCare",
  therapy: "marketing:directory.cat.therapy",
  classes: "marketing:directory.cat.classes",
  services: "marketing:directory.cat.services",
  digital: "marketing:directory.cat.digital",
  intimacy: "marketing:directory.cat.intimacy",
};

/**
 * The one way to render a category label. Canonicalizes the token first, so it
 * resolves both unified slugs and any legacy display-string value; falls back
 * to the raw value for genuinely unknown tokens.
 */
export function categoryLabel(t: TFunction, category: string): string {
  const slug = normalizeCategory(category);
  const key = LOCAL_CATEGORY_LABEL_KEYS[slug];
  return key ? t(key) : category;
}
