import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { BackToSettingsLink } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./MaintenancePage.module.css";

const AFFECTED: { up: boolean; textKey: string }[] = [
  { up: false, textKey: "system:maintenance.affected.web" },
  { up: false, textKey: "system:maintenance.affected.mobile" },
  { up: false, textKey: "system:maintenance.affected.email" },
];

export function MaintenancePage() {
  const { t } = useTranslation();

  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <BackToSettingsLink />

      <Link to={routes.homepage} className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        <Translation
          i18nKey="shared:brand.wordmark"
          components={{ em: <em /> }}
        />
      </Link>

      <div className={styles.wrap}>
        <span className={styles.eyebrow}>
          {t("system:maintenance.eyebrow")}
        </span>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="system:maintenance.heading"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="system:maintenance.lead"
            components={{ b: <b />, em: <em /> }}
          />
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLbl}>
              {t("system:maintenance.info.startedLabel")}
            </div>
            <div className={styles.infoVal}>
              <Translation
                i18nKey="system:maintenance.info.startedValue"
                components={{ em: <em /> }}
              />
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLbl}>
              {t("system:maintenance.info.backByLabel")}
            </div>
            <div className={styles.infoVal}>
              <Translation
                i18nKey="system:maintenance.info.backByValue"
                components={{ em: <em /> }}
              />
            </div>
          </div>
        </div>

        <div className={styles.affected}>
          <h4 className={styles.affectedTitle}>
            {t("system:maintenance.affected.title")}
          </h4>
          <ul className={styles.affectedList}>
            {AFFECTED.map((item) => (
              <li
                key={item.textKey}
                className={item.up ? styles.itemUp : styles.itemDown}
              >
                <Translation i18nKey={item.textKey} components={{ b: <b /> }} />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Button to={routes.status}>
            {t("system:maintenance.actions.statusCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>

        <p className={styles.meta}>
          <Translation
            i18nKey="system:maintenance.meta.line1"
            // eslint-disable-next-line jsx-a11y/anchor-has-content -- element template; <Translation> clones it with the link text at render time.
            components={{ a: <a href="https://status.queerpulse.app" /> }}
          />
          <br />
          {t("system:maintenance.meta.line2")}
        </p>
      </div>
    </div>
  );
}
