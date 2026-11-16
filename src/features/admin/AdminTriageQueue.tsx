import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPanel, adminTableClasses } from "./ui";
import type { QueueRow } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

export function AdminTriageQueue({ queue }: { queue: QueueRow[] }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  // The rows are already ordered by triage urgency (safety, then reports,
  // verifications, appeals), so the list carries no sort control.
  return (
    <AdminPanel
      title={
        <Translation
          i18nKey="admin:dashboard.triage.title"
          components={{ em: <em /> }}
        />
      }
      padding="flush"
    >
      <div className={styles.rowList}>
        {queue.map(
          ({ titleKey, subKey, subEmKey, count, tone, icon: Icon, to }) => (
            <Link
              key={titleKey}
              to={to}
              className={`${adminTableClasses.row} ${styles.qRow}`}
            >
              <span className={[styles.qIco, styles[`tone_${tone}`]].join(" ")}>
                <Icon aria-hidden />
              </span>
              <span className={styles.qTx}>
                <span className={styles.qTitle}>{t(titleKey)}</span>
                <span className={styles.qSub}>
                  {t(subKey)} {subEmKey && <em>{t(subEmKey)}</em>}
                </span>
              </span>
              <span className={`${adminTableClasses.numeric} ${styles.qCount}`}>
                <RollingNumber value={fmt.number(count)} numericValue={count} />
              </span>
              <FiArrowRight className={styles.qArrow} aria-hidden />
            </Link>
          ),
        )}
      </div>
    </AdminPanel>
  );
}
