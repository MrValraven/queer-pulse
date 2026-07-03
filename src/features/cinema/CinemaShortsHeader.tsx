import { headerStats } from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Plum "Made here." banner with the stat tiles. */
export function CinemaShortsHeader() {
  return (
    <section className={styles.header}>
      <div className={`wrap ${styles.shInner}`}>
        <div>
          <div className={styles.shEb}>
            <span className={styles.live} aria-hidden />
            Community films · all free to watch
          </div>
          <h1 className={styles.shTitle}>
            Made <em>here</em>.
          </h1>
          <p className={styles.shSub}>
            Shorts, mid-lengths, and documentary works made by QueerPulse
            members. <em>Free to watch, paid to make.</em> Tip the filmmaker —
            100% goes to them.
          </p>
        </div>
        <div className={styles.shStats}>
          {headerStats.map((s) => (
            <div key={s.k} className={styles.shStat}>
              <div className={styles.k}>{s.k}</div>
              <div className={styles.v}>
                <em>{s.v}</em>
              </div>
              <div className={styles.note}>{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
