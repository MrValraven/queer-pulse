import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { PACE_GROUPS, BRING } from "./runningGuide.data";
import styles from "./resources.module.css";

export function RunningGuidePage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <ResourceHero
        eyebrow={t("resources:runningGuide.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:runningGuide.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:runningGuide.hero.lead")}
        anchors={[
          {
            label: t("resources:runningGuide.hero.anchor.pace"),
            href: "#pace",
          },
          {
            label: t("resources:runningGuide.hero.anchor.bring"),
            href: "#bring",
          },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="pace">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:runningGuide.pace.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:runningGuide.pace.lead")}
          </Reveal>
          <div className={styles.grid}>
            {PACE_GROUPS.map((g, i) => (
              <Reveal key={g.nameKey} className={styles.card} delay={i * 55}>
                <div className={styles.cardName}>{t(g.nameKey)}</div>
                <div className={styles.tags}>
                  <span className={styles.tag}>{t(g.paceKey)}</span>
                </div>
                <div className={styles.cardSpec}>{t(g.whoKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="bring"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:runningGuide.bring.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:runningGuide.bring.lead")}
          </Reveal>
          <div className={styles.checklist}>
            {BRING.map((item) => (
              <Reveal key={item.titleKey} className={styles.checkItem}>
                <FiCheck className={styles.checkIcon} aria-hidden />
                <div>
                  <div className={styles.cardName} style={{ fontSize: 18 }}>
                    {t(item.titleKey)}
                  </div>
                  <div className={styles.cardSpec} style={{ marginTop: 4 }}>
                    {t(item.noteKey)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:runningGuide.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:runningGuide.outro.sub")}
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          {t("resources:runningGuide.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
