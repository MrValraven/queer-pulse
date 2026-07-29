import { createContext } from "react";
import type { Language, TFunction } from "../../shared/i18n/types";

export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /**
   * Translate a catalog key, falling back to the key when missing. This is the
   * full {@link TFunction} the provider supplies — it also accepts the optional
   * `{token}`/`count` options object, so consumers can pass interpolation.
   */
  t: TFunction;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
