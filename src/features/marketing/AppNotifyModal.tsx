import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MarketingModal.module.css";

export type AppPlatform = "iOS" | "Android";

export function AppNotifyModal({
  platform,
  onClose,
}: {
  platform: AppPlatform;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  useScrollLock();

  // Focus moves into the dialog on open — correct for a modal, and announced as
  // such because the move happens on mount rather than mid-page via autofocus.
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const valid = /.+@.+\..+/.test(email);
  const store = platform === "iOS" ? "App Store" : "Google Play";

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${sent ? styles.modalSuccess : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("marketing:appNotify.ariaLabel")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("marketing:appNotify.close")}
        >
          ×
        </button>

        {sent ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            </div>
            <h2>
              <Translation
                i18nKey="marketing:appNotify.success.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>
              <Translation
                i18nKey="marketing:appNotify.success.body"
                components={{ b: <b /> }}
                values={{ platform, email }}
              />
            </p>
            <Button size="lg" variant="ghost-dark" onClick={onClose}>
              {t("marketing:appNotify.close")}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) setSent(true);
            }}
          >
            <div className={styles.eye}>
              {t("marketing:appNotify.eyebrow", { store })}
            </div>
            <h2 className={styles.title}>
              <Translation
                i18nKey="marketing:appNotify.title"
                components={{ em: <em /> }}
                values={{ platform }}
              />
            </h2>
            <p className={styles.lead}>
              {t("marketing:appNotify.lead", { platform })}
            </p>
            <div className={styles.field}>
              <label htmlFor="notify-email">
                {t("marketing:appNotify.emailLabel")}{" "}
                <span className={styles.req}>*</span>
              </label>
              <input
                ref={emailRef}
                id="notify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <span className={styles.hint}>
                {t("marketing:appNotify.emailHint")}
              </span>
            </div>
            <div className={styles.foot}>
              <button type="button" className={styles.back} onClick={onClose}>
                {t("marketing:appNotify.maybeLaterCta")}
              </button>
              <Button size="lg" type="submit" disabled={!valid}>
                {t("marketing:appNotify.notifyCta")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
