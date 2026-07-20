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
import { WHAT_IT_IS_KEYS, STEPS } from "./peerSupport.data";
import styles from "./resources.module.css";

export function PeerSupportPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:peerSupport.meta.title");
  const pageDescription = t("resources:peerSupport.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/peer-support",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/peer-support" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:peerSupport.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:peerSupport.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:peerSupport.hero.lead")}
        anchors={[
          { label: t("resources:peerSupport.hero.anchor.what"), href: "#what" },
          { label: t("resources:peerSupport.hero.anchor.how"), href: "#how" },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="what">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:peerSupport.what.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          {WHAT_IT_IS_KEYS.map((whatKey) => (
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

      <section className={`${styles.section} ${styles.sectionCream}`} id="how">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:peerSupport.how.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:peerSupport.how.lead")}
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

      <Outro
        title={
          <Translation
            i18nKey="resources:peerSupport.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:peerSupport.outro.sub")}
      >
        <Button to={routes.transHub} variant="primary" size="lg">
          {t("resources:peerSupport.outro.hubCta")}
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          {t("resources:peerSupport.outro.forumCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
