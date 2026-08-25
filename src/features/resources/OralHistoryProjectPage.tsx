import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { STEPS, VOICES } from "./oralHistoryProject.data";
import styles from "./resources.module.css";

export function OralHistoryProjectPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const pageTitle = t("resources:oralHistoryProject.meta.title");
  const pageDescription = t("resources:oralHistoryProject.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/oral-history-project" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:oralHistoryProject.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:oralHistoryProject.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:oralHistoryProject.hero.lead")}
        anchors={[
          {
            label: t("resources:oralHistoryProject.hero.anchor.about"),
            href: "#about",
          },
          {
            label: t("resources:oralHistoryProject.hero.anchor.how"),
            href: "#how",
          },
          {
            label: t("resources:oralHistoryProject.hero.anchor.voices"),
            href: "#voices",
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
              i18nKey="resources:oralHistoryProject.about.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} style={{ maxWidth: "64ch" }}>
            {t("resources:oralHistoryProject.about.body")}
          </Reveal>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="how">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:oralHistoryProject.how.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:oralHistoryProject.how.lead")}
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
          <Reveal style={{ marginTop: 28 }}>
            <Button
              variant="jade"
              size="lg"
              onClick={() =>
                showToast(
                  t(
                    demoMode
                      ? "resources:oralHistoryProject.participateToast"
                      : "resources:oralHistoryProject.participateLiveToast",
                  ),
                )
              }
            >
              {t("resources:oralHistoryProject.participateCta")}
            </Button>
          </Reveal>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="voices"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:oralHistoryProject.voices.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          {/* The named "voices" are prototype fixtures. Live mode has no real
              recorded excerpts yet, so it shows an honest empty state instead
              of fabricated community quotes. */}
          {demoMode ? (
            <div>
              {VOICES.map((v) => (
                <Reveal key={v.who} className={styles.qaItem}>
                  <div
                    className={styles.qaQ}
                    style={{ fontStyle: "italic", fontWeight: 400 }}
                  >
                    "{v.text}"
                  </div>
                  <div className={styles.archiveMeta}>{v.who}</div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal
              as="p"
              className={styles.leadP}
              style={{ maxWidth: "64ch" }}
            >
              {t("resources:oralHistoryProject.voices.live.body")}
            </Reveal>
          )}
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:oralHistoryProject.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:oralHistoryProject.outro.sub")}
      >
        <Button to={routes.forum} variant="primary" size="lg">
          {t("resources:oralHistoryProject.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
