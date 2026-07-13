import type { Language } from "./types";

/**
 * localStorage key for the persisted language choice. The legacy key `qp-lang`
 * (used by earlier builds) is read as a one-time fallback so existing visitors
 * keep their choice across the rename.
 */
export const STORAGE_KEY = "qp.lang";
const LEGACY_STORAGE_KEY = "qp-lang";

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "pt";
}

/**
 * Detection order (spec 13): persisted choice → `navigator.language` (pt* → pt)
 * → English default. SSR-safe (returns `en` without a `window`).
 */
export function detectLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (isLanguage(stored)) return stored;
  const navLang = window.navigator?.language?.toLowerCase() ?? "";
  if (navLang.startsWith("pt")) return "pt";
  return "en";
}

/** Map our short language id onto the BCP-47 locale used by `Intl.*`. */
export function intlLocale(language: Language): string {
  return language === "pt" ? "pt-PT" : "en";
}
