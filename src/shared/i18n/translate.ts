import type { StringCatalog } from "./types";

/**
 * Resolve a string key against a catalog. Falls back to the key itself when
 * missing so the UI degrades gracefully (and missing keys are visible).
 * Pure and side-effect free — unit tested.
 */
export function translate(catalog: StringCatalog, key: string): string {
  return catalog[key] ?? key;
}
