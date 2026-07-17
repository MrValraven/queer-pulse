import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { fundSteps } from "./openCalls.data";
import styles from "./CinemaOpenCalls.module.css";

export function CinemaOpenCallsHowItWorks() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.how}>
      <div className={`wrap ${styles.howInner}`}>
        <h2>
          <Translation
            i18nKey="cinema:openCalls.how.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.howSteps}>
          {fundSteps.map((step) => (
            <div key={step.num} className={styles.hwStep}>
              <div className={styles.hwNum}>
                <em>{step.num}</em>
              </div>
              <div className={styles.hwTitle}>
                <Translation
                  i18nKey={step.titleKey}
                  components={{ em: <em /> }}
                />
              </div>
              <div className={styles.hwBody}>
                {t(step.bodyKey, {
                  price: fmt.currency(7),
                  poolShare: fmt.currency(1.4),
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
