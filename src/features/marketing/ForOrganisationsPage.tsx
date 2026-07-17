import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./ForOrganisationsPage.module.css";
import { NOT_DO_KEYS, PROCESS, PARTNERS } from "./forOrganisationsPage.data";
import { TiersSection, PartnerContactForm } from "./ForOrganisationsSections";

export function ForOrganisationsPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Reveal as="div" className={styles.eyebrow}>
            {t("marketing:forOrgs.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" className={styles.h1} delay={60}>
            <Translation
              i18nKey="marketing:forOrgs.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.dek} delay={120}>
            <Translation
              i18nKey="marketing:forOrgs.hero.dek"
              components={{ b: <b />, em: <em /> }}
            />
          </Reveal>
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
        </div>
      </section>

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
            {PARTNERS.map((partner, index) => (
              <Reveal
                key={partner.slug}
                as={Link}
                to={`${routes.partner}/${partner.slug}`}
                className={styles.partnerCard}
                delay={index * 60}
              >
                <div
                  className={[
                    styles.partnerLogo,
                    partner.logoCls && styles[partner.logoCls],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {partner.logo}
                </div>
                <div className={styles.partnerType}>{partner.type}</div>
                <div className={styles.partnerName}>{partner.name}</div>
                <div className={styles.partnerSince}>{partner.since}</div>
                <p>{partner.desc}</p>
                <span className={styles.arrow}>
                  {t("marketing:forOrgs.proof.viewCta")}
                </span>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.quoteCard} delay={60}>
            <p>
              "What QueerPulse asked us for at the start was strange:{" "}
              <em>not money</em>, not co-branding — they wanted us to commit to
              specific operational changes in how our helpline handed off to a
              community. It took a year. It's the partnership we're proudest
              of."
            </p>
            <div className={styles.quoteBy}>
              <div className={styles.quoteAv}>FM</div>
              <div>
                <div className={styles.quoteName}>Filipa Mendes</div>
                <div className={styles.quoteRole}>
                  Executive Director · ILGA Portugal
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <PartnerContactForm />
    </PageShell>
  );
}
