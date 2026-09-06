import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiX } from "react-icons/fi";
import { AuthLayout } from "../auth/AuthLayout";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  beginReauth,
  getCachedReauthToken,
} from "../settings/api/useReauthToken";
import {
  ConfirmMethod,
  ExpiredPanel,
  SuccessPanel,
} from "./VerificationNeededSections";
import { REAUTH_SECONDS } from "./verificationNeeded.data";
import styles from "./VerificationNeededPage.module.css";

type Stage = "input" | "verifying" | "success" | "expired";

function formatCountdown(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

/**
 * The step-up re-authentication screen.
 *
 * DEMO vs LIVE, and why they had to split. The whole page used to be the demo
 * path: a five-minute countdown ticking against nothing, a confirm button whose
 * "verification" was `setTimeout(1100)` resolving to success, and an action
 * card announcing the member was about to cancel a Sustainer membership there
 * is no billing to cancel. On the live build that meant a screen that said
 * "we've confirmed it's you" having confirmed nothing at all.
 *
 * A real step-up flow exists. QueerPulse auth is Google OAuth only, so proving
 * "this person re-authenticated just now" means a genuine OAuth round trip:
 * `beginReauth()` navigates to `GET /auth/google?reauth=1&redirect=<here>`, the
 * callback returns the token in the URL fragment, and `useReauthCompletion`
 * (mounted at the app root) caches it. This page now drives exactly that in
 * live mode and reads the result with `getCachedReauthToken()`.
 *
 * The countdown does not survive into live mode, on purpose: `beginReauth()`
 * unloads the page, so there is no in-page window left to count down, and the
 * token's own expiry is checked by `getCachedReauthToken` when a destructive
 * action asks for it. Nor does the live page finish the action for the member:
 * every call site (DeleteAccountSection, AccountDataExport, useDsar) requires
 * the same confirm button to be pressed again after landing back, which is the
 * deliberate safety margin against anything destructive firing as a side
 * effect of a page load.
 */
export function VerificationNeededPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { demoMode } = useDemoMode();
  const [stage, setStage] = useState<Stage>("input");
  const [secondsLeft, setSecondsLeft] = useState(REAUTH_SECONDS);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Read once at mount rather than during every render: `getCachedReauthToken`
  // touches sessionStorage and clears an expired entry, so it is not a pure
  // read, and a value that changed mid-render would be a rules-of-React
  // violation. The only way it becomes true is the redirect landing, which
  // remounts the page anyway.
  const [hasReauthToken] = useState(
    () => !demoMode && !!getCachedReauthToken(),
  );

  // Live re-auth countdown — demo only; pauses once verifying/done.
  useEffect(() => {
    if (!demoMode || stage !== "input") return;
    const countdown = setInterval(() => {
      setSecondsLeft((remaining) => {
        if (remaining <= 1) {
          clearInterval(countdown);
          setStage("expired");
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [demoMode, stage]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleVerify() {
    setStage("verifying");
    timers.current.push(setTimeout(() => setStage("success"), 1100));
    timers.current.push(setTimeout(() => void navigate(routes.settings), 2700));
  }

  function restart() {
    setStage("input");
    setSecondsLeft(REAUTH_SECONDS);
  }

  // Landed back from Google with a token in hand.
  if (hasReauthToken) {
    return (
      <AuthLayout>
        <SuccessPanel
          isLiveStepUp
          onContinue={() => void navigate(routes.settings)}
        />
      </AuthLayout>
    );
  }

  if (demoMode && stage === "expired") {
    return (
      <AuthLayout>
        <ExpiredPanel onRestart={restart} />
      </AuthLayout>
    );
  }

  if (demoMode && stage === "success") {
    return (
      <AuthLayout>
        <SuccessPanel onContinue={() => void navigate(routes.settings)} />
      </AuthLayout>
    );
  }

  const isBusy = demoMode && stage === "verifying";
  const isUrgent = secondsLeft <= 60;

  return (
    <AuthLayout>
      <div className={styles.icon}>
        <FiLock aria-hidden />
      </div>

      <h1>
        <Translation
          i18nKey="system:verificationNeeded.heading"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.lead}>
        <Translation
          i18nKey={
            demoMode
              ? "system:verificationNeeded.lead"
              : "system:verificationNeeded.leadLive"
          }
          components={{ b: <b /> }}
        />
      </p>

      {/* The action card names one specific pending action. Live mode has no
          way to know which action sent the member here, and the one it named
          was a membership cancellation with no billing behind it. */}
      {demoMode && (
        <div className={styles.actionCard}>
          <div className={styles.actionIc}>
            <FiX aria-hidden />
          </div>
          <span>
            <Translation
              i18nKey="system:verificationNeeded.actionCard"
              components={{ b: <b /> }}
            />
          </span>
        </div>
      )}

      {/* One step, so no tablist. The password and authenticator tabs that
          used to sit here verified nothing, and the magic-link pane that
          replaced them promised an email QueerPulse never sends. See
          VerificationNeededSections. */}
      <div className={styles.methodBody}>
        <ConfirmMethod
          isBusy={isBusy}
          isLiveStepUp={!demoMode}
          onVerify={demoMode ? handleVerify : beginReauth}
        />
      </div>

      <p className={styles.foot}>
        {demoMode ? (
          <Translation
            i18nKey="system:verificationNeeded.foot"
            values={{ time: formatCountdown(secondsLeft) }}
            components={{
              b: (
                <b
                  className={[styles.timer, isUrgent && styles.timerUrgent]
                    .filter(Boolean)
                    .join(" ")}
                />
              ),
            }}
          />
        ) : (
          t("system:verificationNeeded.footLive")
        )}
      </p>
    </AuthLayout>
  );
}
