import { useEffect, useState } from "react";
import { loadNamespace } from "../../shared/i18n/catalogs";
import type { Catalog, Language } from "../../shared/i18n/types";

/**
 * The `subprofiles` catalog of the language the owner is NOT using, so a
 * `multiSelect` can recognise text saved in either language ("English" in a
 * Portuguese session). `loadNamespace` fetches the namespace's own chunk once
 * and caches the promise across callers. `null` until it resolves, and for
 * good if it fails: matching then uses the current language alone.
 */
export function useOtherLanguageCatalog(language: Language): Catalog | null {
  const otherLanguage: Language = language === "en" ? "pt" : "en";
  const [loaded, setLoaded] = useState<{
    language: Language;
    catalog: Catalog;
  } | null>(null);

  useEffect(() => {
    let isCurrent = true;
    loadNamespace(otherLanguage, "subprofiles").then(
      (catalog) => {
        if (isCurrent) setLoaded({ language: otherLanguage, catalog });
      },
      () => undefined,
    );
    return () => {
      isCurrent = false;
    };
  }, [otherLanguage]);

  return loaded?.language === otherLanguage ? loaded.catalog : null;
}
