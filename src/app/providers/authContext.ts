import { createContext, useContext } from "react";
import type {
  AuthUser,
  MemberRole,
  MemberStatus,
} from "../../features/auth/api/auth.api";

export interface AuthContextValue {
  loggedIn: boolean;
  /** True while the post-login "preparing the room" loader should be shown. */
  preparing: boolean;
  /** The signed-in user (live mode) or the mock user (demo mode); null when logged out. */
  user: AuthUser | null;
  status: MemberStatus | null;
  role: MemberRole | null;
  /**
   * Begin sign-in. In live mode this hands off to Google OAuth; pass
   * `redirectTo` to land there after login (the in-app `navigate` that follows
   * a `signIn()` call only takes effect in demo mode, since live mode leaves the
   * SPA entirely). Pass `invite` when registering off an invite link so the
   * backend redeems it during signup. Demo mode just flips local state and
   * ignores both arguments.
   */
  signIn: (redirectTo?: string, invite?: string) => void;
  signOut: () => void;
  /** Called by the loader once its sequence completes, to dismiss it. */
  endPreparing: () => void;
  /** Re-run POST /auth/refresh + GET /auth/me (e.g. after a promotion). */
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
