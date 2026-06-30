import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiAvailable } from '../../shared/api/config'

interface DemoModeValue {
  /** When true, the app renders mock data and never hits the network. */
  demoMode: boolean
  /** False when no VITE_API_URL is set — the toggle is disabled and demo is forced. */
  available: boolean
  setDemoMode: (b: boolean) => void
  toggle: () => void
}

const DemoModeContext = createContext<DemoModeValue | null>(null)
const STORAGE_KEY = 'qp.demoMode.v1'

function readInitial(): boolean {
  if (!apiAvailable) return true // no backend configured → force demo
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false // default OFF = live API
  }
}

/**
 * Global demo-mode switch. Default OFF (live API). The "Populate platform" item
 * in the account menu flips it; ON makes auth + every data hook short-circuit to
 * the mock current user and mock `.data.ts` content. Forced ON (and locked) when
 * no VITE_API_URL is configured, so the app never hard-breaks without a backend.
 */
export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState<boolean>(readInitial)

  useEffect(() => {
    if (!apiAvailable) return
    try {
      window.localStorage.setItem(STORAGE_KEY, demoMode ? 'true' : 'false')
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [demoMode])

  const setDemoMode = useCallback((b: boolean) => {
    if (apiAvailable) setDemoModeState(b)
  }, [])

  const value = useMemo<DemoModeValue>(
    () => ({
      demoMode,
      available: apiAvailable,
      setDemoMode,
      toggle: () => setDemoMode(!demoMode),
    }),
    [demoMode, setDemoMode],
  )

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
}

export function useDemoMode(): DemoModeValue {
  const ctx = useContext(DemoModeContext)
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider')
  return ctx
}
