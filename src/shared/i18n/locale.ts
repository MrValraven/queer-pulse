import { safeStorage } from "../storage/safeStorage";
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
  // Guarded reads: this runs inside a render-phase state initializer in
  // `I18nProvider`, which sits ABOVE the app ErrorBoundary. A raw
  // `localStorage.getItem` throws `SecurityError` where site data is blocked
  // (Safari "block all cookies", enterprise policy, some sandboxes), and that
  // throw white-screens the whole app before anything can catch it.
  const stored =
    safeStorage.get(STORAGE_KEY) ?? safeStorage.get(LEGACY_STORAGE_KEY);
  if (isLanguage(stored)) return stored;
  const navLang = window.navigator?.language?.toLowerCase() ?? "";
  if (navLang.startsWith("pt")) return "pt";
  return "en";
}

/** Map our short language id onto the BCP-47 locale used by `Intl.*`. */
export function intlLocale(language: Language): string {
  return language === "pt" ? "pt-PT" : "en";
}

/**
 * The active BCP-47 locale for `Intl.*`, resolved *outside* React from the same
 * persisted language the `I18nProvider` writes on every change (see
 * `STORAGE_KEY`). Lets non-React formatting sites — message-timestamp adapters,
 * socket cache patches — format in the app's active language instead of the
 * device locale (`toLocale*(undefined, …)`), which is otherwise unreachable
 * without threading the language through every react-query hook. Detection order
 * matches `detectLanguage()`, so it agrees with the provider's own initial state.
 */
export function activeLocale(): string {
  return intlLocale(detectLanguage());
}
