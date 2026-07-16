import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOOKING_FOR, STEP_KEYS } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

export function SubmitStoryIntro() {
  const { t } = useTranslation();
  return (
    <div>
      <Reveal className={styles.eyebrow}>
        {t("magazine:submitStory.intro.eyebrow")}
      </Reveal>
      <Reveal as="h1" className={styles.title} delay={60}>
        <Translation
          i18nKey="magazine:submitStory.intro.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" className={styles.lead} delay={120}>
        {t("magazine:submitStory.intro.lead")}
      </Reveal>

      <div className={styles.looking}>
        {LOOKING_FOR.map((item, index) => (
          <Reveal
            key={item.titleKey}
            className={styles.look}
            delay={index * 50}
          >
            <span className={styles.lookIcon}>
              <item.icon />
            </span>
            <div>
              <div className={styles.lookTitle}>{t(item.titleKey)}</div>
              <div className={styles.lookBody}>{t(item.bodyKey)}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className={styles.steps}>
        <div className={styles.stepsH}>
          {t("magazine:submitStory.intro.stepsHeading")}
        </div>
        {STEP_KEYS.map((stepKey) => (
          <div key={stepKey} className={styles.step}>
            {t(stepKey)}
          </div>
        ))}
      </div>
    </div>
  );
}
