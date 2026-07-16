import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TRIAGE_QUEUE } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

export function AdminTriageQueue() {
  const { showToast } = useToast();
  const { t } = useTranslation();

  return (
    <section className={styles.queueCard}>
      <div className={styles.secHead}>
        <h2 className={styles.secTitle}>
          <Translation
            i18nKey="admin:dashboard.triage.title"
            components={{ em: <em /> }}
          />
        </h2>
        <button
          type="button"
          className={styles.secLink}
          onClick={() =>
            showToast(t("admin:dashboard.triage.sortedToast"), "info")
          }
        >
          {t("admin:dashboard.triage.sortedToast")}
        </button>
      </div>

      <div className={styles.queue}>
        {TRIAGE_QUEUE.map(
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
