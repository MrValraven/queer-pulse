import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StatusCard } from "./work.data";
import styles from "./WorkHubPage.module.css";

/** Per-silo status cards — each summarises state and deep-links into that area. */
export function WorkHubCards({ cards }: { cards: StatusCard[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.grid}>
      {cards.map((c) => (
        <Link key={c.key} to={c.to} className={styles.card}>
          <span className={styles.cardIcon} aria-hidden>
            {c.icon}
          </span>
          <div className={styles.cardLabel}>{t(c.labelKey)}</div>
          <div className={styles.cardPrimary}>
            {t(c.primaryKey, c.primaryValues)}
          </div>
          <div className={styles.cardNext}>{t(c.nextKey, c.nextValues)}</div>
          <span className={styles.cardArrow} aria-hidden>
            <FiArrowRight />
          </span>
        </Link>
      ))}
    </div>
  );
}
