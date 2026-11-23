import { useCallback, useEffect, useRef } from "react";
import {
  ApiError,
  clearOnAuthLost,
  isSessionRefusedByServer,
  refreshSession,
  setOnAuthLost,
  setSessionState,
} from "../../shared/api/client";
import {
  bootstrapCsrf,
  fetchMe,
  type AuthUser,
} from "../../features/auth/api/auth.api";
import type { AuthErrorCode } from "./authContext";
import {
  adoptConfirmedMember,
  wipeFixedKeyMemberStores,
} from "./wipeMemberLocalData";

/**
 * Quick Exit sends its logout as the page leaves, and that request needs the
 * CSRF token in hand: a token still to be fetched would wait on a round trip
 * the unloading page never finishes, and the logout would never go out. The
 * launch bootstrap fetches the token before `/auth/me`, but a fetch that
 * failed leaves it empty, so every confirmed session asks again. A cached
 * token makes this a no-op.
 */
function warmCsrfForQuickExit(): void {
  void bootstrapCsrf();
}

type ReconcileInput = {
  /**
   * Read/mark "this tab has confirmed a real session at least once", as a pair
   * of callbacks rather than the `useRef` behind them. The ref is owned by
   * `AuthProvider`; handing it across a hook boundary makes it a plain local
   * variable here, which `react-hooks/immutability` (correctly, for anything
   * it cannot prove is a ref) refuses to see mutated after render.
   */
  hasEverLoggedIn: () => boolean;
  markEverLoggedIn: () => void;
  setUser: (user: AuthUser | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setAuthError: (error: AuthErrorCode | null) => void;
};

/**
 * The authoritative recovery behind `onAuthLost`.
 *
 * A request's on-401 refresh coming back false is NOT proof the session is
 * gone. It routinely happens on a transient/racing refresh — a sibling tab
 * rotated the refresh token, or an in-flight request lagged behind a refresh
 * that already succeeded — that the very next refresh recovers from. That is
 * why a returning member sees the app repopulate in place. So rather than
 * declaring the session expired on the spot (and flashing a "session expired"
 * toast over an app that is about to come back), reconcile once: try a fresh
 * refresh plus `/auth/me`, and only surface `expired` if THAT round trip also
 * fails. On the happy path nothing changes on screen.
 *
 * Single-flighted, so a storm of 401s (a tabful of queries refetching on focus)
 * triggers ONE reconcile rather than one per failed request.
 */
export function useReconcileSession({
  hasEverLoggedIn,
  markEverLoggedIn,
  setUser,
  setLoggedIn,
  setAuthError,
}: ReconcileInput): () => Promise<void> {
  const reconciling = useRef<Promise<void> | null>(null);

  return useCallback((): Promise<void> => {
    if (reconciling.current) return reconciling.current;
    const run = (async () => {
      const refreshStartedAt = Date.now();
      const ok = await refreshSession();
      // Whether the server itself refused the session (a refresh it answered
      // 401 or 403, or a 401 from /auth/me). A network fault, a lock timeout,
      // a 5xx or a 429 is no answer about the session, so it keeps the stores.
      let isSessionRejected = !ok && isSessionRefusedByServer(refreshStartedAt);
      if (ok) {
        const meStartedAt = Date.now();
        try {
          const freshUser = await fetchMe();
          setSessionState("active");
          warmCsrfForQuickExit();
          // A different member's session wipes the last member's traces
          // before any member UI renders.
          adoptConfirmedMember(freshUser.id);
          setUser(freshUser);
          setLoggedIn(true);
          markEverLoggedIn();
          setAuthError(null);
          return;
        } catch (error: unknown) {
          // Refresh rotated a token but /auth/me still refused it — fall through
          // and treat it as a genuine loss, same as a failed refresh.
          isSessionRejected = isSessionRefusedByServer(meStartedAt, error);
        }
      }
      setSessionState("none");
      setUser(null);
      setLoggedIn(false);
      // An involuntary loss the server confirmed (a refresh it rejected, a
      // 401, a remote sign-out): the fixed-key stores name no member, so they
      // go now.
      if (isSessionRejected) wipeFixedKeyMemberStores();
      // Only a tab that previously confirmed a real session can "expire" —
      // otherwise this is just a never-signed-in visitor, the same treatment the
      // bootstrap below gives its own signed-out case.
      if (hasEverLoggedIn()) {
        setAuthError({ kind: "expired" });
      }
    })().finally(() => {
      reconciling.current = null;
    });
    reconciling.current = run;
    return run;
  }, [hasEverLoggedIn, markEverLoggedIn, setUser, setLoggedIn, setAuthError]);
}

type LiveSessionInput = {
  demoMode: boolean;
  reconcileSession: () => Promise<void>;
  /** Same pair as `ReconcileInput` above, for the same reason. */
  markEverLoggedIn: () => void;
  setUser: (user: AuthUser | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setChecking: (checking: boolean) => void;
  setPreparing: (preparing: boolean) => void;
  setAuthError: (error: AuthErrorCode | null) => void;
};

/**
 * Live mode: bootstrap CSRF, then load the current member from `GET /auth/me`.
 * Extracted from `AuthProvider` so the provider component stays inside the
 * 200-line rule; the behaviour is unchanged apart from telling `client.ts` what
 * the round trip proved about the session.
 *
 * That last part matters beyond bookkeeping. Until `/auth/me` settles the
 * client treats a 401 as recoverable and tries a refresh, which is right for a
 * returning member whose 15-minute access cookie lapsed. Once we know there is
 * no session, every other 401 in the app is simply "not signed in": no
 * `POST /auth/refresh`, no `onAuthLost` reconcile, no error telemetry for a
 * visitor who never signed in at all.
 */
export function useLiveSessionBootstrap({
  demoMode,
  reconcileSession,
  markEverLoggedIn,
  setUser,
  setLoggedIn,
  setChecking,
  setPreparing,
  setAuthError,
}: LiveSessionInput): void {
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    const handleAuthLost = () => {
      // Don't declare defeat on a single failed refresh: reconcile once and
      // stay silent if the session comes back (the common returning-member
      // case). Only a failed reconcile logs out and surfaces `expired`, so a
      // user-initiated signOut() and a genuine involuntary loss stay distinct.
      void reconcileSession();
    };
    setOnAuthLost(handleAuthLost);
    // Reset before the async /auth/me bootstrap round trip resolves below.
    setAuthError(null);
    setChecking(true);
    const bootstrapStartedAt = Date.now();
    bootstrapCsrf()
      .then(fetchMe)
      .then((u) => {
        setSessionState("active");
        warmCsrfForQuickExit();
        // Before any member UI renders: a different member's session wipes
        // the last member's traces (they never signed out here).
        adoptConfirmedMember(u.id);
        if (!active) return;
        setUser(u);
        setLoggedIn(true);
        markEverLoggedIn();
        // A confirmed live session clears any stale error left by an earlier
        // recovered blip, so a "session expired" toast can never linger over it.
        setAuthError(null);
      })
      .catch((err: unknown) => {
        // A 401 just means "not signed in" — normal, no error to show. Anything
        // else (5xx, network failure) is a real fault the member should hear
        // about, and leaves the session genuinely unknown, so the client keeps
        // its recovery paths armed.
        const isSignedOut = err instanceof ApiError && err.status === 401;
        if (isSignedOut) {
          setSessionState("none");
          // No session at launch: whatever a fixed-key store still holds
          // belongs to a member whose session ended away from this device.
          // The 401 can also stand for a refresh that hit a blip, so only a
          // refusal the server itself gave wipes.
          if (isSessionRefusedByServer(bootstrapStartedAt, err)) {
            wipeFixedKeyMemberStores();
          }
        }
        if (!active) return;
        setUser(null);
        setLoggedIn(false);
        // The round trip didn't produce a session after all (rejected sign-in,
        // expired cookie) — drop the loader so it can't sit over the sign-in page.
        setPreparing(false);
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
      // The callback is module-global in `client.ts`, so leaving it installed
      // outlives this effect. Flipping demo mode on tears the effect down while
      // the reconcile closure stays armed, and a stray 401 then drives
      // `setUser(null)` against a session this provider no longer manages.
      // Clearing by identity means a newer owner's callback is left alone.
      clearOnAuthLost(handleAuthLost);
    };
  }, [
    demoMode,
    reconcileSession,
    markEverLoggedIn,
    setUser,
    setLoggedIn,
    setChecking,
    setPreparing,
    setAuthError,
  ]);
}
