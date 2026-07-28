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
  loadPtNamespace,
  ptNamespaceLoaders,
} from "../../shared/i18n/catalogs";
import { parseKey, resolveEntry } from "../../shared/i18n/translate";
import {
  STORAGE_KEY,
  detectLanguage,
  intlLocale,
} from "../../shared/i18n/locale";
import type {
  Catalog,
  Language,
  Namespace,
  TFunction,
  TranslateOptions,
} from "../../shared/i18n/types";
import { logWarn } from "../../shared/observability/logger";
import { I18nContext } from "./i18nContext";

/** True when this PT namespace ships as its own on-demand chunk. */
function isLazyPtNamespace(namespace: Namespace): boolean {
  return ptNamespaceLoaders[namespace] !== undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  // Portuguese namespaces load lazily; the resolved catalogs live here so that
  // resolving one bumps a real dependency of `t` and re-renders consumers with
  // the now-available strings.
  const [loadedPtNamespaces, setLoadedPtNamespaces] = useState<
    Partial<Record<Namespace, Catalog>>
  >({});

  // Namespaces requested during render but not yet fetched. `t` runs mid-render
  // (in consumers), so it can only queue work here; the effect below drains the
  // queue after commit, where kicking off imports is safe. `requestedRef`
  // dedupes so a namespace is fetched at most once regardless of re-renders.
  const pendingPtNamespaces = useRef<Set<Namespace>>(new Set());
  const requestedPtNamespaces = useRef<Set<Namespace>>(new Set());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(
    (next: Language) => setLanguageState(next),
    [],
  );

  const t = useCallback<TFunction>(
    (key: string, options?: TranslateOptions) => {
      const { namespace, path } = parseKey(key);
      const ns = namespace as Namespace;

      // Resolve against the active language first. For a lazy PT namespace,
      // prefer its loaded catalog; queue the fetch if it hasn't arrived yet.
      let activeCatalog: Catalog | undefined;
      if (language === "pt" && isLazyPtNamespace(ns)) {
        activeCatalog = loadedPtNamespaces[ns];
        if (activeCatalog === undefined && !requestedPtNamespaces.current.has(ns)) {
          requestedPtNamespaces.current.add(ns);
          pendingPtNamespaces.current.add(ns);
        }
      } else {
        activeCatalog = catalogs[language][ns];
      }

      const active = resolveEntry(
        activeCatalog,
        path,
        intlLocale(language),
        options,
      );
      if (active !== undefined) return active;

      // EN is always bundled, so this fallback resolves for any real key even
      // while a PT chunk is still in flight — the UI shows English, never the
      // raw key.
      const fallback = resolveEntry(catalogs.en[ns], path, "en", options);
      if (fallback !== undefined) return fallback;

      logWarn("i18n: missing translation key", { key, language });
      return key;
    },
    [language, loadedPtNamespaces],
  );

  // Drain the fetch queue after every commit. Namespaces queued by `t` during
  // this render are fetched here; each resolution records the catalog, which
  // re-renders consumers with the Portuguese strings.
  useEffect(() => {
    if (pendingPtNamespaces.current.size === 0) return;
    const toLoad = [...pendingPtNamespaces.current];
    pendingPtNamespaces.current.clear();
    for (const namespace of toLoad) {
      loadPtNamespace(namespace)
        .then((catalog) =>
          setLoadedPtNamespaces((previous) =>
            previous[namespace] === catalog
              ? previous
              : { ...previous, [namespace]: catalog },
          ),
        )
        .catch((error) => {
          requestedPtNamespaces.current.delete(namespace);
          logWarn("i18n: failed to load namespace", { namespace, error });
        });
    }
  });

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
