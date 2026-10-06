import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { STEPS, TIPS } from "./disabilityHealthcare.data";
import styles from "./resources.module.css";

/**
 * The peer tips carry invented names (PRD-451), so the whole section renders
 * in demo mode only, and its hero anchor goes with it.
 */
function PeerTips() {
  return (
    <section className={`${styles.section} ${styles.sectionCream}`} id="tips">
      <div className="wrap">
        <Reveal as="h2">
          <Translation
            i18nKey="resources:disabilityHealthcare.tips.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <div>
          {TIPS.map((tip) => (
            <Reveal key={tip.who} className={styles.qaItem}>
              <div
                className={styles.qaQ}
                style={{ fontStyle: "italic", fontWeight: 400 }}
              >
                "{tip.text}"
              </div>
              <div className={styles.archiveMeta}>{tip.who}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DisabilityHealthcarePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const pageTitle = t("resources:disabilityHealthcare.meta.title");
  const pageDescription = t("resources:disabilityHealthcare.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/disability-healthcare",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/disability-healthcare" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:disabilityHealthcare.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:disabilityHealthcare.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:disabilityHealthcare.hero.lead")}
        // Live mode has one section below the hero, so a lone anchor pill
        // pointing at it would add nothing.
        anchors={
          demoMode
            ? [
                {
                  label: t("resources:disabilityHealthcare.hero.anchor.steps"),
                  href: "#steps",
                },
                {
                  label: t("resources:disabilityHealthcare.hero.anchor.tips"),
                  href: "#tips",
                },
              ]
            : undefined
        }
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="steps"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:disabilityHealthcare.steps.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:disabilityHealthcare.steps.lead")}
          </Reveal>
          <div className={styles.stepList}>
            {STEPS.map((s) => (
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

      {demoMode && <PeerTips />}

      <Outro
        title={
          <Translation
            i18nKey="resources:disabilityHealthcare.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:disabilityHealthcare.outro.sub")}
      >
        <Button to={routes.legal} variant="primary" size="lg">
          {t("resources:disabilityHealthcare.outro.rightsCta")}
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          {t("resources:disabilityHealthcare.outro.askCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
