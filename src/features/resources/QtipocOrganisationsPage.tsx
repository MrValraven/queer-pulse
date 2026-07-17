import { FiArrowUpRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { ORGS } from "./qtipocOrganisations.data";
import styles from "./resources.module.css";

export function QtipocOrganisationsPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
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
            {ORGS.map((o, i) => (
              <Reveal key={o.name} className={styles.card} delay={i * 55}>
                <a
                  href={o.href}
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
                  {o.name} <FiArrowUpRight aria-hidden />
                </a>
                <div className={styles.cardSpec}>{o.mission}</div>
                <div className={styles.archiveMeta}>{o.offers}</div>
                <div className={styles.tags}>
                  {o.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
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
