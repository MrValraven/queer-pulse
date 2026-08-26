import { FiExternalLink } from "react-icons/fi";
import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOODS, ORGS } from "./arrivingPage.data";
import { HEALTH, HOUSING } from "./arrivingPageCards.data";
import { InfoCards } from "./ArrivingInfoCards";
import { TONE_CLASS } from "./arrivingTone";
import { MarketingSection } from "./MarketingSection";
import styles from "./ArrivingPage.module.css";

export function NeighbourhoodsSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.neighbourhoods.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.neighbourhoods.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.neighbourhoods.intro")}
    >
      <div className={styles.hoodGrid}>
        {HOODS.map((hood, index) => (
          <Reveal
            as="div"
            className={styles.hoodCard}
            key={hood.id}
            delay={index * 55}
          >
            <span className={`${styles.hoodTag} ${TONE_CLASS[hood.tone]}`}>
              {t(`marketing:arriving.hoods.${hood.id}.tag`)}
            </span>
            <h3 className={styles.hoodName}>{hood.name}</h3>
            <p className={styles.hoodDesc}>
              {t(`marketing:arriving.hoods.${hood.id}.body`)}
            </p>
            <p className={styles.hoodNote}>
              {t(`marketing:arriving.hoods.${hood.id}.note`)}
            </p>
          </Reveal>
        ))}
      </div>
    </MarketingSection>
  );
}

export function HealthSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.health.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.health.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.health.intro")}
    >
      <InfoCards cards={HEALTH} />
    </MarketingSection>
  );
}

export function HousingSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.housing.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.housing.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.housing.intro")}
    >
      <InfoCards cards={HOUSING} />
    </MarketingSection>
  );
}

/**
 * The three organisations worth knowing first. Each row is a link to the
 * organisation's own site, which is reachable without a QueerPulse account and
 * is what a newcomer can act on today. The rows used to point at
 * `/about/platforms`, a QueerPulse index page that says nothing about any of
 * them, and printed the domain as dead text beside an arrow glyph.
 */
export function OrgsSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.orgs.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.orgs.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.orgs.intro")}
    >
      <div className={styles.orgList}>
        {ORGS.map((org, index) => (
          <Reveal
            as="a"
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.org}
            key={org.id}
            delay={index * 55}
          >
            <span
              className={`${styles.orgAv} ${TONE_CLASS[org.tone]}`}
              aria-hidden
            >
              {org.initials}
            </span>
            <span className={styles.orgBody}>
              <span className={styles.orgName}>{org.name}</span>
              <span className={styles.orgDesc}>
                {t(`marketing:arriving.orgs.items.${org.id}.body`)}
              </span>
              <span className={styles.orgUrl}>
                {org.domain} <FiExternalLink aria-hidden />
              </span>
            </span>
          </Reveal>
        ))}
      </div>
    </MarketingSection>
  );
}
