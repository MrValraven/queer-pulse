import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthContext, type AuthErrorCode } from "./authContext";
import { useDemoMode } from "./DemoModeProvider";
import {
  ApiError,
  refreshSession,
  setSessionState,
} from "../../shared/api/client";
import { queryClient } from "../../shared/api/queryClient";
import {
  fetchMe,
  postLogout,
  redirectToGoogle,
  type AuthUser,
} from "../../features/auth/api/auth.api";
import {
  currentUser,
  currentUserSlug,
} from "../../features/members/data/demoCurrentUser";
import { getInitialDemoLoggedIn, useDemoSession } from "./useDemoSession";
import {
  useLiveSessionBootstrap,
  useReconcileSession,
} from "./useLiveSessionBootstrap";

/**
 * Live-mode sign-in leaves the SPA entirely (full-page redirect to Google, then
 * back via the backend callback), so the in-memory `preparing` flag set at the
 * moment of the click can't survive to the landing page. We stash a marker in
 * sessionStorage just before leaving and consume it once on the way back, so the
 * member lands on their feed behind the "preparing the room" loader rather than
 * the bare session-check spinner. sessionStorage (not localStorage) so it dies
 * with the tab and can never leak into an unrelated later visit.
 */
const PREPARING_KEY = "qp.auth.preparing";

function markSignInPending(): void {
  try {
    window.sessionStorage.setItem(PREPARING_KEY, "1");
  } catch {
    // Private-mode / blocked storage: we just skip the loader, not the sign-in.
  }
}

/** Read-and-clear the marker — returns true only for the first read after a redirect. */
function consumeSignInPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const pending = window.sessionStorage.getItem(PREPARING_KEY) === "1";
    if (pending) window.sessionStorage.removeItem(PREPARING_KEY);
    return pending;
  } catch {
    return false;
  }
}

/** The mock signed-in user used in demo mode (mirrors the prototype's currentUser). */
const DEMO_USER: AuthUser = {
  id: "demo",
  email: "you@queerpulse.test",
  status: "active",
  role: "member",
  // The demo account tier itself grants nothing here — `useMyStaffRoles`
  // grants ALL staff roles in demo mode directly off `demoMode`, not off this
  // field, so it stays an honest empty array.
  staffRoles: [],
  // A fixed adult mock — already attested so demo sessions never hit the age gate.
  ageAttestedAt: "2026-01-01T00:00:00.000Z",
  // A long-standing demo member — already onboarded. The gate still lets demo
  // sessions preview the wizard (it only bounces live members), so this just
  // keeps the mock's shape honest.
  onboardedAt: "2026-01-01T00:00:00.000Z",
  // The demo member is active, never suspended — so no expiry and no reason.
  suspendedUntil: null,
  suspension: null,
  profile: {
    slug: currentUserSlug,
    firstName: currentUser.first,
    lastName: currentUser.last,
    pronouns: currentUser.pronouns,
    avatarUrl: currentUser.photo ?? null,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  // Demo mode reads its mock session from localStorage synchronously. Live mode
  // can't — the session lives in an httpOnly cookie we can't see from JS — so we
  // must NOT optimistically claim "logged in" and let every data provider fire
  // authed requests that 401. Instead we start logged-out + `checking`, and only
  // trust `loggedIn` once GET /auth/me settles.
  const [loggedIn, setLoggedIn] = useState<boolean>(() =>
    demoMode ? getInitialDemoLoggedIn() : false,
  );
  const [checking, setChecking] = useState<boolean>(() => !demoMode);
  // True from the very first render when we've just come back from the OAuth
  // round trip, so the loader covers the whole `checking` window instead of
  // appearing after it.
  const [preparing, setPreparing] = useState(() =>
    demoMode ? false : consumeSignInPending(),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<AuthErrorCode | null>(null);
  // Whether this tab has ever confirmed a real session. A failed reconcile
  // only means "your session expired" if there was a session to lose — without
  // this, a never-signed-in visitor whose concurrent 401 (e.g. the consent or
  // nudges bootstrap calls) trips reconcileSession gets falsely told their
  // session "expired."
  const wasEverLoggedIn = useRef(false);
  // Handed to the session hooks as callbacks rather than as the ref itself:
  // a ref that crosses a hook boundary arrives there as a plain local
  // variable, which `react-hooks/immutability` refuses to see mutated after
  // render. Owned here, where it is provably a ref.
  const hasEverLoggedIn = useCallback(() => wasEverLoggedIn.current, []);
  const markEverLoggedIn = useCallback(() => {
    wasEverLoggedIn.current = true;
  }, []);

  const reconcileSession = useReconcileSession({
    hasEverLoggedIn,
    markEverLoggedIn,
    setUser,
    setLoggedIn,
    setAuthError,
  });

  // Demo mode's mock session (localStorage-driven, known synchronously) and the
  // live cookie session (CSRF bootstrap then GET /auth/me) each live in their
  // own hook, so this provider stays inside the 200-line component rule.
  useDemoSession({
    demoMode,
    loggedIn,
    demoUser: DEMO_USER,
    setChecking,
    setUser,
  });

  useLiveSessionBootstrap({
    demoMode,
    reconcileSession,
    markEverLoggedIn,
    setUser,
    setLoggedIn,
    setChecking,
    setPreparing,
    setAuthError,
  });

  const signIn = useCallback(
    (redirectTo?: string, invite?: string, ageAttested?: boolean) => {
      if (demoMode) {
        setLoggedIn(true);
        setPreparing(true);
        return;
      }
      markSignInPending();
      redirectToGoogle(redirectTo, invite, ageAttested);
    },
    [demoMode],
  );

  const signOut = useCallback(() => {
    setPreparing(false);
    if (demoMode) {
      setLoggedIn(false);
      return;
    }
    // Clear local session state FIRST, then fire the logout best-effort. Waiting
    // on the round trip meant a hung or slow backend left the member looking
    // signed in on a device they just asked to be signed out of.
    setSessionState("none");
    setUser(null);
    setLoggedIn(false);
    // Drop every authenticated query (conversations, messages, profile, blocks,
    // the Infinity-staleTime bootstrap) so a shared device cannot render the
    // previous member's data from cache after they sign out.
    queryClient.clear();
    void postLogout();
  }, [demoMode]);

  const endPreparing = useCallback(() => setPreparing(false), []);

  // Reflect a just-finished onboarding on the cached user, so the one-time gate
  // stops replaying the wizard immediately — no /auth/me round trip needed. A
  // no-op when logged out; demo never calls it (its mock user is already
  // onboarded).
  const markOnboarded = useCallback((onboardedAt: string) => {
    setUser((prev) => (prev ? { ...prev, onboardedAt } : prev));
  }, []);

  const refresh = useCallback(async () => {
    if (demoMode) return;
    // Share the on-401 single-flight + cross-tab lock (see `refreshSession`) so
    // an explicit refresh never races the automatic one and double-spends the
    // rotating token — which the backend would read as reuse and sign out every
    // session. A false result means the rotation failed: treat it as logged out.
    const ok = await refreshSession();
    if (!ok) {
      setSessionState("none");
      setUser(null);
      setLoggedIn(false);
      return;
    }
    try {
      const u = await fetchMe();
      setSessionState("active");
      setUser(u);
      setLoggedIn(true);
      setAuthError(null);
    } catch (err: unknown) {
      // Only a confirmed 401 means the session is gone. A 5xx or a network
      // fault during a role-change refresh is transient: keeping the current
      // user avoids dumping the member on the sign-in page (and being bounced
      // off the page they were on) over a blip the next request recovers from.
      const isSignedOut = err instanceof ApiError && err.status === 401;
      if (!isSignedOut) {
        const status = err instanceof ApiError ? err.status : null;
        setAuthError(status ? { kind: "server", status } : { kind: "network" });
        return;
      }
      setSessionState("none");
      setUser(null);
      setLoggedIn(false);
    }
  }, [demoMode]);

  const value = useMemo(
    () => ({
      loggedIn,
      checking,
      preparing,
      user,
      status: user?.status ?? null,
      role: user?.role ?? null,
      staffRoles: user?.staffRoles ?? [],
      authError,
      signIn,
      signOut,
      endPreparing,
      refresh,
      markOnboarded,
    }),
    [
      loggedIn,
      checking,
      preparing,
      user,
      authError,
      signIn,
      signOut,
      endPreparing,
      refresh,
      markOnboarded,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
