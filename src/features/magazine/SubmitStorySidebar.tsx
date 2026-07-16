import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AFTER_SUBMIT_KEYS, GUIDELINE_KEYS } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

export function SubmitStorySidebar() {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sideCard}>
        <div className={styles.sideTitle}>
          {t("magazine:submitStory.sidebar.guidelinesHeading")}
        </div>
        <div className={styles.sideList}>
          {GUIDELINE_KEYS.map((g) => (
            <div key={g.termKey} className={styles.sideItem}>
              <span className={styles.sideDot} />
              <span className={styles.sideText}>
                <strong>{t(g.termKey)}</strong> {t(g.detailKey)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sideCard}>
        <div className={styles.sideTitle}>
          {t("magazine:submitStory.sidebar.afterSubmitHeading")}
        </div>
        <div className={styles.sideList}>
          {AFTER_SUBMIT_KEYS.map((key) => (
            <div key={key} className={styles.sideItem}>
              <span className={`${styles.sideDot} ${styles.sideDotJade}`} />
              <span className={styles.sideText}>
                <Translation i18nKey={key} components={{ strong: <strong /> }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.sideCard} ${styles.sideMuted}`}>
        <div className={styles.sideTitle}>
          {t("magazine:submitStory.sidebar.questionsHeading")}
        </div>
        <p className={styles.sideText} style={{ marginBottom: 14 }}>
          {t("magazine:submitStory.sidebar.questionsBody")}
        </p>
        <Button
          href="mailto:magazine@queerpulse.pt"
          variant="ghost"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {t("magazine:submitStory.sidebar.emailCta")}
        </Button>
      </div>
    </aside>
  );
}
