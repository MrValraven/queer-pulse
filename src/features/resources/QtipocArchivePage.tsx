import { PageShell } from "../../shared/components/layout";
import { Button, ImageSlot, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { PIECES } from "./qtipocArchive.data";
import styles from "./resources.module.css";

export function QtipocArchivePage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const pageTitle = t("resources:qtipocArchive.meta.title");
  const pageDescription = t("resources:qtipocArchive.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/qtipoc-archive" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:qtipocArchive.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:qtipocArchive.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:qtipocArchive.hero.lead")}
        anchors={[
          {
            label: t("resources:qtipocArchive.hero.anchor.about"),
            href: "#about",
          },
          {
            label: t("resources:qtipocArchive.hero.anchor.collection"),
            href: "#collection",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="about"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:qtipocArchive.about.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} style={{ maxWidth: "64ch" }}>
            {t("resources:qtipocArchive.about.body")}
          </Reveal>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="collection"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:qtipocArchive.collection.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:qtipocArchive.collection.lead")}
          </Reveal>
          <div className={styles.archiveGrid}>
            {PIECES.map((p, i) => (
              <Reveal
                key={p.title}
                className={`${styles.card} ${styles.archiveCard}`}
                delay={i * 55}
              >
                <ImageSlot tint={p.tint} placeholder={p.title} height={180} />
                <div className={styles.archiveMeta}>
                  {p.kind} · {p.year}
                </div>
                <div className={styles.cardName} style={{ fontSize: 20 }}>
                  {p.title}
                </div>
                <div className={styles.cardSpec}>{p.blurb}</div>
              </Reveal>
            ))}
          </div>
          <div
            className={`${styles.card} ${styles.cardDashed}`}
            style={{ marginTop: 24 }}
          >
            {t("resources:qtipocArchive.contribute.prompt")}
            <Button
              variant="ghost"
              style={{ marginTop: 12 }}
              onClick={() =>
                showToast(t("resources:qtipocArchive.contribute.toast"))
              }
            >
              {t("resources:qtipocArchive.contribute.cta")}
            </Button>
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:qtipocArchive.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:qtipocArchive.outro.sub")}
      >
        <Button to={routes.forum} variant="primary" size="lg">
          {t("resources:qtipocArchive.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
