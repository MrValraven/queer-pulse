import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { catalogs } from "../../shared/i18n/catalogs";
import { parseKey, resolveEntry } from "../../shared/i18n/translate";
import {
  STORAGE_KEY,
  detectLanguage,
  intlLocale,
} from "../../shared/i18n/locale";
import type {
  Language,
  Namespace,
  TFunction,
  TranslateOptions,
} from "../../shared/i18n/types";
import { logWarn } from "../../shared/observability/logger";
import { I18nContext } from "./i18nContext";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

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

      // Active language first, then the EN catalog, then the raw key so missing
      // strings degrade visibly rather than blanking.
      const active = resolveEntry(
        catalogs[language][ns],
        path,
        intlLocale(language),
        options,
      );
      if (active !== undefined) return active;

      const fallback = resolveEntry(catalogs.en[ns], path, "en", options);
      if (fallback !== undefined) return fallback;

      logWarn("i18n: missing translation key", { key, language });
      return key;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
