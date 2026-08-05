import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { QueueRow } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

export function AdminTriageQueue({ queue }: { queue: QueueRow[] }) {
  const { t } = useTranslation();

  // The rows are already ordered by triage urgency (safety → reports →
  // verifications → appeals). The old "Sorted by urgency" control was inert — it
  // only toasted its own label — so it's removed rather than faking a re-sort.
  return (
    <section className={styles.queueCard}>
      <div className={styles.secHead}>
        <h2 className={styles.secTitle}>
          <Translation
            i18nKey="admin:dashboard.triage.title"
            components={{ em: <em /> }}
          />
        </h2>
      </div>

      <div className={styles.queue}>
        {queue.map(
          ({ titleKey, subKey, subEmKey, count, tone, icon: Icon, to }) => (
            <Link key={titleKey} to={to} className={styles.qRow}>
              <span className={[styles.qIco, styles[`qIco_${tone}`]].join(" ")}>
                <Icon aria-hidden />
              </span>
              <span className={styles.qTx}>
                <span className={styles.qTitle}>{t(titleKey)}</span>
                <span className={styles.qSub}>
                  {t(subKey)} {subEmKey && <em>{t(subEmKey)}</em>}
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
