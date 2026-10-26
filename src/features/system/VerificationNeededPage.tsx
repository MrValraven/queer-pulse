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
  useIsGoogleStepUp,
} from "../settings/api/useReauthToken";
import {
  ConfirmMethod,
  ExpiredPanel,
  SuccessPanel,
} from "./VerificationNeededSections";
import { REAUTH_SECONDS } from "./verificationNeeded.data";
import styles from "./VerificationNeededPage.module.css";

type Stage = "input" | "success" | "expired";

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
 * A real step-up flow exists. Proving "this person confirmed it is them just
 * now" means a code emailed to the member's own address: `beginReauth()` opens
 * the code dialog (`/auth/email-code/reauth/*`), which caches the token in
 * `qp_reauth_token` and then calls the `onConfirmed` this page hands it, so
 * the success panel shows in place. Members with Google can still pick the
 * redirect from the dialog; that round trip lands back here and
 * `useReauthCompletion` (mounted at the app root) caches the same token, which
 * this page reads with `getCachedReauthToken()` on mount.
 *
 * Demo opens the same dialog on its mock answers, and its `onConfirmed` shows
 * the demo success panel and moves on to settings, so the prototype walks the
 * whole step-up. The countdown stays in demo mode on purpose: the code itself
 * carries its own expiry inside the dialog, and the token's expiry is checked by
 * `getCachedReauthToken` when a destructive action asks for it. The live page
 * also leaves the action to the member: every call site
 * (DeleteAccountSection, AccountDataStepAway, AccountDataExport, useDsar,
 * useExportFlow) requires the same confirm button to be pressed again after
 * the confirmation, which is the deliberate safety margin against anything
 * destructive firing as a side effect of it.
 */
export function VerificationNeededPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { demoMode } = useDemoMode();
  // Unless sign-in codes are explicitly on, `beginReauth` runs the Google
  // round trip for a member with Google.
  const isGoogleStepUp = useIsGoogleStepUp();
  const [stage, setStage] = useState<Stage>("input");
  const [secondsLeft, setSecondsLeft] = useState(REAUTH_SECONDS);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Read once at mount rather than during every render: `getCachedReauthToken`
  // touches sessionStorage and clears an expired entry, so it is not a pure
  // read, and a value that changed mid-render would be a rules-of-React
  // violation. It becomes true on the Google redirect landing, which remounts
  // the page, or through the code dialog's `onConfirmed` below.
  const [hasReauthToken, setHasReauthToken] = useState(
    () => !demoMode && !!getCachedReauthToken(),
  );

  // The demo countdown; it stops once the page leaves the input stage.
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

  // Demo: the code dialog runs on mock answers; once it confirms, the demo
  // success panel shows and the page moves on to settings.
  function handleDemoConfirmed() {
    setStage("success");
    timers.current.push(setTimeout(() => void navigate(routes.settings), 1600));
  }

  function restart() {
    setStage("input");
    setSecondsLeft(REAUTH_SECONDS);
  }

  // A token in hand, from the code dialog or the Google landing.
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
          isBusy={false}
          isLiveStepUp={!demoMode}
          onVerify={() =>
            beginReauth({
              onConfirmed: demoMode
                ? handleDemoConfirmed
                : () => setHasReauthToken(true),
            })
          }
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
          t(
            isGoogleStepUp
              ? "system:verificationNeeded.footLiveGoogle"
              : "system:verificationNeeded.footLive",
          )
        )}
      </p>
    </AuthLayout>
  );
}
