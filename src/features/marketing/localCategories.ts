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

const CANONICAL_CATEGORIES: ReadonlySet<string> = new Set(LOCAL_CATEGORIES);

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

/** Unified category id → i18n label key. "nightlife" is the only new key. */
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
