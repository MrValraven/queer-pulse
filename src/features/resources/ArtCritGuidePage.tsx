import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { PRINCIPLE_KEY, FLOW, EXAMPLES } from "./artCritGuide.data";
import styles from "./resources.module.css";

export function ArtCritGuidePage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:artCritGuide.meta.title");
  const pageDescription = t("resources:artCritGuide.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/art-crit-guide" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:artCritGuide.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:artCritGuide.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:artCritGuide.hero.lead")}
        anchors={[
          {
            label: t("resources:artCritGuide.hero.anchor.principle"),
            href: "#principle",
          },
          {
            label: t("resources:artCritGuide.hero.anchor.flow"),
            href: "#flow",
          },
          {
            label: t("resources:artCritGuide.hero.anchor.examples"),
            href: "#examples",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="principle"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:artCritGuide.principle.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} style={{ maxWidth: "62ch" }}>
            {t(PRINCIPLE_KEY)}
          </Reveal>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="flow">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:artCritGuide.flow.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:artCritGuide.flow.lead")}
          </Reveal>
          <div className={styles.stepList}>
            {FLOW.map((s) => (
              <Reveal key={s.n} className={styles.step}>
                <div className={styles.stepN}>{s.n}</div>
                <div>
                  <div className={styles.stepTitle}>{t(s.titleKey)}</div>
                  <div className={styles.stepBody}>{t(s.bodyKey)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="examples"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:artCritGuide.examples.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:artCritGuide.examples.lead")}
          </Reveal>
          <div className={styles.grid}>
            {EXAMPLES.map((ex, i) => (
              <Reveal key={ex.goodKey} className={styles.card} delay={i * 55}>
                <span className={`${styles.badge} ${styles.badgeProtected}`}>
                  {t("resources:artCritGuide.examples.tryThis")}
                </span>
                <div className={styles.cardSpec} style={{ flex: "none" }}>
                  {t(ex.goodKey)}
                </div>
                <span
                  className={`${styles.badge} ${styles.badgeKnow}`}
                  style={{ marginTop: 8 }}
                >
                  {t("resources:artCritGuide.examples.avoid")}
                </span>
                <div className={styles.cardSpec} style={{ flex: "none" }}>
                  {t(ex.avoidKey)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:artCritGuide.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:artCritGuide.outro.sub")}
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          {t("resources:artCritGuide.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
