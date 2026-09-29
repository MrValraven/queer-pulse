import { createContext } from "react";
import type {
  Language,
  TFunction,
  TranslateOptions,
} from "../../shared/i18n/types";

/**
 * Translate a key in a named language, independent of the site language.
 * Returns `undefined` while that language's namespace is still loading (the
 * call queues the fetch, and its arrival re-renders consumers) or when the key
 * is absent there, so the caller supplies its own fallback. It never borrows
 * English and never returns the raw key.
 */
export type TranslateInFunction = (
  language: Language,
  key: string,
  options?: TranslateOptions,
) => string | undefined;

export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /**
   * Translate a catalog key, falling back to the key when missing. This is the
   * full {@link TFunction} the provider supplies; it also accepts the optional
   * `{token}`/`count` options object, so consumers can pass interpolation.
   */
  t: TFunction;
  /** Translate a key in a specific language; see {@link TranslateInFunction}. */
  translateIn: TranslateInFunction;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
