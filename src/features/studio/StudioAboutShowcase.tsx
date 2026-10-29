import { useMemo } from "react";
import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AboutSection, RateBand, Skeptics, Tiers } from "./StudioAboutSections";
import { buildAboutData } from "./studioAbout.data";
import s from "./StudioAboutPage.module.css";

/** Demo only: the co-op vision (how artists get paid, the earnings ceiling, the
 *  council and the hard questions) under its original keys. */
export function StudioAboutShowcase() {
  const { t } = useTranslation();
  const about = useMemo(() => buildAboutData(t), [t]);
  return (
    <>
      <FadeIn delay={80} className={s.sec} as="section">
        <h2>
          <Translation
            i18nKey="studio:aboutLive.showcase.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.muted}>{t("studio:aboutLive.showcase.dek")}</p>
      </FadeIn>

      <AboutSection
        num={about.sectionNum.rate}
        delay={80}
        heading={
          <Translation
            i18nKey="studio:about.sec.rate.heading"
            components={{ em: <em /> }}
          />
        }
      >
        <p>
          <Translation
            i18nKey="studio:about.sec.rate.p1"
            components={{ strong: <strong />, em: <em /> }}
          />
        </p>
        <RateBand />
        <p className={s.muted}>{t("studio:about.sec.rate.footnote")}</p>
      </AboutSection>

      <AboutSection
        num={about.sectionNum.ceiling}
        delay={80}
        heading={
          <Translation
            i18nKey="studio:about.sec.ceiling.heading"
            components={{ em: <em /> }}
          />
        }
      >
        <p>{t("studio:about.sec.ceiling.p1")}</p>
        <Tiers />
      </AboutSection>

      <AboutSection
        num={about.sectionNum.governance}
        delay={80}
        heading={
          <Translation
            i18nKey="studio:about.sec.governance.heading"
            components={{ em: <em /> }}
          />
        }
      >
        <p>
          <Translation
            i18nKey="studio:about.sec.governance.p1"
            components={{ strong: <strong /> }}
          />
        </p>
        <p>
          <Translation
            i18nKey="studio:about.sec.governance.p2"
            components={{ em: <em /> }}
          />
        </p>
      </AboutSection>

      <AboutSection
        num={about.sectionNum.hardQuestions}
        delay={80}
        heading={
          <Translation
            i18nKey="studio:about.sec.hardQuestions.heading"
            components={{ em: <em /> }}
          />
        }
      >
        <Skeptics />
      </AboutSection>
    </>
  );
}
