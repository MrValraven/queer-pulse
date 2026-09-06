import { FiArrowUpRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { ORGS } from "./qtipocOrganisations.data";
import styles from "./resources.module.css";

export function QtipocOrganisationsPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:qtipocOrganisations.meta.title");
  const pageDescription = t("resources:qtipocOrganisations.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/qtipoc-organisations" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:qtipocOrganisations.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:qtipocOrganisations.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:qtipocOrganisations.hero.lead")}
        anchors={[
          {
            label: t("resources:qtipocOrganisations.hero.anchor.orgs"),
            href: "#orgs",
          },
          {
            label: t("resources:qtipocOrganisations.hero.anchor.verify"),
            href: "#verify",
          },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="orgs">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:qtipocOrganisations.orgs.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.grid}>
            {ORGS.map((organisation, index) => (
              <Reveal
                key={organisation.name}
                className={styles.card}
                delay={index * 55}
              >
                <a
                  href={organisation.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardName}
                  style={{
                    fontSize: 19,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {organisation.name} <FiArrowUpRight aria-hidden />
                </a>
                <div className={styles.cardSpec}>
                  {t(organisation.missionKey)}
                </div>
                <div className={styles.archiveMeta}>
                  {t(organisation.offersKey)}
                </div>
                <div className={styles.tags}>
                  {organisation.tagKeys.map((tagKey) => (
                    <span key={tagKey} className={styles.tag}>
                      {t(tagKey)}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="verify"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:qtipocOrganisations.verify.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} style={{ maxWidth: "64ch" }}>
            {t("resources:qtipocOrganisations.verify.body")}
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:qtipocOrganisations.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:qtipocOrganisations.outro.sub")}
      >
        <Button to={routes.forum} variant="primary" size="lg">
          {t("resources:qtipocOrganisations.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
