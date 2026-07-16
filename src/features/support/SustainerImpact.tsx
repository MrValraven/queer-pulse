import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { IMPACT_CARDS, type ImpactTint } from "./sustainer.data";
import styles from "./sustainer.module.css";

const DOT_CLASS: Record<ImpactTint, string> = {
  jade: styles.icDot!,
  accent: `${styles.icDot} ${styles.dotAccent}`,
  plumSoft: `${styles.icDot} ${styles.dotPlumSoft}`,
  jadeSoft: `${styles.icDot} ${styles.dotJadeSoft}`,
};

/** "What you're contributing to" — the four impact cards. */
export function SustainerImpact() {
  const { t } = useTranslation();
  return (
    <>
      <h2 className={styles.secHead}>
        <Translation
          i18nKey="support:impact.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.secSub}>{t("support:impact.sub")}</p>
      <div className={styles.impactGrid}>
        {IMPACT_CARDS.map((c) => (
          <div key={c.titleKey} className={styles.impactCard}>
            <div className={DOT_CLASS[c.tint]} />
            <div className={styles.icTitle}>{t(c.titleKey)}</div>
            <div className={styles.icDesc}>{t(c.descKey)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
