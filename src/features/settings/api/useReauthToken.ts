import { useEffect } from "react";
import { API_BASE_URL } from "../../../shared/api/config";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * Step-up re-authentication, redirect-based.
 *
 * Auth is OAuth-only (no password), so proving "the caller re-authenticated
 * just now" — not merely "still holds a valid session cookie" — means making
 * them complete a real Google OAuth round trip with `prompt=login`. That is a
 * full top-level browser navigation, which cannot be driven from a fetch/XHR
 * call the way the old `POST /account/reauth` was: this file replaces that
 * dead-end (it minted a token from nothing but the caller's own claim) with
 * a redirect flow that leaves via `beginReauth`, comes back through
 * `AuthController.googleCallback`'s `reauth` branch, and lands here again via
 * `useReauthCompletion`.
 *
 * The token itself travels back in the URL FRAGMENT (never sent to a server,
 * so it can't leak into access logs) and is cached in `sessionStorage` — NOT
 * auto-applied to whatever destructive action was pending. Every call site
 * (DeleteAccountSection, AccountDataStepAway, AccountDataExport, useDsar,
 * useExportFlow) checks `getCachedReauthToken()` first and only calls
 * `beginReauth()` when it's null; the member has to press the same confirm
 * button again after landing back, which is the deliberate safety margin:
 * nothing DESTRUCTIVE ever fires as a side effect of a page load.
 *
 * One deliberate exception, PRD-305: the data export resumes itself on the
 * landing (see `readReauthLandingToken`). It is the one step-up call site that
 * destroys nothing, and asking for a second press there cost the member their
 * chosen category set. The resume is armed by the landing FRAGMENT rather than
 * the cached token, so it fires once, on the trip the member started, and
 * never again while the token stays cached. Deactivation, deletion and the
 * DSAR keep the second press.
 */

const TOKEN_KEY = "qp_reauth_token";
const EXPIRES_KEY = "qp_reauth_expires_at";

/** A still-valid cached reauth token, or `null` if none is cached or it has
 * expired (also clears an expired one so a stale entry doesn't linger). */
export function getCachedReauthToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = sessionStorage.getItem(EXPIRES_KEY);
  if (!token || !expiresAt) return null;
  if (new Date(expiresAt).getTime() <= Date.now()) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    return null;
  }
  return token;
}

/**
 * The reauth token carried by THIS page load's URL fragment, or `null`.
 *
 * `useReauthCompletion` caches that token into `sessionStorage`, but it does so
 * in an effect at the app root, and React runs a child's effects before its
 * parent's. A page that wants to act on the landing itself (the data export
 * resumes there, PRD-305) would therefore call `getCachedReauthToken()` a beat
 * too early, read `null`, and bounce the member straight back into another
 * OAuth round trip. This reads the same fragment the provider reads, with no
 * side effects of its own, so a page can capture the token during its FIRST
 * render and hand it to the call it is resuming.
 *
 * Returns `null` once the provider has cleared the fragment, which is exactly
 * the property the resume relies on: it can fire on the landing and never on a
 * later visit while the cached token is still valid.
 */
export function readReauthLandingToken(): string | null {
  if (!window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get("reauthToken");
  const expiresAt = params.get("reauthExpiresAt");
  if (!token || !expiresAt) return null;
  const expiryMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiryMs) || expiryMs <= Date.now()) return null;
  return token;
}

/**
 * Navigates the browser to `GET /auth/google?reauth=1&redirect=<here>` to
 * begin the step-up round trip. Full-page navigation, not an API call — has
 * no return value because the page is about to unload. The member lands back
 * on this exact path (`useReauthCompletion` picks up the result).
 *
 * THE QUERY STRING SURVIVES THE ROUND TRIP, so a caller may park state in it
 * and find it intact on landing. Traced hop by hop: `redirect` is packed into
 * the OAuth `state` as base64url JSON (`encodeOAuthState`), which is opaque to
 * its contents; `decodeOAuthState` restores it verbatim; the callback's reauth
 * branch runs it through `safeRedirectPath`, which rejects only a value that
 * does not start with `/`, a protocol-relative or backslash prefix, any
 * backslash, an embedded `://`, and control characters or spaces. `?`, `&` and
 * `=` all pass. `resolvePostLoginRedirect` then rebuilds it with
 * `new URL(safe, base)`, which preserves the search verbatim, and the token
 * itself rides back in the FRAGMENT, so the two never compete for the space.
 *
 * Two rules for anything parked there: keep it SHORT (the whole path travels
 * inside Google's `state` parameter) and re-validate it on landing, because it
 * came back through an external redirect and is untrusted input.
 */
export function beginReauth(): void {
  const returnPath = window.location.pathname + window.location.search;
  const url = new URL(`${API_BASE_URL}/auth/google`);
  url.searchParams.set("reauth", "1");
  url.searchParams.set("redirect", returnPath);
  window.location.href = url.toString();
}

/**
 * Mount ONCE near the app root (`ReauthCompletionProvider`). On landing,
 * reads a `#reauthToken=...&reauthExpiresAt=...` (success) or
 * `#reauthError=...` (failure) fragment left by `AuthController.
 * googleCallback`'s reauth branch, caches a successful token, clears the
 * fragment (so a refresh doesn't reprocess it), and toasts the outcome.
 * Demo mode never produces this fragment — the OAuth round trip is live-only
 * — so this is a no-op there.
 */
export function useReauthCompletion(): void {
  const { showToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!window.location.hash) return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("reauthToken");
    const expiresAt = params.get("reauthExpiresAt");
    const error = params.get("reauthError");
    if (!token && !error) return;

    if (token && expiresAt) {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(EXPIRES_KEY, expiresAt);
    }
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    if (token) {
      showToast(t("settings:reauth.completion.success"), "success");
    } else {
      showToast(t("settings:reauth.completion.failed"), "error");
    }
    // Runs once on mount — a reauth fragment only ever exists on the fresh
    // redirect landing, never reappearing on later in-app navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
