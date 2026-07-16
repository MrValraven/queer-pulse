import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOW_STEP_KEYS } from "./sustainer.data";
import styles from "./sustainer.module.css";

/** The four-step "how it works" strip — no lock-in, no small print. */
export function SustainerHowItWorks() {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className={`${styles.secHead} ${styles.secHeadSm}`}>
        <Translation
          i18nKey="support:howItWorks.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.secSub}>{t("support:howItWorks.sub")}</p>
      <div className={styles.howSteps}>
        {HOW_STEP_KEYS.map((key, i) => (
          <div key={key} className={styles.howStep}>
            <div className={styles.hsNum}>{i + 1}</div>
            <div className={styles.hsLabel}>{t(key)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
