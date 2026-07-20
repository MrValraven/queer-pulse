import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { ON_FORMS, RIGHTS, VOICES } from "./schoolFormsGuide.data";
import styles from "./resources.module.css";

const badgeClass: Record<string, string> = {
  protected: styles.badgeProtected!,
  know: styles.badgeKnow!,
  practical: styles.badgeKnow!,
};
const badgeLabelKey: Record<string, string> = {
  protected: "resources:schoolFormsGuide.badge.protected",
  know: "resources:schoolFormsGuide.badge.know",
  practical: "resources:schoolFormsGuide.badge.practical",
};

export function SchoolFormsGuidePage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:schoolFormsGuide.meta.title");
  const pageDescription = t("resources:schoolFormsGuide.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/school-forms-guide" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:schoolFormsGuide.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:schoolFormsGuide.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:schoolFormsGuide.hero.lead")}
        anchors={[
          {
            label: t("resources:schoolFormsGuide.hero.anchor.forms"),
            href: "#forms",
          },
          {
            label: t("resources:schoolFormsGuide.hero.anchor.rights"),
            href: "#rights",
          },
          {
            label: t("resources:schoolFormsGuide.hero.anchor.voices"),
            href: "#voices",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="forms"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:schoolFormsGuide.forms.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:schoolFormsGuide.forms.lead")}
          </Reveal>
          <div className={styles.stepList}>
            {ON_FORMS.map((s) => (
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
        className={`${styles.section} ${styles.sectionCream}`}
        id="rights"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:schoolFormsGuide.rights.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:schoolFormsGuide.rights.lead")}
          </Reveal>
          <div className={styles.grid}>
            {RIGHTS.map((r, i) => (
              <Reveal
                key={r.titleKey}
                className={styles.rightCard}
                delay={i * 55}
              >
                <span className={`${styles.badge} ${badgeClass[r.badge]}`}>
                  {t(badgeLabelKey[r.badge]!)}
                </span>
                <div className={styles.rightTitle}>{t(r.titleKey)}</div>
                <div className={styles.rightBody}>{t(r.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="voices"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:schoolFormsGuide.voices.title"
              components={{ em: <em /> }}
            />
          </Reveal>
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
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:schoolFormsGuide.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:schoolFormsGuide.outro.sub")}
      >
        <Button to={routes.legal} variant="primary" size="lg">
          {t("resources:schoolFormsGuide.outro.legalCta")}
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          {t("resources:schoolFormsGuide.outro.forumCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
