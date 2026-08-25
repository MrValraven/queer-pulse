import { PageShell } from "../../shared/components/layout";
import { Button, ImageSlot, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { SHOWS } from "./groupShowArchive.data";
import styles from "./resources.module.css";

export function GroupShowArchivePage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:groupShowArchive.meta.title");
  const pageDescription = t("resources:groupShowArchive.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/group-show-archive" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:groupShowArchive.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:groupShowArchive.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:groupShowArchive.hero.lead")}
        anchors={[
          {
            label: t("resources:groupShowArchive.hero.anchor.shows"),
            href: "#shows",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="shows"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:groupShowArchive.shows.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:groupShowArchive.shows.lead")}
          </Reveal>
          <div className={styles.archiveGrid}>
            {SHOWS.map((show, i) => (
              <Reveal
                key={show.title}
                className={`${styles.card} ${styles.archiveCard}`}
                delay={i * 55}
              >
                <ImageSlot
                  tint={show.tint}
                  placeholder={show.title}
                  height={180}
                />
                <div className={styles.archiveMeta}>
                  {show.when} · {show.venue}
                </div>
                <div className={styles.cardName} style={{ fontSize: 21 }}>
                  {show.title}
                </div>
                <div className={styles.cardSpec}>{show.blurb}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:groupShowArchive.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:groupShowArchive.outro.sub")}
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          {t("resources:groupShowArchive.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
