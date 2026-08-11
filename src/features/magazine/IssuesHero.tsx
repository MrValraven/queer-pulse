import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./IssuesPage.module.css";

/** Top masthead for the Issues page. The eyebrow shows in both modes; the
 *  headline, dek, and all-time stat row assert a fixed issue count / start year
 *  / cadence with no aggregate endpoint behind them — fabricated figures — so
 *  the whole rich hero is demo-only. In live the real "The full archive"
 *  section below is the page heading. */
export function IssuesHero({ demoMode }: { demoMode: boolean }) {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.eyebrow}>{t("magazine:issues.eyebrow")}</div>
        {demoMode && (
          <>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="magazine:issues.heroTitle"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.dek}>{t("magazine:issues.heroDek")}</p>
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
          </>
        )}
      </div>
    </section>
  );
}
