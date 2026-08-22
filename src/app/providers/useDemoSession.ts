import { useEffect } from "react";
import { safeStorage } from "../../shared/storage/safeStorage";
import { AUTH_STORAGE_KEY as STORAGE_KEY } from "../../features/marketing/cookies.data";
import type { AuthUser } from "../../features/auth/api/auth.api";

type DemoSessionInput = {
  demoMode: boolean;
  loggedIn: boolean;
  demoUser: AuthUser;
  setChecking: (checking: boolean) => void;
  setUser: (user: AuthUser | null) => void;
};

/**
 * Demo mode's mock session: it lives in localStorage and is therefore known
 * synchronously, so there is nothing to "check". Extracted from `AuthProvider`
 * so the provider component itself stays inside the 200-line rule and the two
 * session models (mock vs. live cookie) read as two separate stories.
 *
 * Both reads and writes go through `safeStorage` — `AuthProvider` composes into
 * `RootProviders`, which wraps the app ErrorBoundary, so an unguarded
 * `SecurityError` from a browser that blocks site data would white-screen the
 * app before anything could catch it.
 */
export function useDemoSession({
  demoMode,
  loggedIn,
  demoUser,
  setChecking,
  setUser,
}: DemoSessionInput): void {
  useEffect(() => {
    if (!demoMode) return;
    // Mirrors the localStorage-driven mock session (loggedIn) into auth state.
    setChecking(false);
    setUser(loggedIn ? demoUser : null);
  }, [demoMode, loggedIn, demoUser, setChecking, setUser]);

  useEffect(() => {
    if (!demoMode) return;
    safeStorage.set(STORAGE_KEY, loggedIn ? "true" : "false");
  }, [demoMode, loggedIn]);
}

/** The persisted mock session flag, read through the guarded storage seam. */
export function getInitialDemoLoggedIn(): boolean {
  if (typeof window === "undefined") return true;
  return safeStorage.get(STORAGE_KEY) !== "false";
}
