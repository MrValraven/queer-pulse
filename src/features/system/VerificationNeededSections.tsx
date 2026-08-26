import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { REAUTH_EMAIL } from "./verificationNeeded.data";
import styles from "./VerificationNeededPage.module.css";

/**
 * Re-authentication panes.
 *
 * This page once offered three "methods": a password box, a 6-digit
 * authenticator code, and a magic link. All three were fiction. The password
 * input verified nothing — its submit handler called `onVerify()` straight
 * through, and QueerPulse accounts have no password at all (Google OAuth +
 * invite), so it existed only to make password managers offer to save a
 * credential that doesn't exist. The authenticator pane matched against a
 * hardcoded demo constant and referenced 2FA the platform has never had. The
 * magic link offered to "email a one-time confirmation link": its send button
 * was a `setTimeout`, and QueerPulse delivers no email, so the link it
 * promised could never arrive.
 *
 * All three are gone. What is left is a single confirm step that tells the
 * truth about the real mechanism: step-up re-auth on QueerPulse is a Google
 * sign-in round trip (`beginReauth()` in `features/settings/api/
 * useReauthToken.ts`), which is what the live surfaces that need it
 * (DeleteAccountSection, AccountDataExport, useDsar) actually call. This
 * page itself is a prototype preview: nothing links to it outside the
 * dev-only simulations gallery, and its confirm button still resolves
 * locally rather than leaving for Google.
 */

function Spinner() {
  return <span className={styles.spinner} aria-hidden />;
}

/* ── Confirm it's you ─────────────────────────────────────── */
export function ConfirmMethod({
  busy,
  onVerify,
}: {
  busy: boolean;
  onVerify: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.magicIntro}>
      <p className={styles.magicCopy}>
        <Translation
          i18nKey="system:verificationNeeded.confirm.intro"
          values={{ email: REAUTH_EMAIL }}
          components={{ b: <b /> }}
        />
      </p>
      <Button className={styles.confirmBtn} onClick={onVerify} disabled={busy}>
        {busy ? (
          <>
            <Spinner /> {t("system:verificationNeeded.confirm.verifyingCta")}
          </>
        ) : (
          <>
            {t("system:verificationNeeded.confirm.cta")}{" "}
            <FiArrowRight aria-hidden />
          </>
        )}
      </Button>
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
