import { heroStats } from "./openCalls.data";
import styles from "./CinemaOpenCalls.module.css";

export function CinemaOpenCallsHero() {
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <div>
          <div className={styles.heroEb}>
            <span className={styles.live} aria-hidden />4 calls open now
          </div>
          <h1 className={styles.heroTitle}>
            Make the <em>next</em> one.
          </h1>
          <p className={styles.heroSub}>
            Commissions, residencies, and mentorships — funded by sustainers,
            paid by the co-op, distributed through the cinema.{" "}
            <em>Queer filmmakers only. Anyone can apply.</em>
          </p>
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <span className={styles.live} aria-hidden />
            Season 3 · spring/summer 2026
          </div>
          {heroStats.map((row) => (
            <div key={row.k} className={styles.sidebarRow}>
              <span className="k">{row.k}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
          <p className={styles.sidebarNote}>
            Funded by sustainers' subscriptions. Pool grows each month — every
            new sustainer adds ~€1.40 to the next season's fund.
          </p>
        </aside>
      </div>
    </section>
  );
}
