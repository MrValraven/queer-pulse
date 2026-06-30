import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import type { StatusCard } from "./work.data";
import styles from "./WorkHubPage.module.css";

/** Per-silo status cards — each summarises state and deep-links into that area. */
export function WorkHubCards({ cards }: { cards: StatusCard[] }) {
  return (
    <div className={styles.grid}>
      {cards.map((c) => (
        <Link key={c.key} to={c.to} className={styles.card}>
          <span className={styles.cardIcon} aria-hidden>
            {c.icon}
          </span>
          <div className={styles.cardLabel}>{c.label}</div>
          <div className={styles.cardPrimary}>{c.primary}</div>
          <div className={styles.cardNext}>{c.next}</div>
          <span className={styles.cardArrow} aria-hidden>
            <FiArrowRight />
          </span>
        </Link>
      ))}
    </div>
  );
}
