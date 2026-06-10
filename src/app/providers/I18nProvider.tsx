import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { en } from '../../shared/i18n/strings.en'
import { translate } from '../../shared/i18n/translate'
import type { Language, StringCatalog } from '../../shared/i18n/types'

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  /** Translate a catalog key, falling back to the key when missing. */
  t: (key: string) => string
}

const STORAGE_KEY = 'qp-lang'

/** EN is fully populated; PT is a structural placeholder for a future milestone. */
const catalogs: Record<Language, StringCatalog> = {
  en,
  pt: {},
}

export const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'pt' ? 'pt' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: Language) => setLanguageState(next), [])

  const t = useCallback(
    (key: string) => {
      // Fall back to the EN catalog when the active language lacks the key.
      const active = catalogs[language]
      return active[key] !== undefined ? translate(active, key) : translate(en, key)
    },
    [language],
  )

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
