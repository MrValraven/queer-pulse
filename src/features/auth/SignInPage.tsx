import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiAlertTriangle, FiCloudOff, FiWifiOff } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { probeBackend, type BackendProbe } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AuthLayout } from "./AuthLayout";
import { CommunityArt } from "./CommunityArt";
import styles from "./auth.module.css";

type FailedProbe = Extract<BackendProbe, { ok: false }>;

/** Map each probe failure to a specific, no-blame notice for the member. */
function noticeFor(err: FailedProbe): {
  Icon: IconType;
  title: string;
  body: string;
} {
  switch (err.reason) {
    case "offline":
      return {
        Icon: FiWifiOff,
        title: "You're offline",
        body: "We can't reach QueerPulse — your device isn't connected right now. Reconnect and try again.",
      };
    case "server":
      return {
        Icon: FiAlertTriangle,
        title: "Something went wrong on our side",
        body: `QueerPulse ran into an error signing you in${
          err.status ? ` (${err.status})` : ""
        } — it's on us, not you. Give it a moment and try again.`,
      };
    case "unreachable":
    default:
      return {
        Icon: FiCloudOff,
        title: "Sign-in is taking a breather",
        body: "We can't reach QueerPulse right now — nothing's wrong on your end. Give it a moment and try again.",
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
  const { signIn } = useAuth();
  const { demoMode } = useDemoMode();
  const [searchParams] = useSearchParams();
  const dest = safeNext(searchParams.get("next"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FailedProbe | null>(null);

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
    setError(null);
    if (demoMode) {
      signIn(dest);
      navigate(dest);
      return;
    }
    setBusy(true);
    const probe = await probeBackend();
    if (!probe.ok) {
      setBusy(false);
      setError(probe);
      return;
    }
    signIn(dest); // redirects the page away
  }

  const notice = error ? noticeFor(error) : null;

  return (
    <AuthLayout>
      <div className={styles.artTile}>
        <CommunityArt />
        <p className={styles.artCaption}>
          The pulse is <em>still going.</em> Welcome back to it.
        </p>
      </div>

      <h1>
        Welcome <em>back.</em>
      </h1>
      <p className={styles.sub}>Sign in to your QueerPulse account.</p>

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
        {busy ? "Connecting…" : "Continue with Google"}
      </button>

      <div className={styles.footer}>
        <Link to={routes.requestInvite} className="invite">
          Not a member yet? Request an invite
        </Link>
      </div>
    </AuthLayout>
  );
}
