import { createContext } from 'react'
import type { Language } from '../../shared/i18n/types'

export interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  /** Translate a catalog key, falling back to the key when missing. */
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
