import { useContext } from "react";
import {
  I18nContext,
  type TranslateInFunction,
} from "../../app/providers/i18nContext";
import type { Language, TFunction } from "./types";

export interface Translation {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Translate a key, with optional `{token}` interpolation + `count` plurals. */
  t: TFunction;
  /**
   * Translate a key in a given language regardless of the site language, or
   * `undefined` while that language's namespace loads or lacks the key.
   */
  translateIn: TranslateInFunction;
}

/**
 * Access the active language, the setter, and the translate function.
 *
 * The provider stores a `t` that already accepts `(key, options)`; the context's
 * historical `(key) => string` type is a compatible narrowing, so we surface the
 * richer {@link TFunction} here without churning the context module.
 */
export function useTranslation(): Translation {
  const context = useContext(I18nContext);
  if (!context)
    throw new Error("useTranslation must be used within an I18nProvider");
  return context;
}
