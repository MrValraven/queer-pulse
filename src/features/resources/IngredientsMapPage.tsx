import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { AREAS } from "./ingredientsMap.data";
import styles from "./resources.module.css";

export function IngredientsMapPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const pageTitle = t("resources:ingredientsMap.meta.title");
  const pageDescription = t("resources:ingredientsMap.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/ingredients-map" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:ingredientsMap.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:ingredientsMap.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:ingredientsMap.hero.lead")}
        anchors={AREAS.map((a) => ({
          label: t(a.neighbourhoodKey),
          href: `#${a.anchorId}`,
        }))}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal
            as="p"
            className={styles.leadP}
            style={{ maxWidth: "64ch", marginBottom: 48 }}
          >
            {t("resources:ingredientsMap.intro")}
          </Reveal>

          {AREAS.map((area) => (
            <div
              key={area.anchorId}
              className={styles.mapGroup}
              id={area.anchorId}
            >
              <Reveal as="div" className={styles.mapGroupLabel}>
                {t(area.neighbourhoodKey)}
              </Reveal>
              <div className={styles.grid}>
                {area.spots.map((s, i) => (
                  <Reveal key={s.name} className={styles.card} delay={i * 45}>
                    <div className={styles.cardName} style={{ fontSize: 18 }}>
                      {s.name}
                    </div>
                    <div className={styles.cardSpec}>{t(s.findsKey)}</div>
                    <div className={styles.tags}>
                      <span className={styles.tag}>{t(s.originKey)}</span>
                      <span className={styles.tag}>{t(s.hoursKey)}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}

          <div
            className={`${styles.card} ${styles.cardDashed}`}
            style={{ marginTop: 32 }}
          >
            {t("resources:ingredientsMap.missing.prompt")}
            <Button
              variant="ghost"
              style={{ marginTop: 12 }}
              onClick={() =>
                showToast(t("resources:ingredientsMap.missing.toast"))
              }
            >
              {t("resources:ingredientsMap.missing.cta")}
            </Button>
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:ingredientsMap.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:ingredientsMap.outro.sub")}
      >
        <Button to={routes.forum} variant="primary" size="lg">
          {t("resources:ingredientsMap.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
