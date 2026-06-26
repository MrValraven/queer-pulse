import { createContext, useContext } from 'react'

export interface AuthContextValue {
  loggedIn: boolean
  /** True while the post-login "preparing the room" loader should be shown. */
  preparing: boolean
  signIn: () => void
  signOut: () => void
  /** Called by the loader once its sequence completes, to dismiss it. */
  endPreparing: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
