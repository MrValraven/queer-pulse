import styles from "./CinemaRightsPage.module.css";
import { shortVersion } from "./cinemaRights.data";

export function RightsHero() {
  return (
    <section className={styles.header}>
      <div className={`wrap ${styles.headInner}`}>
        <div>
          <div className={styles.headEb}>For filmmakers · your rights</div>
          <h1 className={styles.headTitle}>
            Your film <em>stays yours</em>.
          </h1>
          <p className={styles.headSub}>
            Everything about how the co-op treats your work — the split, the
            contract, what we can and can't do, how you leave if you want to.{" "}
            <em>Plain language, no asterisks.</em>
          </p>
        </div>
        <div className={styles.shortCard}>
          <div className={styles.shortHead}>The short version</div>
          {shortVersion.map((row) => (
            <div key={row.k} className={styles.shortRow}>
              <span className={styles.shortK}>{row.k}</span>
              <span className={styles.shortV}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
