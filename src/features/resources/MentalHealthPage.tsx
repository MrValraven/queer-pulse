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
import { CRISIS } from "./mentalHealth.data";
import {
  TherapistSection,
  ExperiencesSection,
  SnsSection,
} from "./MentalHealthSections";
import styles from "./MentalHealthPage.module.css";

const FORUM = routes.forum;
const MENTORSHIP = routes.mentorship;

export function MentalHealthPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:mentalHealth.meta.title");
  const pageDescription = t("resources:mentalHealth.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/mental-health",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/mental-health" },
        ])}
      />
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("resources:mentalHealth.hero.cat")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="resources:mentalHealth.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            {t("resources:mentalHealth.hero.sub")}
          </Reveal>
        </div>
      </div>

      <div className={styles.crisisBar}>
        <div className="wrap">
          <div className={styles.crisisInner}>
            <div>
              <div className={styles.crisisLabel}>
                {t("resources:mentalHealth.crisis.label")}
              </div>
              <div className={styles.crisisHeading}>
                {t("resources:mentalHealth.crisis.heading")}
              </div>
              <p className={styles.crisisSub}>
                {t("resources:mentalHealth.crisis.sub")}
              </p>
            </div>
            <div className={styles.crisisLines}>
              {CRISIS.map((c) => (
                <div className={styles.crisisLine} key={c.name}>
                  <div className={styles.clName}>{c.name}</div>
                  <div className={styles.clNum}>{c.number}</div>
                  <div className={styles.clNote}>{t(c.noteKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TherapistSection />
      <ExperiencesSection />
      <SnsSection forum={FORUM} mentorship={MENTORSHIP} />

      <Outro
        title={
          <Translation
            i18nKey="resources:mentalHealth.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:mentalHealth.outro.sub")}
      >
        <Button to={FORUM} variant="primary" size="lg">
          {t("resources:mentalHealth.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
