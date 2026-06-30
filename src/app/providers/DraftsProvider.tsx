import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { type Draft } from '../../features/members/drafts.data'
import { useLocalStorage } from '../../shared/hooks'

interface DraftsContextValue {
  /** User-created drafts, newest first. Merged ahead of the static mock list. */
  drafts: Draft[]
  /** Add a draft (no-op if the id already exists). */
  addDraft: (draft: Draft) => void
  removeDraft: (id: string) => void
}

const DraftsContext = createContext<DraftsContextValue | null>(null)
const STORAGE_KEY = 'qp.drafts.v1'

/**
 * App-wide store of drafts the user actually started elsewhere (e.g. saving an
 * invite as a draft) so they show up on the Drafts page. Persists to
 * localStorage. Stored drafts must use plain-string fields — the static mock
 * drafts use JSX, but anything persisted here has to be serialisable.
 */
export function DraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useLocalStorage<Draft[]>(
    STORAGE_KEY,
    [],
    (v): v is Draft[] => Array.isArray(v),
  )

  const addDraft = useCallback((draft: Draft) => {
    setDrafts((prev) =>
      prev.some((d) => d.id === draft.id) ? prev : [draft, ...prev],
    )
  }, [setDrafts])

  const removeDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }, [setDrafts])

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
