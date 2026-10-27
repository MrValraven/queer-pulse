import { Reveal } from "../../../../shared/components/ui/Reveal";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceSection } from "../shared/AudienceSection";
import { SCATTER_SCRAPS } from "./communitiesLanding.data";
import styles from "./CommunitiesScatter.module.css";

/**
 * "Where it all lives today": the tools a collective juggles, pinned up as
 * scraps on a noticeboard, each with a line in the organizers' own words.
 */
export function CommunitiesScatter() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="scatter"
      eyebrow={t("audiences:scatter.eyebrow")}
      title={t("forCommunities:scatter.title")}
      lede={t("forCommunities:scatter.lede")}
      tone="paper"
    >
      <ul className={styles.board}>
        {SCATTER_SCRAPS.map(({ scrapId, Icon, labelKey, quoteKey }, index) => (
          <Reveal
            as="li"
            key={scrapId}
            delay={index * 70}
            className={styles.slot}
          >
            <div className={styles.scrap}>
              <span className={styles.icon}>
                <Icon aria-hidden />
              </span>
              <h3 className={styles.label}>{t(labelKey)}</h3>
              <p className={styles.quote}>{t(quoteKey)}</p>
            </div>
          </Reveal>
        ))}
      </ul>
      <p className={styles.punchline}>
        {t("forCommunities:scatter.punchline")}
      </p>
    </AudienceSection>
  );
}
