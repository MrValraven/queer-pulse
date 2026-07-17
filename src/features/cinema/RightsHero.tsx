import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CinemaRightsPage.module.css";
import { shortVersionRows } from "./cinemaRights.data";

export function RightsHero() {
  const { t } = useTranslation();
  return (
    <section className={styles.header}>
      <div className={`wrap ${styles.headInner}`}>
        <div>
          <div className={styles.headEb}>{t("cinema:rights.hero.eyebrow")}</div>
          <h1 className={styles.headTitle}>
            <Translation
              i18nKey="cinema:rights.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.headSub}>
            <Translation
              i18nKey="cinema:rights.hero.sub"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <div className={styles.shortCard}>
          <div className={styles.shortHead}>
            {t("cinema:rights.hero.shortVersionHeading")}
          </div>
          {shortVersionRows.map((row) => (
            <div key={row.labelKey} className={styles.shortRow}>
              <span className={styles.shortK}>{t(row.labelKey)}</span>
              <span className={styles.shortV}>
                <Translation
                  i18nKey={row.valueKey}
                  components={{ em: <em /> }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
