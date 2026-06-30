import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { TRIAGE_QUEUE } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

export function AdminTriageQueue() {
  const { showToast } = useToast();

  return (
    <section className={styles.queueCard}>
      <div className={styles.secHead}>
        <h2 className={styles.secTitle}>
          Needs <em>a human</em>
        </h2>
        <button
          type="button"
          className={styles.secLink}
          onClick={() => showToast("Sorted by urgency", "info")}
        >
          Sorted by urgency
        </button>
      </div>

      <div className={styles.queue}>
        {TRIAGE_QUEUE.map(
          ({ title, sub, subEm, count, tone, icon: Icon, to }) => (
            <Link key={title} to={to} className={styles.qRow}>
              <span className={[styles.qIco, styles[`qIco_${tone}`]].join(" ")}>
                <Icon aria-hidden />
              </span>
              <span className={styles.qTx}>
                <span className={styles.qTitle}>{title}</span>
                <span className={styles.qSub}>
                  {sub} {subEm && <em>{subEm}</em>}
                </span>
              </span>
              <span className={styles.qCount}>{count}</span>
              <FiArrowRight className={styles.qArrow} aria-hidden />
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
