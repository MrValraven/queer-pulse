import { FiArrowRight, FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { RULE_KEYS, VERIFY } from "./employerReviews.data";
import styles from "./EmployerReviewsPage.module.css";

/** How QueerPulse verifies who's behind each employer review. */
export function EmployerVerifyBox() {
  const { t } = useTranslation();
  return (
    <div className={styles.verifyBox}>
      <div className={styles.verifyHead}>
        <span className={styles.verifyIcon} aria-hidden>
          <FiShield />
        </span>
        <h3>
          <Translation
            i18nKey="economy:employerReviews.verify.title"
            components={{ em: <em /> }}
          />
        </h3>
      </div>
      <div className={styles.verifyGrid}>
        {VERIFY.map((verifyItem) => (
          <div className={styles.verifyItem} key={verifyItem.labelKey}>
            <div className={styles.verifyLabel}>{t(verifyItem.labelKey)}</div>
            <div className={styles.verifyDesc}>{t(verifyItem.descKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The "write a review" prompt with its posting-rules rail. */
export function EmployerWriteBox({ onWrite }: { onWrite: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.writeBox} id="write">
      <div>
        <h2>
          <Translation
            i18nKey="economy:employerReviews.write.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>{t("economy:employerReviews.write.body")}</p>
        <Button
          variant="primary"
          className={styles.writeBtn}
          onClick={onWrite}
        >
          {t("economy:employerReviews.recent.writeCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <div className={styles.writeNote}>
          {t("economy:employerReviews.write.note")}
        </div>
      </div>
      <div className={styles.writeRules}>
        <div className={styles.rulesTitle}>
          {t("economy:employerReviews.write.rulesTitle")}
        </div>
        {RULE_KEYS.map((ruleKey) => (
          <div className={styles.rule} key={ruleKey}>
            <div className={styles.ruleDot} />
            {t(ruleKey)}
          </div>
        ))}
      </div>
    </div>
  );
}
