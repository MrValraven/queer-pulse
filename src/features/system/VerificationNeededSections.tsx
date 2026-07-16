import { useState } from "react";
import { FiArrowRight, FiCheck, FiMail, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { REAUTH_EMAIL, RESEND_COOLDOWN } from "./verificationNeeded.data";
import styles from "./VerificationNeededPage.module.css";

/**
 * Re-authentication panes.
 *
 * This page once offered three "methods": a password box, a 6-digit
 * authenticator code, and a magic link. Two of them were fiction. The password
 * input verified nothing — its submit handler called `onVerify()` straight
 * through, and QueerPulse accounts have no password at all (Google OAuth +
 * invite), so it existed only to make password managers offer to save a
 * credential that doesn't exist. The authenticator pane matched against a
 * hardcoded demo constant and referenced 2FA the platform has never had. Both
 * are gone; the magic link is the one method whose story matches reality.
 */

function Spinner() {
  return <span className={styles.spinner} aria-hidden />;
}

/* ── Magic link ───────────────────────────────────────────── */
export function MagicLinkMethod({
  busy,
  onVerify,
}: {
  busy: boolean;
  onVerify: () => void;
}) {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function startCooldown() {
    let secondsRemaining = RESEND_COOLDOWN;
    setCooldown(secondsRemaining);
    const iv = setInterval(() => {
      secondsRemaining--;
      setCooldown(secondsRemaining);
      if (secondsRemaining <= 0) clearInterval(iv);
    }, 1000);
  }

  function send() {
    if (sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      startCooldown();
    }, 1000);
  }

  if (!sent) {
    return (
      <div className={styles.magicIntro}>
        <p className={styles.magicCopy}>
          <Translation
            i18nKey="system:verificationNeeded.magicLink.intro"
            values={{ email: REAUTH_EMAIL }}
            components={{ b: <b /> }}
          />
        </p>
        <Button className={styles.confirmBtn} onClick={send} disabled={sending}>
          {sending ? (
            <>
              <Spinner /> {t("system:verificationNeeded.magicLink.sendingCta")}
            </>
          ) : (
            <>{t("system:verificationNeeded.magicLink.sendCta")}</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.sentBox}>
      <div className={styles.sentIc}>
        <FiMail aria-hidden />
      </div>
      <p className={styles.sentTitle}>
        {t("system:verificationNeeded.magicLink.sentTitle")}
      </p>
      <p className={styles.magicCopy}>
        <Translation
          i18nKey="system:verificationNeeded.magicLink.sentCopy"
          values={{ email: REAUTH_EMAIL }}
          components={{ b: <b /> }}
        />
      </p>
      <Button className={styles.confirmBtn} onClick={onVerify} disabled={busy}>
        {busy ? (
          <>
            <Spinner /> {t("system:verificationNeeded.magicLink.verifyingCta")}
          </>
        ) : (
          <>
            {t("system:verificationNeeded.magicLink.confirmCta")}{" "}
            <FiArrowRight aria-hidden />
          </>
        )}
      </Button>
      <button
        type="button"
        className={styles.resendBtn}
        onClick={send}
        disabled={cooldown > 0 || sending}
      >
        <FiRefreshCw aria-hidden />
        {cooldown > 0
          ? t("system:verificationNeeded.magicLink.resendCountdown", {
              seconds: cooldown,
            })
          : t("system:verificationNeeded.magicLink.resendCta")}
      </button>
    </div>
  );
}

/* ── Success ──────────────────────────────────────────────── */
// Kept local (not the shared ui SuccessPanel): the continue CTA carries a
// trailing <FiArrowRight> glyph, but the shared panel's closeLabel is typed as
// a plain string, so props don't map cleanly. Already follows the success
// pattern (jade tick, coral <em>).
export function SuccessPanel({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIc}>
        <FiCheck aria-hidden />
      </div>
      <h2 className={styles.successTitle}>
        <Translation
          i18nKey="system:verificationNeeded.success.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.successSub}>
        {t("system:verificationNeeded.success.sub")}
      </p>
      <Button
        variant="ghost-dark"
        className={styles.successBtn}
        onClick={onContinue}
      >
        {t("system:verificationNeeded.success.continueCta")}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

/* ── Expired ──────────────────────────────────────────────── */
export function ExpiredPanel({ onRestart }: { onRestart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.expired}>
      <div className={styles.expiredIc}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
      <h2 className={styles.expiredTitle}>
        <Translation
          i18nKey="system:verificationNeeded.expired.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.expiredSub}>
        {t("system:verificationNeeded.expired.sub")}
      </p>
      <Button variant="primary" onClick={onRestart}>
        {t("system:verificationNeeded.expired.restartCta")}
      </Button>
    </div>
  );
}
