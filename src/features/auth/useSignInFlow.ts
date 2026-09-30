import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { probeBackend } from "../../shared/api/client";
import type { PlatformStatusDTO } from "../../shared/api/platformStatus.api";
import { usePlatformStatus } from "../../shared/api/usePlatformStatus";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { safeInternalPath } from "../../shared/lib/safeInternalPath";
import {
  noticeFor,
  noticeForAuthError,
  type FailedProbe,
  type Notice,
} from "./signInNotices";

export interface SignInFlow {
  busy: boolean;
  attemptSignIn: () => Promise<void>;
  notice: Notice | null;
  showSupportLink: boolean;
  registrationClosed: boolean;
  platformStatus: PlatformStatusDTO | undefined;
}

/** Everything the sign-in page does: the probe, the busy state, the error
 *  notices and the closed notice, kept apart from the markup that renders
 *  them. */
export function useSignInFlow(): SignInFlow {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { demoMode } = useDemoMode();
  const [searchParams] = useSearchParams();
  const dest = safeInternalPath(searchParams.get("next"));
  const [busy, setBusy] = useState(false);
  const [probeError, setProbeError] = useState<FailedProbe | null>(null);
  // Set when the backend's Google callback bounced us back here after a failed
  // or rejected sign-in (invite-only gate, cancelled consent, bad state nonce).
  const authError = searchParams.get("error");

  // Pre-emptive closed state, read BEFORE anyone attempts to sign in. Fails
  // open by construction: outside demo mode there is no `initialData`, so
  // while the query is loading or if it errors `platformStatus` is
  // `undefined` here, `registrationClosed` stays `false`, and the page renders
  // exactly as it does today; a briefly-unreachable status endpoint must
  // never block a legitimate sign-in. Sign-in itself is never gated on this:
  // only the "create an account" affordance reflects it.
  const { data: platformStatus } = usePlatformStatus();
  const registrationClosed = platformStatus?.registrationOpen === false;

  /**
   * Kick off sign-in. In demo mode this just flips local state. In live mode
   * `signIn()` does a full-page redirect to the backend, so we first probe that
   * the backend is healthy; if it isn't we show a specific in-app notice
   * (offline / unreachable / server error) instead of stranding the browser on
   * its own error page.
   */
  async function attemptSignIn() {
    if (busy) return;
    setProbeError(null);
    if (demoMode) {
      signIn(dest);
      await navigate(dest);
      return;
    }
    setBusy(true);
    const probe = await probeBackend();
    if (!probe.ok) {
      setBusy(false);
      setProbeError(probe);
      return;
    }
    // `switchAccount` on a retry: we only land back here with an `?error=` after
    // an attempt that Google itself completed, and with a single signed-in
    // Google session it skips the chooser and re-sends that same identity, so
    // without this the second click reproduces the first failure exactly and
    // the member is stuck (no QueerPulse-side sign-out clears Google's choice).
    // Asking for the chooser gives them "Use another account", which is the way
    // out of every account-shaped rejection above (wrong account for an
    // addressed invite, address already on another account, no/unverified email
    // on this one), and costs a returning member one extra tap.
    signIn(dest, { switchAccount: authError !== null }); // redirects the page away
  }

  // A fresh probe failure describes what just happened, so it wins over the
  // `?error=` left in the URL by an earlier callback.
  const notice = probeError
    ? noticeFor(probeError, t)
    : authError
      ? noticeForAuthError(authError, t)
      : null;

  // A "still stuck? contact us" link, shown under a genuine closed-door notice
  // from the OAuth callback: this also covers the case where someone's linked
  // Google account was deleted or revoked, which has no dedicated error code
  // (identity here is keyed solely on `googleId`, so a lost Google account has
  // no distinct "account not found" signal and just resurfaces as a generic
  // failure). Left off two states that don't need a human: `probeError`
  // (offline/server/unreachable, network hiccups that self-resolve on retry)
  // and `access_denied` (the member cancelled the Google consent screen
  // themselves, so "try again" is the honest next step).
  const showSupportLink =
    !probeError && authError !== null && authError !== "access_denied";

  return {
    busy,
    attemptSignIn,
    notice,
    showSupportLink,
    registrationClosed,
    platformStatus,
  };
}
