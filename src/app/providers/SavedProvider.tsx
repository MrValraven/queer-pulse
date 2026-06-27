import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type SavedKind = 'article' | 'film' | 'job' | 'post' | 'event' | 'group'

export interface SavedItem {
  /** Stable unique id, conventionally `${kind}:${slug}`. */
  id: string
  kind: SavedKind
  title: string
  /** Original design href or router path; pass through linkToPath() when rendering. */
  href?: string
  /** Small supporting line (author, org, neighbourhood…). */
  meta?: string
}

interface SavedContextValue {
  items: SavedItem[]
  isSaved: (id: string) => boolean
  /** Toggle an item; returns the new saved state (true = now saved). */
  toggleSave: (item: SavedItem) => boolean
  save: (item: SavedItem) => void
  unsave: (id: string) => void
  byKind: (kind: SavedKind) => SavedItem[]
}

const SavedContext = createContext<SavedContextValue | null>(null)
const STORAGE_KEY = 'qp.saved.v1'

function readInitial(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedItem[]) : []
  } catch {
    return []
  }
}

/**
 * App-wide store of "saved" things (articles, films, jobs, posts…). Persists to
 * localStorage so the Collections page and every save toggle stay in sync. The
 * data itself is still mock — this only tracks which mock items the user kept.
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>(readInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [items])

  const isSaved = useCallback(
    (id: string) => items.some((it) => it.id === id),
    [items],
  )

  const save = useCallback((item: SavedItem) => {
    setItems((prev) =>
      prev.some((it) => it.id === item.id) ? prev : [item, ...prev],
    )
  }, [])

  const unsave = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const toggleSave = useCallback((item: SavedItem) => {
    let nowSaved = false
    setItems((prev) => {
      if (prev.some((it) => it.id === item.id)) {
        nowSaved = false
        return prev.filter((it) => it.id !== item.id)
      }
      nowSaved = true
      return [item, ...prev]
    })
    return nowSaved
  }, [])

  const byKind = useCallback(
    (kind: SavedKind) => items.filter((it) => it.kind === kind),
    [items],
  )

  const value = useMemo(
    () => ({ items, isSaved, toggleSave, save, unsave, byKind }),
    [items, isSaved, toggleSave, save, unsave, byKind],
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) {
    throw new Error('useSaved must be used within SavedProvider')
  }
  return ctx
}
