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
import { ApiError, setOnAuthLost } from "../../shared/api/client";
import {
  bootstrapCsrf,
  fetchMe,
  postLogout,
  postRefresh,
  redirectToGoogle,
  type AuthUser,
} from "../../features/auth/api/auth.api";
import {
  currentUser,
  currentUserSlug,
} from "../../features/members/data/members";

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
    });
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
    (redirectTo?: string, invite?: string) => {
      if (demoMode) {
        setLoggedIn(true);
        setPreparing(true);
        return;
      }
      markSignInPending();
      redirectToGoogle(redirectTo, invite);
    },
    [demoMode],
  );

  const signOut = useCallback(() => {
    setPreparing(false);
    if (demoMode) {
      setLoggedIn(false);
      return;
    }
    postLogout().finally(() => {
      setUser(null);
      setLoggedIn(false);
    });
  }, [demoMode]);

  const endPreparing = useCallback(() => setPreparing(false), []);

  const refresh = useCallback(async () => {
    if (demoMode) return;
    try {
      await postRefresh();
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
