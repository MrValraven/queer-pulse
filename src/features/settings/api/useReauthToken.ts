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
 * button again after landing back, which is the deliberate safety margin —
 * nothing destructive ever fires as a side effect of a page load.
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
 * Navigates the browser to `GET /auth/google?reauth=1&redirect=<here>` to
 * begin the step-up round trip. Full-page navigation, not an API call — has
 * no return value because the page is about to unload. The member lands back
 * on this exact path (`useReauthCompletion` picks up the result).
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
