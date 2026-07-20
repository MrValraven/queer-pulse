import { PageShell } from "../../shared/components/layout";
import { PageMeta, JsonLd, buildOrganizationSchema } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ChangeMakers,
  Communities,
  Discovery,
  Gatherings,
  Hero,
  Manifesto,
  Newsletter,
  Outro,
  PainPoints,
  Stories,
} from "./sections";

/**
 * QueerPulse marketing homepage — composes the sections in the order from
 * the design prototype. Plum and cream sections alternate for rhythm.
 */
export function HomePage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <PageMeta
        title={t("homepage:meta.title")}
        description={t("homepage:meta.description")}
      />
      <JsonLd schema={buildOrganizationSchema()} />
      <Hero />
      <Manifesto />
      <Discovery />
      <Communities />
      <Gatherings />
      <PainPoints />
      <Stories />
      <ChangeMakers />
      <Newsletter />
      <Outro />
    </PageShell>
  );
}
