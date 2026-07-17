import { FiArrowUpRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { TOPICS, LINKS } from "./lgbtqAgingGuide.data";
import styles from "./resources.module.css";

export function LgbtqAgingGuidePage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <ResourceHero
        eyebrow={t("resources:lgbtqAgingGuide.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:lgbtqAgingGuide.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:lgbtqAgingGuide.hero.lead")}
        anchors={[
          {
            label: t("resources:lgbtqAgingGuide.hero.anchor.topics"),
            href: "#topics",
          },
          {
            label: t("resources:lgbtqAgingGuide.hero.anchor.links"),
            href: "#links",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="topics"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:lgbtqAgingGuide.topics.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:lgbtqAgingGuide.topics.lead")}
          </Reveal>
          <div className={styles.grid}>
            {TOPICS.map((topic, i) => (
              <Reveal
                key={topic.titleKey}
                className={styles.card}
                delay={i * 55}
              >
                <div className={styles.cardName} style={{ fontSize: 19 }}>
                  {t(topic.titleKey)}
                </div>
                <div className={styles.cardSpec}>{t(topic.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="links"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:lgbtqAgingGuide.links.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.grid}>
            {LINKS.map((l, i) => (
              <Reveal
                as="a"
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
                delay={i * 55}
              >
                <div
                  className={styles.cardName}
                  style={{
                    fontSize: 19,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {t(l.labelKey)} <FiArrowUpRight aria-hidden />
                </div>
                <div className={styles.cardSpec}>{t(l.noteKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:lgbtqAgingGuide.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:lgbtqAgingGuide.outro.sub")}
      >
        <Button to={routes.mentalHealth} variant="primary" size="lg">
          {t("resources:lgbtqAgingGuide.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
