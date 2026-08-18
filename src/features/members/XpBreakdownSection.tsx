import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRecognition } from "./api/useRecognition";
import { xpSourceMetaFor } from "./xpBreakdown.data";
import styles from "./BadgesPage.module.css";

/**
 * "What you did to earn it" — every XP source, earned or not, each showing
 * progress (units of cap) and the XP it's contributed. Unlike the Getting
 * Started page's top-3 teaser, this lists all sources so a member can see
 * what's still available, not just what they've already done.
 */
export function XpBreakdownSection() {
  const { t } = useTranslation();
  const { xpBreakdown } = useRecognition();
  if (xpBreakdown.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionRow}>
        <h2 className={styles.sectionHead}>
          <Translation
            i18nKey="members:badges.xpBreakdown.heading"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      <div className={styles.sectionSub}>
        {t("members:badges.xpBreakdown.sub")}
      </div>
      <div className={styles.xpBreakdownList}>
        {xpBreakdown.map((source) => {
          const { labelKey, icon: Icon } = xpSourceMetaFor(source.key);
          return (
            <div
              key={source.key}
              className={`${styles.xpRow} ${source.xp > 0 ? styles.xpRowEarned : ""}`}
            >
              <div className={styles.xpRowIcon}>
                <Icon aria-hidden />
              </div>
              <div className={styles.xpRowBody}>
                <div className={styles.xpRowLabel}>{t(labelKey)}</div>
                <div className={styles.xpRowMeta}>
                  {t("members:badges.xpBreakdown.progress", {
                    units: source.units,
                    cap: source.cap,
                  })}
                </div>
              </div>
              <div className={styles.xpRowAmount}>
                {t("members:badges.xpBreakdown.amount", { xp: source.xp })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
