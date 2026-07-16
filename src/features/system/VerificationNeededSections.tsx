import { useState } from "react";
import { FiArrowRight, FiCheck, FiMail, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function startCooldown() {
    let t = RESEND_COOLDOWN;
    setCooldown(t);
    const iv = setInterval(() => {
      t--;
      setCooldown(t);
      if (t <= 0) clearInterval(iv);
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
          We’ll email a one-time confirmation link to <b>{REAUTH_EMAIL}</b>.
          Open it on this device to confirm it’s you.
        </p>
        <Button className={styles.confirmBtn} onClick={send} disabled={sending}>
          {sending ? (
            <>
              <Spinner /> Sending link…
            </>
          ) : (
            <>Email me a confirmation link</>
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
      <p className={styles.sentTitle}>Link on its way</p>
      <p className={styles.magicCopy}>
        Tap the link we sent to <b>{REAUTH_EMAIL}</b>, then come back here.
      </p>
      <Button className={styles.confirmBtn} onClick={onVerify} disabled={busy}>
        {busy ? (
          <>
            <Spinner /> Verifying…
          </>
        ) : (
          <>
            I’ve opened the link <FiArrowRight aria-hidden />
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
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
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
  return (
    <div className={styles.success}>
      <div className={styles.successIc}>
        <FiCheck aria-hidden />
      </div>
      <h2 className={styles.successTitle}>
        It’s you — <em>verified.</em>
      </h2>
      <p className={styles.successSub}>
        Re-authentication confirmed. Taking you on to cancel your membership…
      </p>
      <Button
        variant="ghost-dark"
        className={styles.successBtn}
        onClick={onContinue}
      >
        Continue now <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

/* ── Expired ──────────────────────────────────────────────── */
export function ExpiredPanel({ onRestart }: { onRestart: () => void }) {
  return (
    <div className={styles.expired}>
      <div className={styles.expiredIc}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
      <h2 className={styles.expiredTitle}>
        This check <em>timed out.</em>
      </h2>
      <p className={styles.expiredSub}>
        For your security, re-authentication only stays open for a few minutes.
        Start again to continue.
      </p>
      <Button variant="primary" onClick={onRestart}>
        Start over
      </Button>
    </div>
  );
}
