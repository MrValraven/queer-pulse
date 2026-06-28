import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { type Draft } from '../../features/members/drafts.data'

interface DraftsContextValue {
  /** User-created drafts, newest first. Merged ahead of the static mock list. */
  drafts: Draft[]
  /** Add a draft (no-op if the id already exists). */
  addDraft: (draft: Draft) => void
  removeDraft: (id: string) => void
}

const DraftsContext = createContext<DraftsContextValue | null>(null)
const STORAGE_KEY = 'qp.drafts.v1'

function readInitial(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Draft[]) : []
  } catch {
    return []
  }
}

/**
 * App-wide store of drafts the user actually started elsewhere (e.g. saving an
 * invite as a draft) so they show up on the Drafts page. Persists to
 * localStorage. Stored drafts must use plain-string fields — the static mock
 * drafts use JSX, but anything persisted here has to be serialisable.
 */
export function DraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Draft[]>(readInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [drafts])

  const addDraft = useCallback((draft: Draft) => {
    setDrafts((prev) =>
      prev.some((d) => d.id === draft.id) ? prev : [draft, ...prev],
    )
  }, [])

  const removeDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const value = useMemo(
    () => ({ drafts, addDraft, removeDraft }),
    [drafts, addDraft, removeDraft],
  )

  return <DraftsContext.Provider value={value}>{children}</DraftsContext.Provider>
}

export function useDrafts() {
  const ctx = useContext(DraftsContext)
  if (!ctx) {
    throw new Error('useDrafts must be used within DraftsProvider')
  }
  return ctx
}
