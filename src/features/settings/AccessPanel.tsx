import { ACCESS_ITEMS } from "./membership.data";
import { CheckIcon } from "./MembershipIcons";
import styles from "./MembershipPage.module.css";

export function AccessPanel() {
  return (
    <div className={styles.panel}>
      <p className={styles.accessLead}>
        Everything your Sustaining membership unlocks. Changing tiers doesn't
        affect access until the current cycle ends.
      </p>
      <div className={styles.acList}>
        {ACCESS_ITEMS.map((item) => (
          <div key={item.label} className={styles.acItem}>
            <div className={styles.acIc}>
              <CheckIcon />
            </div>
            <span className={styles.acLabel}>{item.label}</span>
            <span className={styles.acNote}>{item.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
