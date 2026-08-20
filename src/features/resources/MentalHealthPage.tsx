import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import {
  TherapistSection,
  ExperiencesSection,
  SnsSection,
} from "./MentalHealthSections";
import { ResourceHero } from "./ResourceHero";
import { CrisisStrip } from "./CrisisStrip";
import { SuggestEditTrigger } from "./SuggestEditTrigger";

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
      <ResourceHero
        tone="light"
        eyebrowVariant="label"
        eyebrowColor="var(--jade)"
        eyebrow={t("resources:mentalHealth.hero.cat")}
        titleWeight="light"
        title={
          <Translation
            i18nKey="resources:mentalHealth.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:mentalHealth.hero.sub")}
      />

      <CrisisStrip />

      <TherapistSection />
      <ExperiencesSection />
      <SnsSection forum={FORUM} mentorship={MENTORSHIP} />

      <SuggestEditTrigger subject={pageTitle} context="mental_health" />

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
