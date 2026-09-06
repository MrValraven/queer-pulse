import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiCloudOff,
  FiHeart,
  FiMail,
  FiUserPlus,
  FiWifiOff,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { probeBackend, type BackendProbe } from "../../shared/api/client";
import { safeInternalPath } from "../../shared/lib/safeInternalPath";
import { usePlatformStatus } from "../../shared/api/usePlatformStatus";
import { requestInvitePath } from "./api/joinRequestSource";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { AuthLayout } from "./AuthLayout";
import { CommunityArt } from "./CommunityArt";
import { PlatformClosedNotice } from "./PlatformClosedNotice";
import styles from "./auth.module.css";

type FailedProbe = Extract<BackendProbe, { ok: false }>;

type Notice = { Icon: IconType; title: string; body: string };

/**
 * Map a `?error=<code>` from the backend's Google callback to a notice.
 *
 * The callback is a full-page redirect, so a failed sign-in comes back as a
 * navigation to this page rather than a response we can read — the code in the
 * query is the only thing that survives the round trip. Codes come from
 * `SignupRejectedError.reason`, the `state` nonce check, and `OAuthCallbackError`
 * (which reflects Google's own `?error=`, so unknown values reach us and fall
 * through to the generic notice — never render the raw code).
 */
function noticeForAuthError(code: string, t: TFunction): Notice {
  switch (code) {
    case "invite_required":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.inviteRequired.title"),
        body: t("auth:signIn.notice.inviteRequired.body"),
      };
    case "invite_invalid":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.inviteInvalid.title"),
        body: t("auth:signIn.notice.inviteInvalid.body"),
      };
    // The invite was addressed to a specific email and the Google account that
    // just signed in doesn't match it — sign in with that address, or ask anew.
    case "invite_email_mismatch":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.inviteEmailMismatch.title"),
        body: t("auth:signIn.notice.inviteEmailMismatch.body"),
      };
    // The person who sent the invite is no longer active on QueerPulse, so their
    // invite can't bring someone in. Not the visitor's fault — point them onward.
    case "invite_inviter_inactive":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.inviteInviterInactive.title"),
        body: t("auth:signIn.notice.inviteInviterInactive.body"),
      };
    // This address is on the erasure suppression list: they deleted their
    // account, and silently re-creating it would undo that. Not an error on
    // their part, so the copy stays warm and points at a human, not a retry.
    case "account_suppressed":
      return {
        Icon: FiHeart,
        title: t("auth:signIn.notice.accountSuppressed.title"),
        body: t("auth:signIn.notice.accountSuppressed.body"),
      };
    // The backend refused a NEW account because the 18+ box wasn't ticked.
    // Reachable if someone hits /auth/google directly, bypassing the invite
    // landing page where the checkbox lives.
    case "age_attestation_required":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.ageAttestationRequired.title"),
        body: t("auth:signIn.notice.ageAttestationRequired.body"),
      };
    // A NEW account was refused because this email address already belongs to
    // one. Identity here is keyed on `googleId`, so this is someone whose
    // address is on an account created through a different Google identity (a
    // work vs personal account with the same address, or a re-created Google
    // account). Retrying the same way can't work, so the copy says so and the
    // support link below carries them to a human.
    case "email_in_use":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.emailInUse.title"),
        body: t("auth:signIn.notice.emailInUse.body"),
      };
    case "access_denied":
      return {
        Icon: FiAlertTriangle,
        title: t("auth:signIn.notice.accessDenied.title"),
        body: t("auth:signIn.notice.accessDenied.body"),
      };
    case "no_email":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.noEmail.title"),
        body: t("auth:signIn.notice.noEmail.body"),
      };
    case "email_unverified":
      return {
        Icon: FiMail,
        title: t("auth:signIn.notice.emailUnverified.title"),
        body: t("auth:signIn.notice.emailUnverified.body"),
      };
    // Registration is switched off platform-wide, or the platform is locked
    // (lockdown also closes signups). Existing members are unaffected — this
    // only ever reaches a brand-new account attempt.
    case "registration_disabled":
      return {
        Icon: FiUserPlus,
        title: t("auth:signIn.notice.registrationDisabled.title"),
        body: t("auth:signIn.notice.registrationDisabled.body"),
      };
    case "invalid_state":
    case "oauth_failed":
    default:
      return {
        Icon: FiAlertTriangle,
        title: t("auth:signIn.notice.oauthFailed.title"),
        body: t("auth:signIn.notice.oauthFailed.body"),
      };
  }
}

/** Map each probe failure to a specific, no-blame notice for the member. */
function noticeFor(err: FailedProbe, t: TFunction): Notice {
  switch (err.reason) {
    case "offline":
      return {
        Icon: FiWifiOff,
        title: t("auth:signIn.notice.offline.title"),
        body: t("auth:signIn.notice.offline.body"),
      };
    case "server":
      return {
        Icon: FiAlertTriangle,
        title: t("auth:signIn.notice.serverError.title"),
        body: t("auth:signIn.notice.serverError.body", {
          status: err.status ? ` (${err.status})` : "",
        }),
      };
    case "unreachable":
    default:
      return {
        Icon: FiCloudOff,
        title: t("auth:signIn.notice.unreachable.title"),
        body: t("auth:signIn.notice.unreachable.body"),
      };
  }
}

export function SignInPage() {
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
  // exactly as it does today — a briefly-unreachable status endpoint must
  // never block a legitimate sign-in. Sign-in itself is never gated on this:
  // only the "create an account" affordance below reflects it.
  const { data: platformStatus } = usePlatformStatus();
  const registrationClosed = platformStatus?.registrationOpen === false;

  // Note: a signed-in member never reaches this page — the walled-garden gate
  // (see authGate.ts / AppRoutes) treats /auth/sign-in as guest-only and
  // redirects them to their feed before it renders.

  /**
   * Kick off sign-in. In demo mode this just flips local state. In live mode
   * `signIn()` does a full-page redirect to the backend, so we first probe that
   * the backend is healthy — if it isn't we show a specific in-app notice
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
    signIn(dest); // redirects the page away
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

  return (
    <AuthLayout>
      <div className={styles.artTile}>
        <CommunityArt />
        <p className={styles.artCaption}>
          <Translation
            i18nKey="auth:signIn.artCaption"
            components={{ em: <em /> }}
          />
        </p>
      </div>

      <h1>
        <Translation i18nKey="auth:signIn.title" components={{ em: <em /> }} />
      </h1>
      <p className={styles.sub}>{t("auth:signIn.subtitle")}</p>

      {notice && (
        <div className={styles.notice} role="alert">
          <notice.Icon size={20} className={styles.noticeIcon} aria-hidden />
          <div className={styles.noticeText}>
            <strong>{notice.title}</strong>
            <span>{notice.body}</span>
            {showSupportLink && (
              <span className={styles.noticeSupport}>
                <Translation
                  i18nKey="auth:signIn.notice.support"
                  components={{ a: <Link to={routes.contact} /> }}
                />
              </span>
            )}
          </div>
        </div>
      )}

      {registrationClosed && (
        <PlatformClosedNotice
          icon={FiUserPlus}
          title={t("auth:signIn.closed.title")}
          body={
            platformStatus?.registrationClosedMessage ||
            t("auth:signIn.closed.body")
          }
        />
      )}

      {/* Google requires its sign-in button to keep its own mandated shape and
          brand mark, so this stays a bare <button> with the `.google` treatment
          rather than the shared pill <Button>. `.google:disabled` mirrors
          Button's dimmed + not-allowed disabled styling so the busy state reads
          the same as every other CTA; focus comes from the global ring. */}
      <button
        type="button"
        className={styles.google}
        onClick={() => void attemptSignIn()}
        disabled={busy}
        aria-busy={busy}
      >
        {/* DES-170: the official multicolour Google "G" from react-icons,
            replacing a hand-inlined copy of the same four paths. Its brand
            colours are baked into the icon, which is what Google's branding
            guidelines require and what no design token could supply. Sized by
            `.google svg` in the module. */}
        <FcGoogle aria-hidden />
        {busy ? t("auth:signIn.connecting") : t("auth:signIn.googleCta")}
      </button>

      <div className={styles.footer}>
        <Link to={requestInvitePath("sign_in")} className="invite">
          {t("auth:common.notAMemberYet")}
        </Link>
        {/* PRD-306. Someone holding a code and no link lands here, because
            sign-in is the only door they can name. Without this they would
            request a fresh invite for one they already have. */}
        <Link to={routes.enterInviteCode}>
          {t("auth:common.haveAnInviteCode")}
        </Link>
      </div>
    </AuthLayout>
  );
}
