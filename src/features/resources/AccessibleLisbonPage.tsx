import { FiCheckCircle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { GROUPS } from "./accessibleLisbon.data";
import styles from "./resources.module.css";

export function AccessibleLisbonPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
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
        anchors={GROUPS.map((g) => ({
          label: t(g.labelKey),
          href: `#${g.id}`,
        }))}
      />

      {GROUPS.map((group, gi) => (
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
                <Reveal key={place.name} className={styles.card} delay={i * 55}>
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
