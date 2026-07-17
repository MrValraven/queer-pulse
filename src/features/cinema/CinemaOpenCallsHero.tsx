import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { heroStats } from "./openCalls.data";
import styles from "./CinemaOpenCalls.module.css";

export function CinemaOpenCallsHero() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <div>
          <div className={styles.heroEb}>
            <span className={styles.live} aria-hidden />
            {t("cinema:openCallsStrip.eyebrow", { count: 4 })}
          </div>
          <h1 className={styles.heroTitle}>
            <Translation
              i18nKey="cinema:openCallsStrip.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.heroSub}>
            <Translation
              i18nKey="cinema:openCalls.hero.sub"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <span className={styles.live} aria-hidden />
            {t("cinema:openCalls.hero.seasonLabel")}
          </div>
          {heroStats.map((row) => (
            <div key={row.labelKey} className={styles.sidebarRow}>
              <span className="k">{t(row.labelKey)}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
          <p className={styles.sidebarNote}>
            {t("cinema:openCalls.hero.sidebarNote", {
              amount: fmt.currency(1.4),
            })}
          </p>
        </aside>
      </div>
    </section>
  );
}
