import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { TYPE_CARDS } from "./hostPage.data";
import styles from "./HostPage.module.css";

export function HostSteps() {
  const { t } = useTranslation();
  return (
    <div className={styles.steps}>
      <Reveal className={styles.step}>
        <div className={styles.stepNum}>1</div>
        <div className={styles.stepContent}>
          <h2>
            <Translation
              i18nKey="gatherings:host.step1.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("gatherings:host.step1.body")}</p>
          <div className={styles.typesGrid}>
            {TYPE_CARDS.map((card) => (
              <div key={card.titleKey} className={styles.typeCard}>
                <div className={styles.tcIcon}>
                  <card.icon />
                </div>
                <h4>{t(card.titleKey)}</h4>
                <p>{t(card.bodyKey)}</p>
              </div>
            ))}
          </div>
          <div className={styles.tip}>
            <div className={styles.tipHead}>
              {t("gatherings:host.step1.tip.head")}
            </div>
            <p>{t("gatherings:host.step1.tip.body")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal className={styles.step} delay={60}>
        <div className={styles.stepNum}>2</div>
        <div className={styles.stepContent}>
          <h2>
            <Translation
              i18nKey="gatherings:host.step2.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("gatherings:host.step2.body")}</p>
          <ul className={styles.list}>
            <li>
              <Translation
                i18nKey="gatherings:host.step2.list.small"
                components={{ b: <b /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="gatherings:host.step2.list.medium"
                components={{ b: <b /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="gatherings:host.step2.list.large"
                components={{ b: <b /> }}
              />
            </li>
          </ul>
          <div className={styles.tip}>
            <div className={styles.tipHead}>
              {t("gatherings:host.step2.tip.head")}
            </div>
            <p>{t("gatherings:host.step2.tip.body")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal className={styles.step} delay={60}>
        <div className={styles.stepNum}>3</div>
        <div className={styles.stepContent}>
          <h2>
            <Translation
              i18nKey="gatherings:host.step3.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("gatherings:host.step3.body")}</p>
          <ul className={styles.list}>
            <li>{t("gatherings:host.step3.list.clear")}</li>
            <li>{t("gatherings:host.step3.list.location")}</li>
            <li>{t("gatherings:host.step3.list.cap")}</li>
          </ul>
        </div>
      </Reveal>

      <Reveal className={styles.step} delay={60}>
        <div className={styles.stepNum}>4</div>
        <div className={styles.stepContent}>
          <h2>
            <Translation
              i18nKey="gatherings:host.step4.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("gatherings:host.step4.body")}</p>
          <ul className={styles.list}>
            <li>{t("gatherings:host.step4.list.greet")}</li>
            <li>{t("gatherings:host.step4.list.activity")}</li>
            <li>{t("gatherings:host.step4.list.dontManage")}</li>
          </ul>
          <div className={styles.tip}>
            <div className={styles.tipHead}>
              {t("gatherings:host.step4.tip.head")}
            </div>
            <p>{t("gatherings:host.step4.tip.body")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal className={styles.step} delay={60}>
        <div className={`${styles.stepNum} ${styles.stepNumDone}`}>
          <FiCheck />
        </div>
        <div className={styles.stepContent}>
          <h2>
            <Translation
              i18nKey="gatherings:host.step5.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("gatherings:host.step5.body1")}</p>
          <p>{t("gatherings:host.step5.body2")}</p>
          <Button to={routes.contact}>
            {t("gatherings:host.step5.cta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
