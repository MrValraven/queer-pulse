import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioAboutShowcase } from "./StudioAboutShowcase";
import { AboutSection } from "./StudioAboutSections";
import { StudioShell } from "./StudioShell";
import { ABOUT_LIVE_SECTIONS } from "./studioAbout.data";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./StudioAboutPage.module.css";

/** About Studio: what it is today in both modes; the co-op vision in the
 *  demo only (spec section 3.3). */
export function StudioAboutPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();

  return (
    <StudioShell>
      <div className={s.wrap}>
        <FadeIn className={s.hero} as="header">
          <div className={s.eb}>{t("studio:aboutLive.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:aboutLive.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={s.lede}>{t("studio:aboutLive.hero.lede")}</p>
        </FadeIn>

        {ABOUT_LIVE_SECTIONS.map((section, index) => (
          <AboutSection
            key={section.id}
            num={t(section.numKey)}
            delay={index === 0 ? 60 : 80}
            heading={
              <Translation
                i18nKey={section.headingKey}
                components={{ em: <em /> }}
              />
            }
          >
            {section.paragraphKeys.map((key) => (
              <p key={key}>{t(key)}</p>
            ))}
          </AboutSection>
        ))}

        {isShowcase && <StudioAboutShowcase />}

        <FadeIn className={s.cta} delay={80}>
          <h2>
            <Translation
              i18nKey="studio:aboutLive.cta.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("studio:aboutLive.cta.body")}</p>
          <div className={s.acts}>
            <Button variant="primary" size="lg" to={routes.studio}>
              {t("studio:aboutLive.cta.open")}
            </Button>
            <Button variant="ghost-dark" size="lg" to={routes.studioTerms}>
              {t("studio:aboutLive.cta.terms")} <FiArrowRight aria-hidden />
            </Button>
            {isShowcase && (
              <>
                <Button variant="ghost-dark" size="lg" to={routes.signIn}>
                  {t("studio:about.cta.join")}
                </Button>
                <Button variant="ghost-dark" size="lg" to={routes.governance}>
                  {t("studio:about.cta.ledger")} <FiArrowRight aria-hidden />
                </Button>
              </>
            )}
          </div>
        </FadeIn>

        <FadeIn className={s.credits} delay={80} as="footer">
          <h2 className={s.creditsHeading}>
            {t("studio:aboutLive.credits.heading")}
          </h2>
          <p>
            <Translation
              i18nKey="studio:aboutLive.credits.lame"
              components={{
                a: (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template; <Translation> clones it with the translated link text at render.
                  <a
                    href="https://lame.sourceforge.io/"
                    target="_blank"
                    rel="noreferrer noopener"
                  />
                ),
              }}
            />
          </p>
        </FadeIn>
      </div>
    </StudioShell>
  );
}
