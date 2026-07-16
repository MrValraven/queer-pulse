import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { headerStats } from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Plum "Made here." banner with the stat tiles. */
export function CinemaShortsHeader() {
  const { t } = useTranslation();
  return (
    <section className={styles.header}>
      <div className={`wrap ${styles.shInner}`}>
        <div>
          <div className={styles.shEb}>
            <span className={styles.live} aria-hidden />
            {t("cinema:shorts.header.eyebrow")}
          </div>
          <h1 className={styles.shTitle}>
            <Translation
              i18nKey="cinema:madeHere.title"
              components={{ em: <em /> }}
            />
            .
          </h1>
          <p className={styles.shSub}>
            <Translation
              i18nKey="cinema:shorts.header.sub"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <div className={styles.shStats}>
          {headerStats.map((s) => (
            <div key={s.k} className={styles.shStat}>
              <div className={styles.k}>{s.k}</div>
              <div className={styles.v}>
                <em>{s.v}</em>
              </div>
              <div className={styles.note}>{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
