import { FiCheck, FiX } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, FeatureHelp, Outro, Reveal } from "../../shared/components/ui";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import {
  CONTRAST_THEM_KEYS,
  CONTRAST_US_KEYS,
  VALUES,
  WHO_PARAGRAPH_KEYS,
  WHY_PARAGRAPH_KEYS,
} from "./about.data";
import { AboutStandSection } from "./AboutStandSection";
import { MarketingSection } from "./MarketingSection";
import m from "./marketing.module.css";
import s from "./AboutPage.module.css";

export function AboutPage() {
  const { t } = useTranslation();
  const pageTitle = t("marketing:about.meta.title");
  const pageDescription = t("marketing:about.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: pageTitle, path: routes.about },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:about.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:about.hero.title"
            components={{ em: <em /> }}
          />
        }
        titleAction={<FeatureHelp id="marketing.about" />}
        sub={t("marketing:about.hero.sub")}
      />

      <MarketingSection eyebrow={t("marketing:about.why.eyebrow")}>
        <Reveal as="h2" className={m.sectionTitle} delay={60}>
          <Translation
            i18nKey="marketing:about.why.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="div" className={s.body} delay={120}>
          {WHY_PARAGRAPH_KEYS.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </Reveal>
      </MarketingSection>

      <MarketingSection
        flush
        eyebrow={t("marketing:about.difference.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:about.difference.title"
            components={{ em: <em /> }}
          />
        }
      >
        <div className={s.contrastGrid}>
          <Reveal className={s.contrastCol} delay={80}>
            <div className={s.contrastLabel}>
              <FiX className={s.contrastIconThem} aria-hidden />
              {t("marketing:about.contrast.them.label")}
            </div>
            <ul className={s.contrastList}>
              {CONTRAST_THEM_KEYS.map((key) => (
                <li key={key} className={s.contrastItem}>
                  <FiX className={s.contrastIconThem} aria-hidden />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className={s.contrastColOurs} delay={140}>
            <div className={s.contrastLabelOurs}>
              <FiCheck className={s.contrastIconUs} aria-hidden />
              {t("marketing:about.contrast.us.label")}
            </div>
            <ul className={s.contrastList}>
              {CONTRAST_US_KEYS.map((key) => (
                <li key={key} className={s.contrastItemOurs}>
                  <FiCheck className={s.contrastIconUs} aria-hidden />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </MarketingSection>

      <MarketingSection
        flush
        eyebrow={t("marketing:about.beliefs.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:about.beliefs.title"
            components={{ em: <em /> }}
          />
        }
      >
        <div className={s.valuesGrid}>
          {VALUES.map(({ icon: Icon, titleKey, bodyKey }, index) => (
            <Reveal
              key={titleKey}
              className={s.valCard}
              delay={Math.min(index, 8) * 60}
            >
              <span className={s.valChip} aria-hidden>
                <Icon />
              </span>
              <div className={s.valTitle}>{t(titleKey)}</div>
              <div className={s.valText}>{t(bodyKey)}</div>
            </Reveal>
          ))}
        </div>
      </MarketingSection>

      <AboutStandSection />

      <MarketingSection flush eyebrow={t("marketing:about.who.eyebrow")}>
        <Reveal as="h2" className={m.sectionTitle} delay={60}>
          <Translation
            i18nKey="marketing:about.who.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="div" className={s.body} delay={120}>
          {WHO_PARAGRAPH_KEYS.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </Reveal>

        <Reveal className={s.contactStrip} delay={60}>
          <div className={s.csText}>
            <h3>
              <Translation
                i18nKey="marketing:about.contactStrip.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("marketing:about.contactStrip.body")}</p>
          </div>
          <div className={s.csActions}>
            <Button to={routes.contact}>
              {t("marketing:about.contactStrip.contactCta")}
            </Button>
            <Button variant="ghost" to={routes.governance}>
              {t("marketing:about.contactStrip.governanceCta")}
            </Button>
          </div>
        </Reveal>
      </MarketingSection>

      <Outro
        title={
          <Translation
            i18nKey="marketing:about.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:about.outro.sub")}
      >
        <Button size="lg" to={requestInvitePath("about")}>
          {t("marketing:about.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
