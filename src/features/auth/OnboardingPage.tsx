import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./OnboardingPage.module.css";
import { TOTAL_STEPS } from "./onboardingPage.data";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useScopedLocalStorage } from "../../app/providers/useScopedLocalStorage";
import { useStorageScope } from "../../app/providers/useStorageScope";
import { safeStorage } from "../../shared/storage/safeStorage";
import { usePlatformStatus } from "../../shared/api/usePlatformStatus";
import { postCompleteOnboarding } from "./api/auth.api";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FeatureHelp } from "../../shared/components/ui";
import { StepIntro, StepNorms, StepDone } from "./OnboardingSteps";
import { StepIntents } from "./StepIntents";
import { StepWelcome } from "./StepWelcome";
import { StepPhoto } from "./StepPhoto";
import { StepCommunities } from "./StepCommunities";
import { StepWork } from "./StepWork";

// Per-member resume marker: the current step is persisted so an abandoned
// onboarding picks up where it left off instead of restarting at step 0.
// `useScopedLocalStorage` namespaces it by user id (`${key}.u.<id>`), so a
// shared device never surfaces one member's progress to the next. Never written
// in demo mode (scope forced to null below).
const ONBOARDING_STEP_KEY = "qp.onboarding.step";

/** Guard a persisted step: only an in-range integer index is restored; anything
 *  else (corrupt payload, an out-of-range value after TOTAL_STEPS shrank) resets
 *  to the intro rather than dropping the member onto a missing step. */
function isValidStepIndex(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < TOTAL_STEPS
  );
}

export function OnboardingPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { markOnboarded } = useAuth();
  // The revision to stamp on completion — read from the live platform status
  // rather than a hardcoded local constant, so the frontend never drifts from
  // the backend's own CURRENT_GUIDELINES_VERSION. `postCompleteOnboarding`
  // treats `undefined` (query not yet settled) as "use the server's current
  // version", which is the correct answer either way.
  const guidelinesVersion = usePlatformStatus().data?.guidelinesVersion;

  // Eight steps in total, indexed 0–7. Step 0 is the warm "let's begin" intro,
  // counted as Step 1 so the "Step X of N" label is honest and continuous.
  // Live members resume their saved step; demo mode forces the scope to null so
  // nothing is persisted and the flow always previews from the start.
  const storageScope = useStorageScope();
  const persistScope = demoMode ? null : storageScope;
  const [step, setStep] = useScopedLocalStorage<number>(
    ONBOARDING_STEP_KEY,
    persistScope,
    0,
    isValidStepIndex,
  );
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  // The step card is remounted on every step (`key={step}`), which drops focus to
  // <body>; this ref lets us move focus back into the fresh step for keyboard/SR
  // users (see the effect below).
  const cardRef = useRef<HTMLDivElement>(null);

  // Reaching the final step (StepDone) is what "finished onboarding" means:
  // stamp it on the member so the auth gate keeps them out of this one-time
  // wizard on a later visit (e.g. browser-autofilled /auth/onboarding). Fired
  // once per successful attempt, never in demo mode (no backend). The server
  // call is idempotent, so a stray double-fire is harmless.
  const stampedRef = useRef(false);
  const [hasStampFailed, setHasStampFailed] = useState(false);
  const stampCompletion = useCallback(() => {
    if (demoMode || stampedRef.current) return;
    stampedRef.current = true;
    void postCompleteOnboarding(guidelinesVersion)
      .then(({ onboardedAt }) => {
        // Reflect the stamp on the cached user immediately, so the one-time gate
        // won't replay the wizard later in this session (e.g. browser autofill of
        // the saved /auth/onboarding URL) off a stale `onboardedAt: null`.
        markOnboarded(onboardedAt);
        setHasStampFailed(false);
        // Only NOW is onboarding genuinely finished — drop the resume marker so
        // a later visit never reopens the wizard mid-flow. Clearing it on
        // failure too (the old `.finally`) was the worst of both: the gate still
        // bounced the member back in on `onboardedAt: null`, and with the marker
        // gone they restarted at step 0 and re-ran every save. The hook offers no
        // remove, so we clear its per-user bucket key directly (this path is
        // always live with a real scope; the key mirrors
        // `useScopedLocalStorage`'s `${base}.u.<id>`).
        if (persistScope) {
          safeStorage.remove(`${ONBOARDING_STEP_KEY}.u.${persistScope}`);
        }
      })
      .catch(() => {
        // Offline on the last step is common on mobile. Release the guard so the
        // member can retry from StepDone, keep the resume marker, and say so
        // rather than swallowing it.
        stampedRef.current = false;
        setHasStampFailed(true);
      });
  }, [demoMode, markOnboarded, persistScope, guidelinesVersion]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    stampCompletion();
  }, [step, stampCompletion]);

  // Focus management: on each step transition the `key={step}` remount drops
  // focus to <body>, so keyboard and screen-reader users lose their place. Move
  // focus into the fresh step container instead. `preventScroll` stops a
  // competing focus-scroll — `go()` sets the scroll position explicitly — which
  // keeps the transition calm and reduced-motion friendly.
  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, [step]);

  // Linear progress: each of the TOTAL_STEPS advances the bar by an equal share.
  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const stepLabel = t("auth:onboarding.stepLabel", {
    current: step + 1,
    total: TOTAL_STEPS,
  });

  function go(next: number) {
    setDir(next >= step ? "fwd" : "back");
    setStep(next);
    window.scrollTo(0, 0);
  }

  return (
    <div className={styles.root}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.progressLabel}>
        {stepLabel}
        <FeatureHelp id="auth.onboarding" />
      </div>
      <Link to={routes.homepage} className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        {"Queer"}
        <em>{"Pulse"}</em>
      </Link>

      <div className={styles.page}>
        <div
          ref={cardRef}
          tabIndex={-1}
          className={`${styles.card} ${dir === "back" ? styles.cardBack : styles.cardFwd}`}
          key={step}
        >
          {step === 0 && (
            <StepIntro stepLabel={stepLabel} onNext={() => go(1)} />
          )}
          {step === 1 && (
            <StepWelcome
              stepLabel={stepLabel}
              onNext={() => go(2)}
              onBack={() => go(0)}
            />
          )}
          {step === 2 && (
            <StepPhoto
              stepLabel={stepLabel}
              onNext={() => go(3)}
              onBack={() => go(1)}
            />
          )}
          {step === 3 && (
            <StepNorms
              stepLabel={stepLabel}
              onNext={() => go(4)}
              onBack={() => go(2)}
            />
          )}
          {step === 4 && (
            <StepIntents
              stepLabel={stepLabel}
              onNext={() => go(5)}
              onBack={() => go(3)}
            />
          )}
          {step === 5 && (
            <StepWork
              stepLabel={stepLabel}
              onNext={() => go(6)}
              onBack={() => go(4)}
            />
          )}
          {step === 6 && (
            <StepCommunities
              stepLabel={stepLabel}
              onNext={() => go(7)}
              onBack={() => go(5)}
            />
          )}
          {step === 7 && (
            <StepDone
              stepLabel={stepLabel}
              hasStampFailed={hasStampFailed}
              onRetryStamp={stampCompletion}
            />
          )}
        </div>
      </div>
    </div>
  );
}
