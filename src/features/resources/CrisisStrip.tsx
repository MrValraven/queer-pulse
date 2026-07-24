import { Link } from "react-router-dom";
import { FiAlertCircle, FiPhone } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CRISIS_LINES } from "./crisisStrip.data";
import styles from "./crisisStrip.module.css";

/**
 * High-contrast crisis panel placed near the top of the Wellbeing page.
 * Plum-panel emphasis treatment; tel: links so numbers are tap-to-call and
 * copy-paste friendly. Reusable within the resources feature.
 */
export function CrisisStrip() {
  const { t } = useTranslation();

  return (
    <section
      className={styles.section}
      aria-label={t("resources:crisis.ariaLabel")}
    >
      <div className="wrap">
        <div className={styles.panel}>
          <div className={styles.head}>
            <span className={styles.icon} aria-hidden>
              <FiAlertCircle />
            </span>
            <div>
              <h2 className={styles.title}>
                <Translation
                  i18nKey="resources:crisis.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <p className={styles.sub}>
                <Translation
                  i18nKey="resources:crisis.body"
                  components={{ strong: <strong /> }}
                />
              </p>
            </div>
          </div>

          <ul className={styles.lines}>
            {CRISIS_LINES.map((line) => (
              <li key={line.tel} className={styles.line}>
                <div className={styles.lineName}>{t(line.nameKey)}</div>
                <a className={styles.num} href={`tel:${line.tel}`}>
                  <FiPhone aria-hidden /> {line.display}
                </a>
                <div className={styles.hours}>{t(line.hoursKey)}</div>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link className={styles.jump} to="#crisis">
              {t("resources:crisis.jumpCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
