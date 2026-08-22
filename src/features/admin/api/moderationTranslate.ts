import { loadNamespace } from "../../../shared/i18n/catalogs";
import { intlLocale } from "../../../shared/i18n/locale";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  Namespace,
  TFunction,
} from "../../../shared/i18n/types";

/**
 * A `translate` bound to the *resolved* catalogs an adapter needs, with EN as
 * the universal fallback. Generalizes `useAdminCommunities`'s original
 * admin-only `loadAdminTranslate` to several namespaces, because the
 * moderation adapters resolve a report's reason label out of `safety` and
 * everything else out of `admin`.
 *
 * Why not the provider's `t`: the adapters run inside a react-query `queryFn`,
 * and the provider resolves lazy namespaces out of React state that only fills
 * in AFTER a post-commit effect loads the chunk. A `queryFn` mapping DTOs can
 * win that race and bake raw `admin:…` / `safety:…` keys into the cached,
 * adapted rows, which then never re-map because the query key hasn't changed.
 * `safety` is especially exposed: no admin route loads it for any other
 * reason, so it is essentially never warm when the moderation queue resolves.
 * Awaiting the catalogs here makes the adaptation deterministic. Callers keep
 * `language` in the query key, so a switch refetches and rebuilds this.
 */
export async function loadCatalogTranslate(
  language: Language,
  namespaces: readonly Namespace[],
): Promise<TFunction> {
  const locale = intlLocale(language);
  const loaded = await Promise.all(
    namespaces.map(async (namespace) => {
      const [activeCatalog, englishCatalog] = await Promise.all([
        loadNamespace(language, namespace),
        language === "en"
          ? Promise.resolve(undefined)
          : loadNamespace("en", namespace),
      ]);
      return [namespace, { activeCatalog, englishCatalog }] as const;
    }),
  );
  const byNamespace = new Map<
    string,
    { activeCatalog: Catalog; englishCatalog: Catalog | undefined }
  >(loaded);

  return (key, options) => {
    const { namespace, path } = parseKey(key);
    const entry = byNamespace.get(namespace);
    if (!entry) return key;
    const active = resolveEntry(entry.activeCatalog, path, locale, options);
    if (active !== undefined) return active;
    const fallback = entry.englishCatalog
      ? resolveEntry(entry.englishCatalog, path, "en", options)
      : undefined;
    return fallback ?? key;
  };
}

/** The namespaces every moderation/community-queue adapter resolves against:
 *  `admin` for the chrome this client authors, `safety` for the shared report
 *  reason taxonomy (`REASON_LABEL_KEYS`). */
export const MODERATION_NAMESPACES: readonly Namespace[] = ["admin", "safety"];

/** `loadCatalogTranslate` pre-bound to the moderation namespaces. */
export function loadModerationTranslate(
  language: Language,
): Promise<TFunction> {
  return loadCatalogTranslate(language, MODERATION_NAMESPACES);
}
