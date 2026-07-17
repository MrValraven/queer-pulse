import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./auth.module.css";
import pageStyles from "./ConfirmEmailPage.module.css";

const DEMO_CODES = ["482931", "111111"];
const DEMO_EMAIL = "tomas@example.com";
const CODE_LENGTH = 6;

export function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [cooling, setCooling] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function handleInput(i: number, val: string) {
    const ch = val.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    setError(false);
    setMessage("");
    setMessageOk(false);
    if (ch && i < CODE_LENGTH - 1) inputRefs.current[i + 1]?.focus();
    const full = next.join("");
    if (full.length === CODE_LENGTH) checkCode(full);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1)
      inputRefs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    for (let j = 0; j < text.length; j++) next[j] = text[j];
    setDigits(next);
    const nx = Math.min(text.length, CODE_LENGTH - 1);
    inputRefs.current[nx]?.focus();
    const full = next.join("");
    if (full.length === CODE_LENGTH) checkCode(full);
  }

  function checkCode(full: string) {
    if (DEMO_CODES.includes(full)) {
      setMessage(t("auth:confirmEmail.verified"));
      setMessageOk(true);
      showToast(t("auth:confirmEmail.toastConfirmed"), "success");
      setTimeout(() => navigate(routes.welcome), 950);
    } else {
      setError(true);
      setMessage(t("auth:confirmEmail.codeMismatch"));
      setMessageOk(false);
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }

  function handleResend() {
    if (cooling) return;
    showToast(t("auth:confirmEmail.resendToast"), "info");
    setCooling(true);
    let secondsRemaining = 45;
    setTimer(secondsRemaining);
    timerRef.current = setInterval(() => {
      secondsRemaining--;
      setTimer(secondsRemaining);
      if (secondsRemaining <= 0) {
        clearInterval(timerRef.current!);
        setCooling(false);
        setTimer(0);
      }
    }, 1000);
  }

  return (
    <AuthLayout>
      <div className={pageStyles.envelope}>
        <svg
          viewBox="0 0 24 24"
          width={32}
          height={32}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x={3} y={5} width={18} height={14} rx={2.5} />
          <path d="m3 7 9 7 9-7" />
        </svg>
      </div>

      <h1>
        <Translation
          i18nKey="auth:confirmEmail.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.sub} style={{ marginBottom: 0 }}>
        <Translation
          i18nKey="auth:confirmEmail.sub"
          components={{
            strong: <strong style={{ color: "var(--ink)", fontWeight: 600 }} />,
          }}
          values={{ email: DEMO_EMAIL }}
        />
      </p>

      <div
        className={[pageStyles.codeRow, error ? pageStyles.codeRowError : ""]
          .filter(Boolean)
          .join(" ")}
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            value={d}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>

      <div
        className={[pageStyles.codeMsg, messageOk ? pageStyles.codeMsgOk : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {message}
      </div>

      <div className={pageStyles.auxRow}>
        <span>{t("auth:confirmEmail.didntGetCode")}</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooling}
          className={pageStyles.resend}
        >
          {cooling ? "" : t("auth:confirmEmail.resend")}
        </button>
        {cooling && (
          <span className={pageStyles.auxTimer}>
            {t("auth:confirmEmail.waitSeconds", { seconds: timer })}
          </span>
        )}
      </div>

      <p className={pageStyles.footLink}>
        <Translation
          i18nKey="auth:confirmEmail.wrongEmail"
          components={{ startOver: <Link to={routes.createAccount} /> }}
        />
      </p>
    </AuthLayout>
  );
}
