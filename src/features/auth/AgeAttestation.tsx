import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AgeAttestation.module.css";

interface AgeAttestationProps {
  /** Unique id so the checkbox and its label pair up (two forms use this). */
  id: string;
  /** Whether the "I'm 18 or older" box is ticked. */
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  /** Fired when the member says they're under 18 — surfaces the humane block. */
  onUnder18: () => void;
}

/**
 * The 18+ self-attestation control shared by request-invite and onboarding. A
 * warm, matter-of-fact checkbox — not an interrogation — with the legal basis
 * surfaced inline (linking to the Terms eligibility clause) and a quiet path out
 * for anyone who isn't 18 yet, so the ask reads as care, not gatekeeping.
 */
export function AgeAttestation({
  id,
  confirmed,
  onConfirmedChange,
  onUnder18,
}: AgeAttestationProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.wrap}>
      <label className={styles.row} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmedChange(e.target.checked)}
        />
        <span className={styles.label}>{t("auth:ageAttestation.confirmLabel")}</span>
      </label>
      <p className={styles.helper}>
        <Translation
          i18nKey="auth:ageAttestation.helper"
          components={{
            eligibility: <Link to={`${routes.terms}#eligibility`} />,
            under18: (
              <button type="button" className={styles.under18} onClick={onUnder18} />
            ),
          }}
        />
      </p>
    </div>
  );
}
