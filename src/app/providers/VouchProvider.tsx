import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { VouchMemberModal } from '../../features/members/VouchMemberModal'

interface VouchContextValue {
  /** Has the current user already vouched for this member slug? */
  hasVouched: (slug: string) => boolean
  /** Open the vouch modal addressed to a member slug. */
  openVouch: (slug: string) => void
  /** Record a vouch for a member slug (called by the modal on success). */
  addVouch: (slug: string) => void
}

const VouchContext = createContext<VouchContextValue | null>(null)
const STORAGE_KEY = 'qp.vouches.v1'

function readInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * App-wide store of which members the current user has publicly vouched for,
 * plus the host for the vouch modal. Persists to localStorage so a vouch stays
 * reflected on the member's profile (their "Vouched for by…" row gains your
 * face) across pages and reloads. Data is still mock; this only tracks which
 * mock slugs the user has co-signed.
 */
export function VouchProvider({ children }: { children: ReactNode }) {
  const [vouched, setVouched] = useState<string[]>(readInitial)
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vouched))
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [vouched])

  const openVouch = useCallback((slug: string) => setOpenSlug(slug), [])
  const close = useCallback(() => setOpenSlug(null), [])
  const addVouch = useCallback((slug: string) => {
    setVouched((prev) => (prev.includes(slug) ? prev : [slug, ...prev]))
  }, [])

  const value = useMemo<VouchContextValue>(
    () => ({
      hasVouched: (slug) => vouched.includes(slug),
      openVouch,
      addVouch,
    }),
    [vouched, openVouch, addVouch],
  )

  return (
    <VouchContext.Provider value={value}>
      {children}
      {openSlug && (
        <VouchMemberModal
          slug={openSlug}
          onClose={close}
          onVouched={() => addVouch(openSlug)}
        />
      )}
    </VouchContext.Provider>
  )
}

export function useVouch() {
  const ctx = useContext(VouchContext)
  if (!ctx) {
    throw new Error('useVouch must be used within VouchProvider')
  }
  return ctx
}
