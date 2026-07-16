import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MagicLinkPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = touched && email.trim().length > 0 && !emailValid;

  function startCooldown() {
    let t = 30;
    setCooldown(t);
    timerRef.current = setInterval(() => {
      t--;
      setCooldown(t);
      if (t <= 0) {
        clearInterval(timerRef.current!);
        setCooldown(0);
      }
    }, 1000);
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) return;
    setSent(true);
    startCooldown();
  }

  function handleResend() {
    showToast(t("auth:confirmEmail.resendToast"), "info");
    startCooldown();
  }

  if (sent) {
    return (
      <AuthLayout>
        <div
          className={styles.screenIn}
          style={{ textAlign: "center", paddingTop: 18 }}
        >
          <div className={styles.sentIc}>
            <svg
              viewBox="0 0 24 24"
              width={32}
              height={32}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
          </div>
          <h1>
            <Translation i18nKey="auth:magicLink.sentTitle" components={{ em: <em /> }} />
          </h1>
          <p
            className={styles.sub}
            style={{ maxWidth: "30ch", margin: "0 auto 24px" }}
          >
            <Translation
              i18nKey="auth:magicLink.sentBody"
              components={{
                strong: <strong style={{ color: "var(--ink)", fontWeight: 600 }} />,
              }}
              values={{ email }}
            />
          </p>
          <p
            style={{
              fontSize: 12.5,
              color: "var(--ink-40)",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {t("auth:magicLink.resendPromptPrefix")}{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              style={{
                background: "none",
                border: "none",
                cursor: cooldown > 0 ? "not-allowed" : "pointer",
                color: cooldown > 0 ? "var(--ink-40)" : "var(--plum)",
                fontWeight: 600,
                fontFamily: "var(--sans)",
                fontSize: 13.5,
                padding: "4px 0",
              }}
            >
              {cooldown > 0
                ? t("auth:magicLink.resendIn", { seconds: cooldown })
                : t("auth:magicLink.resendLink")}
            </button>
          </p>
          <div className={styles.footer}>
            <Link
              to={routes.signIn}
              style={{
                fontSize: 13.5,
                color: "var(--ink-60)",
                fontWeight: 500,
              }}
            >
              {t("auth:magicLink.useDifferentMethod")}
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1>
        <Translation i18nKey="auth:magicLink.title" components={{ em: <em /> }} />
      </h1>
      <p className={styles.sub}>{t("auth:magicLink.sub")}</p>

      <form onSubmit={handleSend}>
        <div className={styles.field}>
          <label htmlFor="ml-email">{t("auth:magicLink.emailLabel")}</label>
          <div className={styles.fieldWrap}>
            <input
              id="ml-email"
              type="email"
              placeholder={t("auth:magicLink.emailPlaceholder")}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
            />
          </div>
          {emailError && (
            <span
              style={{
                fontSize: 12.5,
                color: "var(--accent-ink)",
                fontWeight: 500,
              }}
            >
              {t("auth:magicLink.emailError")}
            </span>
          )}
        </div>

        <Button type="submit" className={styles.authBtn} disabled={!emailValid}>
          {t("auth:magicLink.submit")}
        </Button>
      </form>

      <div className={styles.divider}>{t("auth:magicLink.dividerOr")}</div>

      <div className={styles.footer}>
        <Link
          to={routes.signIn}
          className={styles.signinLink}
          style={{ color: "var(--plum)", fontWeight: 600, fontSize: 13.5 }}
        >
          {t("auth:magicLink.signInWithPassword")}
        </Link>
        <Link
          to={routes.requestInvite}
          style={{ fontSize: 13.5, color: "var(--ink-60)", fontWeight: 500 }}
        >
          {t("auth:magicLink.notAMemberPrompt")}
        </Link>
      </div>
    </AuthLayout>
  );
}
