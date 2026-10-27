import { Reveal } from "../../../../shared/components/ui/Reveal";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceSection } from "../shared/AudienceSection";
import { SCATTER_SCRAPS } from "./performersLanding.data";
import styles from "./PerformersScatter.module.css";

/**
 * "Where it all lives today": the bits a performer's career is spread over,
 * as ticket stubs tucked into a backstage mirror, each with its own serial
 * number. Each stub fades up as it scrolls in, a beat after the one before.
 */
export function PerformersScatter() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="scatter"
      eyebrow={t("audiences:scatter.eyebrow")}
      title={t("forPerformers:scatter.title")}
      lede={t("forPerformers:scatter.lede")}
      tone="wash"
    >
      <ul className={styles.mirror}>
        {SCATTER_SCRAPS.map(({ scrapId, labelKey, Icon }, index) => (
          <Reveal
            key={scrapId}
            as="li"
            delay={index * 70}
            className={styles.scrap}
          >
            <span className={styles.stub} aria-hidden>
              <Icon className={styles.icon} />
              <span className={styles.serial}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </span>
            <span className={styles.label}>{t(labelKey)}</span>
          </Reveal>
        ))}
      </ul>
    </AudienceSection>
  );
}
