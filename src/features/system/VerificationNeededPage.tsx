import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../auth/AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import {
  ExpiredPanel,
  MagicLinkMethod,
  SuccessPanel,
} from "./VerificationNeededSections";
import { REAUTH_SECONDS } from "./verificationNeeded.data";
import styles from "./VerificationNeededPage.module.css";

type Stage = "input" | "verifying" | "success" | "expired";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function VerificationNeededPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("input");
  const [secondsLeft, setSecondsLeft] = useState(REAUTH_SECONDS);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Live re-auth countdown — pauses once verifying/done.
  useEffect(() => {
    if (stage !== "input") return;
    const iv = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(iv);
          setStage("expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [stage]);

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

  if (stage === "expired") {
    return (
      <AuthLayout>
        <ExpiredPanel onRestart={restart} />
      </AuthLayout>
    );
  }

  if (stage === "success") {
    return (
      <AuthLayout>
        <SuccessPanel onContinue={() => void navigate(routes.settings)} />
      </AuthLayout>
    );
  }

  const busy = stage === "verifying";
  const urgent = secondsLeft <= 60;

  return (
    <AuthLayout>
      <div className={styles.icon}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>

      <h1>
        <Translation
          i18nKey="system:verificationNeeded.heading"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.lead}>
        <Translation
          i18nKey="system:verificationNeeded.lead"
          components={{ b: <b /> }}
        />
      </p>

      <div className={styles.actionCard}>
        <div className={styles.actionIc}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <span>
          <Translation
            i18nKey="system:verificationNeeded.actionCard"
            components={{ b: <b /> }}
          />
        </span>
      </div>

      {/* One method, so no tablist. The password and authenticator tabs that
          used to sit here verified nothing — see VerificationNeededSections. */}
      <div className={styles.methodBody}>
        <MagicLinkMethod busy={busy} onVerify={handleVerify} />
      </div>

      <p className={styles.foot}>
        <Translation
          i18nKey="system:verificationNeeded.foot"
          values={{ time: fmt(secondsLeft) }}
          components={{
            b: (
              <b
                className={[styles.timer, urgent && styles.timerUrgent]
                  .filter(Boolean)
                  .join(" ")}
              />
            ),
          }}
        />
      </p>
    </AuthLayout>
  );
}
