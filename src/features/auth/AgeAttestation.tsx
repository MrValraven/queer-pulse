import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
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
  return (
    <div className={styles.wrap}>
      <label className={styles.row} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmedChange(e.target.checked)}
        />
        <span className={styles.label}>I confirm I'm 18 or older.</span>
      </label>
      <p className={styles.helper}>
        QueerPulse is an adults-only community —{" "}
        <Link to={`${routes.terms}#eligibility`}>here's why</Link>. No ID
        needed; we trust you.{" "}
        <button type="button" className={styles.under18} onClick={onUnder18}>
          Not 18 yet?
        </button>
      </p>
    </div>
  );
}
