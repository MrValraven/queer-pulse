import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./IssuesPage.module.css";

/** Top masthead for the Issues page: eyebrow, headline, dek, and the demo-only
 *  all-time archive stat row. */
export function IssuesHero({ demoMode }: { demoMode: boolean }) {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.eyebrow}>{t("magazine:issues.eyebrow")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="magazine:issues.heroTitle"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.dek}>{t("magazine:issues.heroDek")}</p>
        {/* All-time archive counts are fabricated — there's no aggregate
            endpoint behind them, so they stay demo-only. */}
        {demoMode && (
          <div className={styles.metaRow}>
            <span>
              <b>
                <em>9</em>
              </b>
              {t("magazine:issues.stats.issuesPublished", { count: 9 })}
            </span>
            <span>
              <b>108</b>
              {t("magazine:issues.stats.articlesArchived", { count: 108 })}
            </span>
            <span>
              <b>52</b>
              {t("magazine:issues.stats.contributorsAllTime", { count: 52 })}
            </span>
            <span>
              <b>
                <em>11</em>
              </b>
              {t("magazine:issues.stats.languagesTranslated", { count: 11 })}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
