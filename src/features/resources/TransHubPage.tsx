import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { TransHubCommunitySection } from "./TransHubCommunitySection";
import { HEALTHCARE, LEGAL, RESOURCES } from "./transHub.data";
import styles from "./resources.module.css";

export function TransHubPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:transHub.meta.title");
  const pageDescription = t("resources:transHub.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/trans-hub" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:transHub.hero.eyebrow")}
        eyebrowDotColor="var(--violet)"
        title={
          <Translation
            i18nKey="resources:transHub.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:transHub.hero.lead")}
        anchors={[
          {
            label: t("resources:transHub.hero.anchor.healthcare"),
            href: "#healthcare",
          },
          { label: t("resources:transHub.hero.anchor.legal"), href: "#legal" },
          {
            label: t("resources:transHub.hero.anchor.resources"),
            href: "#resources",
          },
          {
            label: t("resources:transHub.hero.anchor.community"),
            href: "#community",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="healthcare"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:transHub.healthcare.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:transHub.healthcare.lead")}
          </Reveal>
          <div className={styles.stepList}>
            {HEALTHCARE.map((step) => (
              <Reveal key={step.n} className={styles.step}>
                <div className={styles.stepN}>{step.n}</div>
                <div>
                  <div className={styles.stepTitle}>{t(step.titleKey)}</div>
                  <div className={styles.stepBody}>
                    <Translation
                      i18nKey={step.bodyKey}
                      components={
                        step.linkTo
                          ? { a: <Link to={step.linkTo} /> }
                          : undefined
                      }
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="legal"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:transHub.legal.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:transHub.legal.lead")}
          </Reveal>
          <div className={styles.stepList}>
            {LEGAL.map((step) => (
              <Reveal key={step.n} className={styles.step}>
                <div className={styles.stepN}>{step.n}</div>
                <div>
                  <div className={styles.stepTitle}>{t(step.titleKey)}</div>
                  <div className={styles.stepBody}>{t(step.bodyKey)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="resources"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:transHub.resources.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:transHub.resources.lead")}
          </Reveal>
          <div className={styles.grid}>
            {RESOURCES.map((res, index) => (
              <Reveal
                key={res.titleKey}
                className={styles.card}
                delay={index * 55}
              >
                <span
                  className={styles.resCat}
                  style={{ color: res.catColor, background: res.catBg }}
                >
                  {t(res.categoryKey)}
                </span>
                <div className={styles.resTitle}>{t(res.titleKey)}</div>
                <div className={styles.resDesc}>{t(res.descriptionKey)}</div>
                <Link to={routes.library} className={styles.rightLink}>
                  {t("resources:transHub.resources.openCta")}{" "}
                  <FiArrowRight aria-hidden />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TransHubCommunitySection />

      <Outro
        title={
          <Translation
            i18nKey="resources:transHub.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:transHub.outro.sub")}
      >
        <Button to={requestInvitePath("trans_hub")} variant="primary" size="lg">
          {t("resources:transHub.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
