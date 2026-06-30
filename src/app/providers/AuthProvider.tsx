import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { AUTH_STORAGE_KEY as STORAGE_KEY } from '../../features/marketing/cookies.data'
import { useDemoMode } from './DemoModeProvider'
import { setOnAuthLost } from '../../shared/api/client'
import {
  bootstrapCsrf,
  fetchMe,
  postLogout,
  postRefresh,
  redirectToGoogle,
  type AuthUser,
} from '../../features/auth/api/auth.api'
import { currentUser, currentUserSlug } from '../../features/members/data/members'

function getInitialLoggedIn(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(STORAGE_KEY) !== 'false'
}

/** The mock signed-in user used in demo mode (mirrors the prototype's currentUser). */
const DEMO_USER: AuthUser = {
  id: 'demo',
  email: 'you@queerpulse.test',
  status: 'active',
  role: 'member',
  profile: {
    slug: currentUserSlug,
    firstName: currentUser.first,
    lastName: currentUser.last,
    pronouns: currentUser.pronouns,
    avatarUrl: currentUser.photo ?? null,
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode()
  const [loggedIn, setLoggedIn] = useState<boolean>(getInitialLoggedIn)
  const [preparing, setPreparing] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Demo mode: mirror the prototype's localStorage-driven mock session.
  useEffect(() => {
    if (!demoMode) return
    setUser(loggedIn ? DEMO_USER : null)
  }, [demoMode, loggedIn])

  useEffect(() => {
    if (!demoMode) return
    window.localStorage.setItem(STORAGE_KEY, loggedIn ? 'true' : 'false')
  }, [demoMode, loggedIn])

  // Live mode: bootstrap CSRF, then load the current user from /auth/me.
  useEffect(() => {
    if (demoMode) return
    let active = true
    setOnAuthLost(() => {
      setUser(null)
      setLoggedIn(false)
    })
    bootstrapCsrf()
      .then(fetchMe)
      .then((u) => {
        if (!active) return
        setUser(u)
        setLoggedIn(true)
      })
      .catch(() => {
        if (!active) return
        setUser(null)
        setLoggedIn(false)
      })
    return () => {
      active = false
    }
  }, [demoMode])

  const signIn = useCallback((redirectTo?: string, invite?: string) => {
    if (demoMode) {
      setLoggedIn(true)
      setPreparing(true)
      return
    }
    redirectToGoogle(redirectTo, invite)
  }, [demoMode])

  const signOut = useCallback(() => {
    setPreparing(false)
    if (demoMode) {
      setLoggedIn(false)
      return
    }
    postLogout().finally(() => {
      setUser(null)
      setLoggedIn(false)
    })
  }, [demoMode])

  const endPreparing = useCallback(() => setPreparing(false), [])

  const refresh = useCallback(async () => {
    if (demoMode) return
    try {
      await postRefresh()
      const u = await fetchMe()
      setUser(u)
      setLoggedIn(true)
    } catch {
      setUser(null)
      setLoggedIn(false)
    }
  }, [demoMode])

  const value = useMemo(
    () => ({
      loggedIn,
      preparing,
      user,
      status: user?.status ?? null,
      role: user?.role ?? null,
      signIn,
      signOut,
      endPreparing,
      refresh,
    }),
    [loggedIn, preparing, user, signIn, signOut, endPreparing, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
