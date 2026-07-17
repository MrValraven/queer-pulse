import { createContext, useContext } from "react";
import type {
  AuthUser,
  MemberRole,
  MemberStatus,
} from "../../features/auth/api/auth.api";

/**
 * A session-load failure, as a stable code + data rather than a pre-rendered
 * message — `AuthProvider` sits above `I18nProvider` in the provider tree, so
 * it cannot call `t()` itself. `AuthErrorToast` (below `I18nProvider`)
 * resolves this into the active language via `shared:auth.error.*`.
 */
export type AuthErrorCode =
  { kind: "server"; status: number } | { kind: "network" };

export interface AuthContextValue {
  loggedIn: boolean;
  /**
   * True while the live-mode session is still being determined (GET /auth/me in
   * flight). During this window `loggedIn` is not yet trustworthy, so gated
   * routes should hold on a loader rather than decide, and authed data fetches
   * should stay parked. Always false in demo mode (the session is synchronous).
   */
  checking: boolean;
  /** True while the post-login "preparing the room" loader should be shown. */
  preparing: boolean;
  /** The signed-in user (live mode) or the mock user (demo mode); null when logged out. */
  user: AuthUser | null;
  status: MemberStatus | null;
  role: MemberRole | null;
  /**
   * Set when loading the session (`GET /auth/me`) failed for a *server* reason
   * (5xx / network) rather than the member simply being signed out (401). The
   * UI surfaces this so a backend fault isn't silently mistaken for logged-out.
   */
  authError: AuthErrorCode | null;
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
