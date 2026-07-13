import type { Catalog, TranslateOptions } from "./types";

const INTERPOLATION = /\{(\w+)\}/g;

/**
 * Split a `"namespace:path"` key. A key without a colon defaults to the
 * `common` namespace, so short shared keys stay ergonomic.
 */
export function parseKey(key: string): { namespace: string; path: string } {
  const colon = key.indexOf(":");
  if (colon === -1) return { namespace: "common", path: key };
  return { namespace: key.slice(0, colon), path: key.slice(colon + 1) };
}

/**
 * Replace `{token}` placeholders with values. Unknown tokens are left intact so
 * a wrong key is visible rather than silently blanked.
 */
export function interpolate(
  template: string,
  values?: TranslateOptions,
): string {
  if (!values) return template;
  return template.replace(INTERPOLATION, (match, token: string) => {
    const value = values[token];
    return value === undefined ? match : String(value);
  });
}

const pluralRulesCache = new Map<string, Intl.PluralRules>();

/**
 * The CLDR plural category for `count` in `locale` (e.g. pt-PT → `one`/`other`).
 * Cached because constructing `Intl.PluralRules` is comparatively expensive.
 */
export function pluralCategory(
  locale: string,
  count: number,
): Intl.LDMLPluralRule {
  let rules = pluralRulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRulesCache.set(locale, rules);
  }
  return rules.select(count);
}

/**
 * Resolve a single key against one namespace catalog.
 *
 * - With `options.count`, tries `path_<category>` then `path_other` (i18next-style
 *   plural suffixes selected via CLDR), so PT's own plural rules are honoured.
 * - Otherwise resolves `path` directly.
 * - Always runs `{token}` interpolation on the hit.
 *
 * Returns `undefined` when the key is absent, letting the caller fall back.
 */
export function resolveEntry(
  catalog: Catalog | undefined,
  path: string,
  locale: string,
  options?: TranslateOptions,
): string | undefined {
  if (!catalog) return undefined;

  if (options && typeof options.count === "number") {
    const category = pluralCategory(locale, options.count);
    const plural = catalog[`${path}_${category}`] ?? catalog[`${path}_other`];
    if (plural !== undefined) return interpolate(plural, options);
  }

  const value = catalog[path];
  return value === undefined ? undefined : interpolate(value, options);
}
