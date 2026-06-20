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
  signIn: () => void
  signOut: () => void
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

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, loggedIn ? 'true' : 'false')
  }, [loggedIn])

  const signIn = useCallback(() => setLoggedIn(true), [])
  const signOut = useCallback(() => setLoggedIn(false), [])

  const value = useMemo(() => ({ loggedIn, signIn, signOut }), [loggedIn, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
