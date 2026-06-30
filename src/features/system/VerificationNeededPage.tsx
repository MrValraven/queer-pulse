import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../auth/AuthLayout";
import { routes } from "../../app/routeMap";
import {
  CodeMethod,
  ExpiredPanel,
  MagicLinkMethod,
  PasswordMethod,
  SuccessPanel,
} from "./VerificationNeededSections";
import {
  REAUTH_SECONDS,
  VERIFY_TABS,
  type VerifyMethod,
} from "./verificationNeeded.data";
import styles from "./VerificationNeededPage.module.css";

type Stage = "input" | "verifying" | "success" | "expired";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function VerificationNeededPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<VerifyMethod>("password");
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
    timers.current.push(
      setTimeout(() => navigate(routes.cancelMembership), 2700),
    );
  }

  function restart() {
    setStage("input");
    setMethod("password");
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
        <SuccessPanel onContinue={() => navigate(routes.cancelMembership)} />
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
        Quick check · <em>is this still you?</em>
      </h1>
      <p className={styles.lead}>
        For your next step we need to confirm it’s still you on this device.{" "}
        <b>This is one of three actions</b> we re-auth for: changing your
        password, cancelling membership, or removing your account.
      </p>

      <div className={styles.actionCard}>
        <div className={styles.actionIc}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <span>
          You’re about to <b>cancel your Sustainer membership</b>
        </span>
      </div>

      <div
        className={styles.methods}
        role="tablist"
        aria-label="Verification method"
      >
        {VERIFY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={method === tab.value}
            disabled={busy}
            className={[
              styles.methodTab,
              method === tab.value && styles.methodTabActive,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setMethod(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div key={method} className={styles.methodBody}>
        {method === "password" && (
          <PasswordMethod busy={busy} onVerify={handleVerify} />
        )}
        {method === "2fa" && <CodeMethod busy={busy} onVerify={handleVerify} />}
        {method === "magic" && (
          <MagicLinkMethod busy={busy} onVerify={handleVerify} />
        )}
      </div>

      <p className={styles.foot}>
        This re-auth expires in{" "}
        <b
          className={[styles.timer, urgent && styles.timerUrgent]
            .filter(Boolean)
            .join(" ")}
        >
          {fmt(secondsLeft)}
        </b>
        .
      </p>
    </AuthLayout>
  );
}
