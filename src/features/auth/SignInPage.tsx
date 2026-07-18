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
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { probeBackend, type BackendProbe } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { AuthLayout } from "./AuthLayout";
import { CommunityArt } from "./CommunityArt";
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

/** Only honour same-origin internal paths from `?next=` (avoids open redirects). */
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/feed";
}

export function SignInPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { demoMode } = useDemoMode();
  const [searchParams] = useSearchParams();
  const dest = safeNext(searchParams.get("next"));
  const [busy, setBusy] = useState(false);
  const [probeError, setProbeError] = useState<FailedProbe | null>(null);
  // Set when the backend's Google callback bounced us back here after a failed
  // or rejected sign-in (invite-only gate, cancelled consent, bad state nonce).
  const authError = searchParams.get("error");

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
      navigate(dest);
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
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.google}
        onClick={attemptSignIn}
        disabled={busy}
      >
        <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        {busy ? t("auth:signIn.connecting") : t("auth:signIn.googleCta")}
      </button>

      <div className={styles.footer}>
        <Link to={routes.requestInvite} className="invite">
          {t("auth:common.notAMemberYet")}
        </Link>
      </div>
    </AuthLayout>
  );
}
