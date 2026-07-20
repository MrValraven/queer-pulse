import { GiSpoon } from "react-icons/gi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { WHAT_KEYS, USES, RSVP_TIP_KEYS } from "./spoonTheory.data";
import styles from "./resources.module.css";

const SPOONS = [false, false, false, false, true, true]; // last two spent

export function SpoonTheoryPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:spoonTheory.meta.title");
  const pageDescription = t("resources:spoonTheory.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/spoon-theory",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/spoon-theory" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:spoonTheory.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:spoonTheory.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:spoonTheory.hero.lead")}
        anchors={[
          { label: t("resources:spoonTheory.hero.anchor.what"), href: "#what" },
          { label: t("resources:spoonTheory.hero.anchor.uses"), href: "#uses" },
          { label: t("resources:spoonTheory.hero.anchor.rsvp"), href: "#rsvp" },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="what">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:spoonTheory.what.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal>
            <div className={styles.spoonRow} aria-hidden>
              {SPOONS.map((spent, spoonIndex) => (
                <GiSpoon
                  key={spoonIndex}
                  className={`${styles.spoon} ${spent ? styles.spoonSpent : ""}`}
                />
              ))}
            </div>
            <div className={styles.archiveMeta} style={{ marginBottom: 24 }}>
              {t("resources:spoonTheory.what.spoonsCaption")}
            </div>
          </Reveal>
          {WHAT_KEYS.map((whatKey) => (
            <Reveal
              as="p"
              key={whatKey}
              className={styles.leadP}
              style={{ maxWidth: "64ch" }}
            >
              {t(whatKey)}
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="uses">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:spoonTheory.uses.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.grid}>
            {USES.map((use, i) => (
              <Reveal key={use.titleKey} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 18 }}>
                  {t(use.titleKey)}
                </div>
                <div className={styles.cardSpec}>{t(use.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="rsvp">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:spoonTheory.rsvp.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.checklist}>
            {RSVP_TIP_KEYS.map((tipKey) => (
              <Reveal
                key={tipKey}
                className={styles.checkItem}
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className={styles.cardSpec} style={{ flex: "none" }}>
                  {t(tipKey)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:spoonTheory.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:spoonTheory.outro.sub")}
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          {t("resources:spoonTheory.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
