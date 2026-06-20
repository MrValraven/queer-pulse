import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface AuthContextValue {
  loggedIn: boolean
  /** True while the post-login "preparing the room" loader should be shown. */
  preparing: boolean
  signIn: () => void
  signOut: () => void
  /** Called by the loader once its sequence completes, to dismiss it. */
  endPreparing: () => void
}

const STORAGE_KEY = 'qp_logged_in'

const AuthContext = createContext<AuthContextValue | null>(null)

function getInitialLoggedIn(): boolean {
  if (typeof window === 'undefined') return true
  // Prototype default: signed in. Only an explicit sign-out is remembered.
  return window.localStorage.getItem(STORAGE_KEY) !== 'false'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean>(getInitialLoggedIn)
  const [preparing, setPreparing] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, loggedIn ? 'true' : 'false')
  }, [loggedIn])

  const signIn = useCallback(() => {
    setLoggedIn(true)
    // Show the "preparing the room" loader on an explicit sign-in.
    setPreparing(true)
  }, [])
  const signOut = useCallback(() => {
    setLoggedIn(false)
    setPreparing(false)
  }, [])
  const endPreparing = useCallback(() => setPreparing(false), [])

  const value = useMemo(
    () => ({ loggedIn, preparing, signIn, signOut, endPreparing }),
    [loggedIn, preparing, signIn, signOut, endPreparing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
