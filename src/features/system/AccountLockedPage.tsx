import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AccountLockedPage.module.css";

/** Fixed demo incident identifiers — not language, kept as data. */
const INCIDENT_ID = "QP-8423-LOCK";
const INCIDENT_TIME = "14:08 WET";

export function AccountLockedPage() {
  const { t } = useTranslation();

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>

        <div className={styles.kicker}>{t("system:accountLocked.kicker")}</div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey="system:accountLocked.heading"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t("system:accountLocked.lead")}</p>

        <div className={styles.reasonList}>
          <div className={styles.reasonRow}>
            <div className={styles.reasonIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
            </div>
            <div className={styles.reasonText}>
              <Translation
                i18nKey="system:accountLocked.reason1"
                components={{ b: <b /> }}
              />
            </div>
          </div>
          <div className={styles.reasonRow}>
            <div className={styles.reasonIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 22s-8-4-8-12V4l8-2 8 2v6c0 8-8 12-8 12z" />
              </svg>
            </div>
            <div className={styles.reasonText}>
              <Translation
                i18nKey="system:accountLocked.reason2"
                components={{ b: <b /> }}
              />
            </div>
          </div>
          <div className={styles.reasonRow}>
            <div className={styles.reasonIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
            <div className={styles.reasonText}>
              <Translation
                i18nKey="system:accountLocked.reason3"
                components={{ b: <b /> }}
              />
            </div>
          </div>
        </div>

        <div className={styles.whatNow}>
          <Link to={routes.contact} className={styles.wnRow}>
            <div className={styles.wnNum}>1</div>
            <div className={styles.wnText}>
              <div className={styles.wnTitle}>
                {t("system:accountLocked.whatNow.contact.title")}
              </div>
              <div className={styles.wnDesc}>
                {t("system:accountLocked.whatNow.contact.desc")}
              </div>
            </div>
            <span className={styles.wnArrow} aria-hidden>
              →
            </span>
          </Link>
        </div>

        <div className={styles.foot}>
          <span>
            <Translation
              i18nKey="system:accountLocked.foot.incident"
              values={{ id: INCIDENT_ID, time: INCIDENT_TIME }}
              components={{
                idTag: <span className={styles.incidentId} />,
              }}
            />
          </span>
          <span>
            <Link to={routes.help}>
              {t("system:accountLocked.foot.whyLink")}
            </Link>
          </span>
        </div>
      </div>
    </SystemStateShell>
  );
}
