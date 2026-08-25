import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import styles from "./ForOrganisationsPage.module.css";
import { NOT_DO_KEYS, PROCESS } from "./forOrganisationsPage.data";
import { useFeaturedPartners } from "./api/useFeaturedPartners";
import { TiersSection, PartnerContactForm } from "./ForOrganisationsSections";

export function ForOrganisationsPage() {
  const { t } = useTranslation();
  const { partners: featuredPartners, testimonial } = useFeaturedPartners();
  const pageTitle = t("marketing:forOrgs.meta.title");
  const pageDescription = t("marketing:forOrgs.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.forOrganisations },
        ])}
      />
      <PageHero
        plum={false}
        eyebrow={t("marketing:forOrgs.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:forOrgs.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={
          <Translation
            i18nKey="marketing:forOrgs.hero.dek"
            components={{ b: <b />, em: <em /> }}
          />
        }
      >
        <Reveal className={styles.notRow} delay={180}>
          <h4>{t("marketing:forOrgs.hero.notDoTitle")}</h4>
          <ul>
            {NOT_DO_KEYS.map((notDoKey) => (
              <li key={notDoKey}>
                <Translation i18nKey={notDoKey} components={{ b: <b /> }} />
              </li>
            ))}
          </ul>
        </Reveal>
      </PageHero>

      <TiersSection />

      <section className={styles.process}>
        <Reveal as="h2" className={styles.doH2}>
          <Translation
            i18nKey="marketing:forOrgs.process.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.doSub} delay={60}>
          {t("marketing:forOrgs.process.sub")}
        </Reveal>
        <div className={styles.processGrid}>
          {PROCESS.map((step, index) => (
            <Reveal className={styles.proc} key={step.n} delay={index * 60}>
              <div className={styles.procN}>
                {step.n[0]}
                <em>{step.n[1]}</em>
              </div>
              <h4>{t(step.titleKey)}</h4>
              <p>
                <Translation
                  i18nKey={step.bodyKey}
                  components={{ b: <b />, em: <em /> }}
                />
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {featuredPartners.length > 0 && (
        <section className={styles.proof}>
          <div className={styles.proofInner}>
            <Reveal as="h2">
              <Translation
                i18nKey="marketing:forOrgs.proof.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.proofSub} delay={60}>
              {t("marketing:forOrgs.proof.sub")}
            </Reveal>
            <div className={styles.partnerRow}>
              {featuredPartners.map((partner, index) => (
                <Reveal
                  key={partner.slug}
                  as={Link}
                  to={`${routes.partner}/${partner.slug}`}
                  className={styles.partnerCard}
                  delay={index * 60}
                >
                  <div className={styles.partnerLogo}>{partner.logo}</div>
                  <div className={styles.partnerType}>{partner.tier}</div>
                  <div className={styles.partnerName}>{partner.name}</div>
                  <div className={styles.partnerSince}>{partner.since}</div>
                  <p>{partner.description}</p>
                  <span className={styles.arrow}>
                    {t("marketing:forOrgs.proof.viewCta")}{" "}
                    <FiArrowRight aria-hidden />
                  </span>
                </Reveal>
              ))}
            </div>
            {testimonial && (
              <Reveal className={styles.quoteCard} delay={60}>
                <p>{testimonial.quote}</p>
                <div className={styles.quoteBy}>
                  <div className={styles.quoteAv}>{testimonial.initials}</div>
                  <div>
                    <div className={styles.quoteName}>{testimonial.author}</div>
                    <div className={styles.quoteRole}>{testimonial.role}</div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      <PartnerContactForm />
    </PageShell>
  );
}
