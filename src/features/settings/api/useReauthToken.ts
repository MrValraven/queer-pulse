import { useEffect } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { API_BASE_URL } from "../../../shared/api/config";
import { refreshSession } from "../../../shared/api/client";
import { useEmailCodeSignInState } from "../../../shared/api/useIsEmailCodeSignInOn";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { openReauthDialog } from "./reauthDialogStore";

/**
 * Step-up re-authentication: proving the caller confirmed it is them just now,
 * on top of holding a valid session cookie.
 *
 * `beginReauth` opens the code dialog (`reauthDialogStore`, mounted once by
 * `ReauthCompletionProvider`) while the email code sign-in is switched on;
 * `beginReauth` itself describes the paths taken while it is off. The dialog
 * emails a 6-digit code to the member's own address through
 * `/auth/email-code/reauth/request` and checks it with
 * `/auth/email-code/reauth/verify`, all in place, so the page stays loaded.
 * Members with Google on their account can still pick the redirect:
 * `beginGoogleReauth` runs the Google OAuth round trip with `prompt=login`,
 * comes back through `AuthController.googleCallback`'s `reauth` branch, and
 * lands here again via `useReauthCompletion`.
 *
 * Both paths put the token in the same `sessionStorage` slot
 * (`qp_reauth_token`, written by `cacheReauthToken`), and both leave the
 * pending action for the member to run again. Each gated action
 * (DeleteAccountSection, AccountDataStepAway, AccountDataExport, useDsar,
 * useExportFlow) reads the cached token at click time and, when there is
 * none, calls `beginReauth()` and ends quietly: no success panel, no error
 * toast, its button enabled again at once, and a destructive flow back at its
 * confirm step. A promise-based
 * action rejects with `ReauthRequiredError` (`reauthRequiredError.ts`) so its
 * caller can tell this stop from a failure. Once the code is accepted, or the
 * Google redirect lands, the member presses the same button again and the
 * cached token is used. That second press is the deliberate safety margin:
 * nothing DESTRUCTIVE ever fires as a side effect of a confirmation or a page
 * load. VerificationNeededPage is the one caller that passes `onConfirmed`,
 * because it only shows a success panel and runs no action.
 *
 * One deliberate exception, PRD-305: the data export resumes itself on the
 * landing (see `readReauthLandingToken`). It is the one step-up call site that
 * destroys nothing, and asking for a second press there cost the member their
 * chosen category set. The resume is armed by the landing FRAGMENT, so it only
 * fires after the Google round trip, once, on the trip the member started, and
 * never again while the token stays cached. The code dialog has no landing, so
 * after a code the export waits for the second press like everything else.
 * Deactivation, deletion and the DSAR keep the second press on both paths.
 */

const TOKEN_KEY = "qp_reauth_token";
const EXPIRES_KEY = "qp_reauth_expires_at";

/** Caches a freshly minted reauth token where `getCachedReauthToken` reads it.
 * The code dialog and the Google landing both write through here. */
export function cacheReauthToken(token: string, expiresAt: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXPIRES_KEY, expiresAt);
}

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
 * What `beginReauth` needs to pick a path: whether the email code sign-in is
 * switched on (`GET /platform-status`'s `emailCodeSignIn`), whether the member
 * has Google, and how to say that neither path is open.
 *
 * `beginReauth` is a plain function its callers run from action handlers, so
 * it cannot read a hook. A tiny module store bridges the two, the same way
 * `reauthDialogStore` does for the dialog: `useReauthAvailabilitySync`,
 * mounted once by `ReauthCompletionProvider`, writes it on every change, and
 * `beginReauth` reads it at click time. The store was picked over reading
 * react-query's cache because the provider already holds the toast, the
 * translations and the signed-in member the off path needs.
 *
 * `null` means nothing has synced it: the provider is not mounted (a test that
 * renders one gated page, with its own dialog), and `beginReauth` opens the
 * code dialog as before. `isEmailCodeOn: null` means no platform status has
 * been read yet (still loading, or the read failed): the code dialog is only
 * in the tree once the switch is `true`, so that state takes the Google path
 * or says the check is still pending.
 *
 * The toast copy lives in the eager `shared` namespace, so it reads in full
 * at click time on any page, including the ones that never load `settings`
 * (VerificationNeededPage, AccountDataStepAway).
 */
interface ReauthAvailability {
  isEmailCodeOn: boolean | null;
  hasGoogle: boolean;
  /** Toasts why there is no way to confirm: `isEmailCodeOn` decides whether
   *  codes are switched off or the switch is still being read. */
  showUnavailable: () => void;
}

let reauthAvailability: ReauthAvailability | null = null;

/**
 * Keeps the step-up store in step with the email code switch and the member.
 * Mount ONCE, in `ReauthCompletionProvider`. `hasGoogle` reads as the dialog's
 * Google button does: only an explicit `false` means no Google.
 */
export function useReauthAvailabilitySync(): void {
  const isEmailCodeOn = useEmailCodeSignInState();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const hasGoogle = user != null && user.hasGoogle !== false;

  useEffect(() => {
    reauthAvailability = {
      isEmailCodeOn,
      hasGoogle,
      showUnavailable: () =>
        isEmailCodeOn === false
          ? showToast(t("shared:reauthUnavailable"), "error")
          : showToast(t("shared:reauthStatusPending"), "info"),
    };
    return () => {
      reauthAvailability = null;
    };
  }, [isEmailCodeOn, hasGoogle, showToast, t]);
}

/**
 * Whether `beginReauth` will take the Google round trip for this member: the
 * email code sign-in is not explicitly on (off, or not read yet) and the
 * member has Google. A page that describes the step-up picks its words from
 * this, so a member without Google keeps the code copy (their press shows a
 * toast naming why it cannot go ahead).
 */
export function useIsGoogleStepUp(): boolean {
  const isEmailCodeOn = useEmailCodeSignInState();
  const { user } = useAuth();
  return isEmailCodeOn !== true && user != null && user.hasGoogle !== false;
}

/**
 * Starts step-up re-authentication. With the email code sign-in on, it opens
 * the code dialog: the page stays where it is, the dialog caches the token
 * through `cacheReauthToken` and then runs `onConfirmed`, if given, so a page
 * can react in place. Otherwise (switched off, or not read yet) a member
 * with Google takes the Google round trip (`beginGoogleReauth`), and a member
 * without Google gets a toast: codes switched off, or the check still
 * pending. The caller's action still ends quietly, as it does after any
 * `beginReauth()`. With nothing synced it opens the dialog (see
 * `ReauthAvailability`).
 */
export function beginReauth(options?: { onConfirmed?: () => void }): void {
  if (
    reauthAvailability === null ||
    reauthAvailability.isEmailCodeOn === true
  ) {
    openReauthDialog(options);
    return;
  }
  if (reauthAvailability.hasGoogle) {
    void beginGoogleReauth();
    return;
  }
  reauthAvailability.showUnavailable();
}

/**
 * The Google path of step-up, for members with Google on their account.
 * Refreshes the session, then navigates the browser to
 * `GET /auth/google?reauth=1&redirect=<here>` to begin the step-up round
 * trip. This is a full-page navigation: the returned promise exists only so
 * a caller can await the refresh before the browser leaves, resolves right
 * before the page unloads, and otherwise carries nothing useful. The member
 * lands back on this exact path (`useReauthCompletion` picks up the result).
 *
 * THE REFRESH COMES FIRST, ENG-497: the backend identifies the member for
 * this round trip from the `access_token` cookie alone (`AuthController.
 * googleCallback`'s reauth branch), whose maxAge is the short access-token
 * TTL (`auth.config.ts`). A member idle on the delete or export page past
 * that TTL would otherwise leave with a stale cookie and land back on
 * `reauth_failed` even though their session is perfectly good. `refreshSession`
 * is the same cross-tab, single-flight refresh every other 401 recovery in
 * the app shares (`shared/api/client.ts`), so this never double-spends the
 * rotating refresh token against a concurrent tab or an in-flight request.
 *
 * `refreshSession` reporting failure covers a few different causes:
 * the member's own refresh token has lapsed, the server refused it (a 5xx or
 * 429 counts as `rejected` too), the request hit a network fault, or the
 * cross-tab refresh lock timed out waiting on another tab (`RefreshOutcome`
 * in `shared/api/client.ts`). None of those tell this function apart from an
 * actually-dead session, so the safe assumption is that there may be no
 * session left to step up from, and the honest outcome is a full sign-in:
 * this redirects to `routes.signIn` with a `next` back to the current path,
 * matching the pattern `authGate.ts` already uses for a signed-out visitor
 * hitting a gated route. Sending the browser to Google from here would only
 * land back on `reauth_failed`. For an active member whose session was fine
 * all along, this lands on the sign-in screen still signed in, and
 * `authGate.ts`'s guest-only handling (`isGuestOnlyPath`) bounces them
 * straight back to that same `next` path, so a transient network blip costs
 * at most one extra hop and the flow keeps moving. A suspended or banned
 * member takes `authGate.ts`'s earlier suspended branch instead, which finds
 * the sign-in path ungated and returns before that guest-only check runs, so
 * they stay on the sign-in screen.
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
export async function beginGoogleReauth(): Promise<void> {
  const returnPath = window.location.pathname + window.location.search;
  const refreshed = await refreshSession();
  if (!refreshed) {
    window.location.href = `${routes.signIn}?next=${encodeURIComponent(returnPath)}`;
    return;
  }
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
 * This covers the Google path only; the code dialog caches its token itself.
 * Demo mode never produces this fragment (the OAuth round trip is live-only),
 * so this is a no-op there.
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
      cacheReauthToken(token, expiresAt);
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
