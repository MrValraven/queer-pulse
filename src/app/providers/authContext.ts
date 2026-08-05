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
 *
 * `expired` is an *involuntary* sign-out: a request 401'd and the token refresh
 * failed, so the session ended mid-visit. It's distinct from a user-initiated
 * logout (which raises no error) and from a plain not-signed-in 401 at boot.
 */
export type AuthErrorCode =
  | { kind: "server"; status: number }
  | { kind: "network" }
  | { kind: "expired" };

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
   * Additive staff-role grants (e.g. `magazine_editor`) held on top of `role` —
   * `[]` when logged out or when the signed-in user holds none. Read this via
   * `useMyStaffRoles`/`useHasStaffRole` (`features/auth/api/useMyStaffRoles.ts`)
   * rather than directly, since those also apply the demo-mode "grant everything"
   * override and the admin-superset rule.
   */
  staffRoles: string[];
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
   * backend redeems it during signup, and `ageAttested` when the member has
   * ticked the 18+ box — the backend rejects a NEW account without it. Demo mode
   * just flips local state and ignores all three arguments.
   */
  signIn: (
    redirectTo?: string,
    invite?: string,
    ageAttested?: boolean,
  ) => void;
  signOut: () => void;
  /** Called by the loader once its sequence completes, to dismiss it. */
  endPreparing: () => void;
  /** Re-run POST /auth/refresh + GET /auth/me (e.g. after a promotion). */
  refresh: () => Promise<void>;
  /**
   * Patch the cached user's `onboardedAt` in place after the member finishes the
   * onboarding wizard, so the one-time gate (`useAuthGateRedirect`) sees them as
   * onboarded for the rest of the session without waiting for a full `/auth/me`
   * refetch. Without this the wizard can replay in-session (e.g. browser autofill
   * of the saved `/auth/onboarding` URL) because the client cache is still stale.
   */
  markOnboarded: (onboardedAt: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
