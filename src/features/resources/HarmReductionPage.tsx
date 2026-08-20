import { PageShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import {
  HarmReductionEmergencyStrip,
  HarmReductionHero,
  HarmReductionGrid,
  HarmReductionOutro,
} from "./HarmReductionSections";
import { CrisisStrip } from "./CrisisStrip";
import { SuggestEditTrigger } from "./SuggestEditTrigger";

export function HarmReductionPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:harmReduction.meta.title");
  const pageDescription = t("resources:harmReduction.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/harm-reduction",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/harm-reduction" },
        ])}
      />
      <HarmReductionEmergencyStrip />
      <HarmReductionHero />
      <CrisisStrip />
      <HarmReductionGrid />
      <SuggestEditTrigger subject={pageTitle} context="harm_reduction" />
      <HarmReductionOutro />
    </PageShell>
  );
}
