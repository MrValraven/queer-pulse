import { useMemo } from "react";
import { FadeIn, Button } from "../../shared/components/ui";
import { StudioShell } from "./StudioShell";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { buildAboutData } from "./studioAbout.data";
import { AboutSection, RateBand, Tiers, Skeptics } from "./StudioAboutSections";
import s from "./StudioAboutPage.module.css";

export function StudioAboutPage() {
  const { t } = useTranslation();
  const about = useMemo(() => buildAboutData(t), [t]);

  return (
    <StudioShell>
      <div className={s.wrap}>
        <FadeIn className={s.hero} as="header">
          <div className={s.eb}>{about.hero.eyebrow}</div>
          <h1>{about.hero.title}</h1>
          <p className={s.lede}>{about.hero.lede}</p>
        </FadeIn>

        <AboutSection
          num={about.sectionNum.whatItIs}
          delay={60}
          heading={<Translation i18nKey="studio:about.sec.whatItIs.heading" components={{ em: <em /> }} />}
        >
          <p>
            <Translation i18nKey="studio:about.sec.whatItIs.p1" components={{ strong: <strong /> }} />
          </p>
          <p>{t("studio:about.sec.whatItIs.p2")}</p>
          <div className={s.pull}>
            <Translation i18nKey="studio:about.sec.whatItIs.pull" components={{ em: <em /> }} />
          </div>
        </AboutSection>

        <AboutSection
          num={about.sectionNum.rate}
          delay={80}
          heading={<Translation i18nKey="studio:about.sec.rate.heading" components={{ em: <em /> }} />}
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
          heading={<Translation i18nKey="studio:about.sec.ceiling.heading" components={{ em: <em /> }} />}
        >
          <p>{t("studio:about.sec.ceiling.p1")}</p>
          <Tiers />
        </AboutSection>

        <AboutSection
          num={about.sectionNum.governance}
          delay={80}
          heading={<Translation i18nKey="studio:about.sec.governance.heading" components={{ em: <em /> }} />}
        >
          <p>
            <Translation
              i18nKey="studio:about.sec.governance.p1"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>
            <Translation i18nKey="studio:about.sec.governance.p2" components={{ em: <em /> }} />
          </p>
        </AboutSection>

        <AboutSection
          num={about.sectionNum.hardQuestions}
          delay={80}
          heading={<Translation i18nKey="studio:about.sec.hardQuestions.heading" components={{ em: <em /> }} />}
        >
          <Skeptics />
        </AboutSection>

        <FadeIn className={s.cta} delay={80}>
          <h2>{about.cta.title}</h2>
          <p>{about.cta.body}</p>
          <div className={s.acts}>
            <Button variant="primary" size="lg" to={routes.signIn}>
              {about.cta.join}
            </Button>
            <Button variant="ghost-dark" size="lg" to={routes.governance}>
              {about.cta.ledger}
            </Button>
          </div>
        </FadeIn>
      </div>
    </StudioShell>
  );
}
