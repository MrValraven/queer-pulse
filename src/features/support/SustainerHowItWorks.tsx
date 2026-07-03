import { HOW_STEPS } from "./sustainer.data";
import styles from "./sustainer.module.css";

/** The four-step "how it works" strip — no lock-in, no small print. */
export function SustainerHowItWorks() {
  return (
    <div>
      <h2 className={`${styles.secHead} ${styles.secHeadSm}`}>
        How it <em>works</em>
      </h2>
      <p className={styles.secSub}>No lock-in, no small print games.</p>
      <div className={styles.howSteps}>
        {HOW_STEPS.map((label, i) => (
          <div key={label} className={styles.howStep}>
            <div className={styles.hsNum}>{i + 1}</div>
            <div className={styles.hsLabel}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
