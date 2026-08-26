import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STAND_PANELS,
  STAND_PARAGRAPH_KEYS,
  STAND_POSITIONS,
} from "./about.data";
import { AboutLinkTrigger } from "./AboutLinkTrigger";
import { AboutStandPanel } from "./AboutStandPanel";
import { MarketingSection } from "./MarketingSection";
import s from "./AboutPage.module.css";

/**
 * "Where we stand" — the About page's position section. An intersectionality
 * lead-in in the page's normal body voice, then the full-weight panels (trans,
 * then Palestine), then the shorter positions, closing on the test that governs
 * when QueerPulse speaks at all. Deep-linked as `/about#stand` from the
 * homepage manifesto.
 */
export function AboutStandSection() {
  const { t } = useTranslation();

  return (
    <MarketingSection
      flush
      id="stand"
      eyebrow={t("marketing:about.stand.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:about.stand.title"
          components={{ em: <em /> }}
        />
      }
    >
      <Reveal as="div" className={s.body} delay={120}>
        {STAND_PARAGRAPH_KEYS.map((key) => (
          <p key={key}>{t(key)}</p>
        ))}
        <p>
          <AboutLinkTrigger topic="intersections" className={s.standLink}>
            {t("marketing:about.stand.intersectionalityLink")}
          </AboutLinkTrigger>
        </p>
      </Reveal>

      {STAND_PANELS.map((panel, index) => (
        <AboutStandPanel
          key={panel.id}
          panel={panel}
          delay={160 + index * 60}
        />
      ))}

      <div className={s.standPositions}>
        {STAND_POSITIONS.map(({ icon: Icon, ...position }, index) => (
          <Reveal
            key={position.titleKey}
            className={s.standPosition}
            delay={index * 60}
          >
            <span className={s.standPositionChip} aria-hidden>
              <Icon />
            </span>
            <div className={s.standPositionTitle}>{t(position.titleKey)}</div>
            <p className={s.standPositionBody}>{t(position.bodyKey)}</p>
            {position.link && (
              <AboutLinkTrigger
                topic={position.link.topic}
                className={s.standLink}
              >
                {t(position.link.labelKey)}
              </AboutLinkTrigger>
            )}
          </Reveal>
        ))}
      </div>

      <Reveal as="div" className={s.standPrinciple} delay={80}>
        <div className={s.standPrincipleTitle}>
          {t("marketing:about.stand.principle.title")}
        </div>
        <p>{t("marketing:about.stand.principle.body")}</p>
      </Reveal>
    </MarketingSection>
  );
}
