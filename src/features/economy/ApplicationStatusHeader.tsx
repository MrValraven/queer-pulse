import type { Cat } from "./applicationStatus.data";
import styles from "./ApplicationStatusPage.module.css";

export function ApplicationStatusHeader({
  activeCount,
  sentCount,
}: {
  activeCount: number;
  sentCount: number;
}) {
  return (
    <div className={styles.head}>
      <div>
        <div className={styles.eyebrow}>Your jobs</div>
        <h1 className={styles.h1}>
          Where everything <em>stands.</em>
        </h1>
        <p className={styles.sub}>
          Track every application, see how long companies have sat on yours, and
          know when to follow up.
        </p>
      </div>
      <div>
        <div className={styles.counter}>
          <em>{activeCount}</em>{" "}
          <span className={styles.counterSent}>/ {sentCount} sent</span>
        </div>
        <div className={styles.counterL}>Active applications</div>
      </div>
    </div>
  );
}

export function ApplicationStatusTabs({
  tabs,
  tab,
  setTab,
}: {
  tabs: { id: Cat | "all"; label: string; count: number }[];
  tab: Cat | "all";
  setTab: (t: Cat | "all") => void;
}) {
  return (
    <div className={styles.tabs}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={[styles.tab, tab === t.id && styles.tabActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setTab(t.id)}
        >
          {t.label} <span className={styles.tabCount}>{t.count}</span>
        </button>
      ))}
    </div>
  );
}

export function ApplicationStatusLegend() {
  return (
    <div className={styles.legend}>
      <span className={styles.legendLabel}>Tracker key</span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendDone}`} /> Done —
        this step is complete
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendActive}`} /> You
        are here — current step
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendUpcoming}`} />{" "}
        Upcoming — not started yet
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendClosed}`} /> Closed
        — ended or withdrawn
      </span>
    </div>
  );
}
