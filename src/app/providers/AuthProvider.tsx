import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthContext, type AuthErrorCode } from "./authContext";
import { AUTH_STORAGE_KEY as STORAGE_KEY } from "../../features/marketing/cookies.data";
import { useDemoMode } from "./DemoModeProvider";
import { ApiError, refreshSession, setOnAuthLost } from "../../shared/api/client";
import {
  bootstrapCsrf,
  fetchMe,
  postLogout,
  redirectToGoogle,
  type AuthUser,
} from "../../features/auth/api/auth.api";
import {
  currentUser,
  currentUserSlug,
} from "../../features/members/data/demoCurrentUser";

function getInitialLoggedIn(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "false";
}

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
  // A fixed adult mock — already attested so demo sessions never hit the age gate.
  ageAttestedAt: "2026-01-01T00:00:00.000Z",
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
    demoMode ? getInitialLoggedIn() : false,
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

  // Demo mode: mirror the prototype's localStorage-driven mock session. The
  // session is known synchronously, so there's nothing to "check".
  useEffect(() => {
    if (!demoMode) return;
    // Mirrors the localStorage-driven mock session (loggedIn) into auth state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecking(false);
    setUser(loggedIn ? DEMO_USER : null);
  }, [demoMode, loggedIn]);

  useEffect(() => {
    if (!demoMode) return;
    window.localStorage.setItem(STORAGE_KEY, loggedIn ? "true" : "false");
  }, [demoMode, loggedIn]);

  // Live mode: bootstrap CSRF, then load the current user from /auth/me.
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    setOnAuthLost(() => {
      setUser(null);
      setLoggedIn(false);
      // An involuntary sign-out mid-visit (refresh failed after a 401). Surface
      // it so the member hears "your session expired" rather than silently
      // finding themselves logged out. A user-initiated signOut() never sets
      // this, so the two stay distinct.
      setAuthError({ kind: "expired" });
    });
    // Reset before the async /auth/me bootstrap round trip resolves below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthError(null);
    setChecking(true);
    bootstrapCsrf()
      .then(fetchMe)
      .then((u) => {
        if (!active) return;
        setUser(u);
        setLoggedIn(true);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setUser(null);
        setLoggedIn(false);
        // The round trip didn't produce a session after all (rejected sign-in,
        // expired cookie) — drop the loader so it can't sit over the sign-in page.
        setPreparing(false);
        // A 401 just means "not signed in" — normal, no error to show. Anything
        // else (5xx, network failure) is a real fault the member should hear about.
        const isSignedOut = err instanceof ApiError && err.status === 401;
        if (!isSignedOut) {
          const status = err instanceof ApiError ? err.status : null;
          setAuthError(
            status ? { kind: "server", status } : { kind: "network" },
          );
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [demoMode]);

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
    void postLogout().finally(() => {
      setUser(null);
      setLoggedIn(false);
    });
  }, [demoMode]);

  const endPreparing = useCallback(() => setPreparing(false), []);

  const refresh = useCallback(async () => {
    if (demoMode) return;
    // Share the on-401 single-flight + cross-tab lock (see `refreshSession`) so
    // an explicit refresh never races the automatic one and double-spends the
    // rotating token — which the backend would read as reuse and sign out every
    // session. A false result means the rotation failed: treat it as logged out.
    const ok = await refreshSession();
    if (!ok) {
      setUser(null);
      setLoggedIn(false);
      return;
    }
    try {
      const u = await fetchMe();
      setUser(u);
      setLoggedIn(true);
    } catch {
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
      authError,
      signIn,
      signOut,
      endPreparing,
      refresh,
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
