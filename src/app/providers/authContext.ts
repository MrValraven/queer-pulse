import { createContext, useContext } from 'react'
import type { AuthUser, MemberRole, MemberStatus } from '../../features/auth/api/auth.api'

export interface AuthContextValue {
  loggedIn: boolean
  /** True while the post-login "preparing the room" loader should be shown. */
  preparing: boolean
  /** The signed-in user (live mode) or the mock user (demo mode); null when logged out. */
  user: AuthUser | null
  status: MemberStatus | null
  role: MemberRole | null
  signIn: () => void
  signOut: () => void
  /** Called by the loader once its sequence completes, to dismiss it. */
  endPreparing: () => void
  /** Re-run POST /auth/refresh + GET /auth/me (e.g. after a promotion). */
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
