import { IMPACT_CARDS, type ImpactTint } from "./sustainer.data";
import styles from "./sustainer.module.css";

const DOT_CLASS: Record<ImpactTint, string> = {
  jade: styles.icDot!,
  accent: `${styles.icDot} ${styles.dotAccent}`,
  plumSoft: `${styles.icDot} ${styles.dotPlumSoft}`,
  jadeSoft: `${styles.icDot} ${styles.dotJadeSoft}`,
};

/** "What you're contributing to" — the four impact cards. */
export function SustainerImpact() {
  return (
    <>
      <h2 className={styles.secHead}>
        What you're <em>contributing to</em>
      </h2>
      <p className={styles.secSub}>
        Every euro goes directly into keeping this community running and cared
        for.
      </p>
      <div className={styles.impactGrid}>
        {IMPACT_CARDS.map((c) => (
          <div key={c.title} className={styles.impactCard}>
            <div className={DOT_CLASS[c.tint]} />
            <div className={styles.icTitle}>{c.title}</div>
            <div className={styles.icDesc}>{c.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}
