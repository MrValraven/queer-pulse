import { FiCheckCircle, FiMapPin } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { GROUPS } from "./accessibleLisbon.data";
import styles from "./resources.module.css";

export function AccessibleLisbonPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const pageTitle = t("resources:accessibleLisbon.meta.title");
  const pageDescription = t("resources:accessibleLisbon.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/accessible-lisbon" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:accessibleLisbon.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:accessibleLisbon.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:accessibleLisbon.hero.lead")}
        anchors={
          demoMode
            ? GROUPS.map((g) => ({ label: t(g.labelKey), href: `#${g.id}` }))
            : []
        }
      />

      {!demoMode && (
        <section className={`${styles.section} ${styles.sectionPaper}`}>
          <div className="wrap">
            <EmptyState
              icon={<FiMapPin />}
              title={t("resources:accessibleLisbon.live.title")}
              description={t("resources:accessibleLisbon.live.body")}
              action={{
                label: t("resources:accessibleLisbon.live.cta"),
                to: routes.gatherings,
              }}
            />
          </div>
        </section>
      )}

      {demoMode &&
        GROUPS.map((group, gi) => (
          <section
            key={group.id}
            className={`${styles.section} ${gi % 2 === 0 ? styles.sectionPaper : styles.sectionCream}`}
            id={group.id}
          >
            <div className="wrap">
              <Reveal as="h2">{t(group.labelKey)}</Reveal>
              <Reveal as="p" className={styles.leadP}>
                {t(group.introKey)}
              </Reveal>
              <div className={styles.grid}>
                {group.places.map((place, i) => (
                  <Reveal
                    key={place.name}
                    className={styles.card}
                    delay={i * 55}
                  >
                    <span className={styles.verifiedTag}>
                      <FiCheckCircle aria-hidden />{" "}
                      {t("resources:accessibleLisbon.verifiedTag")}
                    </span>
                    <div className={styles.cardName} style={{ fontSize: 19 }}>
                      {place.name}
                    </div>
                    <div className={styles.cardSpec}>{t(place.detailKey)}</div>
                    <div className={styles.tags}>
                      {place.flagKeys.map((flagKey) => (
                        <span key={flagKey} className={styles.tag}>
                          {t(flagKey)}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))}

      <Outro
        title={
          <Translation
            i18nKey="resources:accessibleLisbon.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:accessibleLisbon.outro.sub")}
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          {t("resources:accessibleLisbon.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
