import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  catalogs,
  enNamespaceLoaders,
  isLazyNamespace,
  loadNamespace,
} from "../../shared/i18n/catalogs";
import { parseKey, resolveEntry } from "../../shared/i18n/translate";
import {
  STORAGE_KEY,
  detectLanguage,
  intlLocale,
} from "../../shared/i18n/locale";
import { safeStorage } from "../../shared/storage/safeStorage";
import { writePushLang } from "../../pushLang";
import {
  LANGUAGES,
  type Catalog,
  type Language,
  type Namespace,
  type TFunction,
  type TranslateOptions,
} from "../../shared/i18n/types";
import { logWarn } from "../../shared/observability/logger";
import { I18nContext } from "./i18nContext";

const EMPTY_LOADED_NAMESPACES: Partial<Record<Namespace, Catalog>> = {};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  // Non-shell namespaces load lazily for BOTH languages now (EN mirrors PT —
  // see catalogs/index.ts). The resolved catalogs live here, per language, so
  // resolving one bumps a real dependency of `t` and re-renders consumers with
  // the now-available strings.
  const [loadedNamespaces, setLoadedNamespaces] = useState<
    Record<Language, Partial<Record<Namespace, Catalog>>>
  >({ en: EMPTY_LOADED_NAMESPACES, pt: EMPTY_LOADED_NAMESPACES });

  // Namespaces requested during render but not yet fetched, keyed by language.
  // `t` runs mid-render (in consumers), so it can only queue work here; the
  // effect below drains the queue after commit, where kicking off imports is
  // safe. `requestedNamespaces` dedupes so a given language/namespace pair is
  // fetched at most once regardless of re-renders.
  const pendingNamespaces = useRef<Record<Language, Set<Namespace>>>({
    en: new Set(),
    pt: new Set(),
  });
  const requestedNamespaces = useRef<Record<Language, Set<Namespace>>>({
    en: new Set(),
    pt: new Set(),
  });

  useEffect(() => {
    safeStorage.set(STORAGE_KEY, language);
    document.documentElement.lang = language;
    // Mirror the active language into IndexedDB for the service worker's push
    // handler (see pushLang.ts) — runs on boot (initial state) and every
    // switch, same as the localStorage write above. Best-effort/fire-and-
    // forget: a failure here must never block rendering or the language
    // switch it's piggybacking on.
    void writePushLang(language);
  }, [language]);

  const setLanguage = useCallback(
    (next: Language) => setLanguageState(next),
    [],
  );

  /**
   * Resolve the currently-loaded catalog for `language`/`namespace` — the real
   * one if it's a shell namespace or has already loaded, `undefined` if it's
   * lazy and still pending. Queues a fetch for a still-pending namespace
   * (deduped) so the caller never has to remember to.
   */
  const catalogForQueueing = useCallback(
    (namespaceLanguage: Language, namespace: Namespace): Catalog | undefined => {
      if (!isLazyNamespace(namespaceLanguage, namespace)) {
        return catalogs[namespaceLanguage][namespace];
      }
      const loaded = loadedNamespaces[namespaceLanguage][namespace];
      if (loaded !== undefined) return loaded;
      if (!requestedNamespaces.current[namespaceLanguage].has(namespace)) {
        requestedNamespaces.current[namespaceLanguage].add(namespace);
        pendingNamespaces.current[namespaceLanguage].add(namespace);
      }
      return undefined;
    },
    [loadedNamespaces],
  );

  const t = useCallback<TFunction>(
    (key: string, options?: TranslateOptions) => {
      const { namespace, path } = parseKey(key);
      const ns = namespace as Namespace;

      // Resolve against the active language first, queueing its chunk if it
      // hasn't arrived yet.
      const activeCatalog = catalogForQueueing(language, ns);
      const active = resolveEntry(
        activeCatalog,
        path,
        intlLocale(language),
        options,
      );
      if (active !== undefined) return active;

      // EN is the universal fallback. Queue it too — this is the fix that
      // makes lazy EN safe: a PT (or any non-EN) miss now kicks off BOTH the
      // active namespace's fetch AND its EN fallback's fetch in the same
      // pass, instead of assuming EN is already synchronously bundled.
      const enCatalog =
        language === "en" ? activeCatalog : catalogForQueueing("en", ns);
      const fallback = resolveEntry(enCatalog, path, "en", options);
      if (fallback !== undefined) return fallback;

      logWarn("i18n: missing translation key", { key, language });
      return key;
    },
    [language, catalogForQueueing],
  );

  // Drain the fetch queue after every commit. Namespaces queued by `t` during
  // this render are fetched here; each resolution records the catalog, which
  // re-renders consumers with the now-available strings.
  useEffect(() => {
    for (const namespaceLanguage of LANGUAGES) {
      const queue = pendingNamespaces.current[namespaceLanguage];
      if (queue.size === 0) continue;
      const toLoad = [...queue];
      queue.clear();
      for (const namespace of toLoad) {
        loadNamespace(namespaceLanguage, namespace)
          .then((catalog) =>
            setLoadedNamespaces((previous) =>
              previous[namespaceLanguage][namespace] === catalog
                ? previous
                : {
                    ...previous,
                    [namespaceLanguage]: {
                      ...previous[namespaceLanguage],
                      [namespace]: catalog,
                    },
                  },
            ),
          )
          .catch((error) => {
            requestedNamespaces.current[namespaceLanguage].delete(namespace);
            logWarn("i18n: failed to load namespace", {
              namespace,
              language: namespaceLanguage,
              error,
            });
          });
      }
    }
  });

  // Background-prefetch every lazy EN namespace once, after first paint. EN is
  // the fallback for every key in every language, so warming it in idle time
  // (never blocking initial render — that's what keeps it out of the entry
  // chunk) means the common case is that EN is already resident by the time a
  // route actually needs it, closing the one-render raw-key-flash window the
  // `t()` queue-on-demand path alone would otherwise leave on a very first,
  // very fast navigation. `requestIdleCallback` isn't in Safari; the
  // `setTimeout` fallback still runs after the current paint.
  useEffect(() => {
    const scheduleIdle: (callback: () => void) => void =
      typeof window.requestIdleCallback === "function"
        ? (callback) => window.requestIdleCallback(callback)
        : (callback) => window.setTimeout(callback, 1);

    scheduleIdle(() => {
      for (const namespace of Object.keys(enNamespaceLoaders) as Namespace[]) {
        if (
          loadedNamespaces.en[namespace] !== undefined ||
          requestedNamespaces.current.en.has(namespace)
        ) {
          continue;
        }
        requestedNamespaces.current.en.add(namespace);
        loadNamespace("en", namespace)
          .then((catalog) =>
            setLoadedNamespaces((previous) =>
              previous.en[namespace] === catalog
                ? previous
                : { ...previous, en: { ...previous.en, [namespace]: catalog } },
            ),
          )
          .catch((error) => {
            requestedNamespaces.current.en.delete(namespace);
            logWarn("i18n: failed to prefetch EN namespace", {
              namespace,
              error,
            });
          });
      }
    });
    // Runs once per mount — this is a background warmup, not a per-render
    // effect; `loadedNamespaces`/`requestedNamespaces` are read for their
    // current values inside the idle callback, not tracked as dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
