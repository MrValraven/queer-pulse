import { FiCheck, FiX } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  CONTRAST_THEM_KEYS,
  CONTRAST_US_KEYS,
  PULL_QUOTE_KEY,
  VALUES,
  WHO_PARAGRAPH_KEYS,
  WHO_PULL_KEY,
  WHY_PARAGRAPH_KEYS,
} from "./about.data";
import m from "./marketing.module.css";
import s from "./AboutPage.module.css";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:about.meta.title")}
        description={t("marketing:about.meta.description")}
      />
      <PageHero
        eyebrow={t("marketing:about.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:about.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:about.hero.sub")}
      />

      <section className={m.section}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            {t("marketing:about.why.eyebrow")}
          </Reveal>
          <div className={s.originGrid}>
            <div>
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
            </div>
            <Reveal className={s.pull} delay={80}>
              {t(PULL_QUOTE_KEY)}
            </Reveal>
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            {t("marketing:about.difference.eyebrow")}
          </Reveal>
          <Reveal as="h2" className={m.sectionTitle} delay={60}>
            <Translation
              i18nKey="marketing:about.difference.title"
              components={{ em: <em /> }}
            />
          </Reveal>
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
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            {t("marketing:about.beliefs.eyebrow")}
          </Reveal>
          <Reveal as="h2" className={m.sectionTitle} delay={60}>
            <Translation
              i18nKey="marketing:about.beliefs.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={s.valuesGrid}>
            {VALUES.map((v, i) => (
              <Reveal
                key={v.titleKey}
                className={s.valCard}
                delay={Math.min(i, 8) * 60}
              >
                <div className={s.valTitle}>{t(v.titleKey)}</div>
                <div className={s.valText}>{t(v.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            {t("marketing:about.who.eyebrow")}
          </Reveal>
          <div className={s.originGrid}>
            <div>
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
            </div>
            <Reveal className={s.pull} delay={80}>
              {t(WHO_PULL_KEY)}
            </Reveal>
          </div>

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
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:about.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:about.outro.sub")}
      >
        <Button size="lg" to={routes.requestInvite}>
          {t("marketing:about.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
