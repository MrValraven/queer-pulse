import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'qp_logged_in'

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
