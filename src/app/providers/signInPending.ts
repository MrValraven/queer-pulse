/**
 * Live-mode sign-in leaves the SPA entirely: a full-page redirect back from
 * Google or after an email code. The in-memory `preparing` flag set at the
 * moment of the click can't survive to the landing page, so we stash a marker
 * in sessionStorage just before leaving and consume it once on the way back.
 * The member then lands on their feed behind the preparing loader, skipping
 * the bare session-check spinner. sessionStorage dies with the tab, so the
 * marker can never leak into an unrelated later visit.
 */
export const PREPARING_KEY = "qp.auth.preparing";

export function markSignInPending(): void {
  try {
    window.sessionStorage.setItem(PREPARING_KEY, "1");
  } catch {
    // Private-mode or blocked storage: the sign-in still goes ahead without the loader.
  }
}

/** Read-and-clear the marker: true only for the first read after a redirect. */
export function consumeSignInPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const isPending = window.sessionStorage.getItem(PREPARING_KEY) === "1";
    if (isPending) window.sessionStorage.removeItem(PREPARING_KEY);
    return isPending;
  } catch {
    return false;
  }
}

/** Finish an email-code sign-in with a full-page load of `redirectTo`, behind the preparing loader. */
export function completeEmailCodeSignIn(redirectTo: string): void {
  markSignInPending();
  window.location.assign(redirectTo);
}
