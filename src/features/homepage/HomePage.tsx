import { PageShell } from "../../shared/components/layout";
import { PageMeta, JsonLd, buildOrganizationSchema } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
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
 *
 * Live-mode honesty: five sections (Discovery member spotlights, Communities,
 * Gatherings, Stories, ChangeMakers) render richly-curated *fabricated* people,
 * communities, events, and articles straight from the prototype's static
 * `data/*` registries — there is no live backend that supplies their curated
 * shapes (member quotes, spotlight descriptions, changemaker blurbs, story
 * deks, event chrome), so wiring them is a per-section redesign, not a wire.
 * Rather than parade invented members as real to production visitors, we render
 * them ONLY in demo mode. Live mode keeps the platform-authored sections (value
 * proposition, manifesto, the "gaps we felt" thread, newsletter) — all honest,
 * identical in both modes.
 */
export function HomePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  return (
    <PageShell>
      <PageMeta
        title={t("homepage:meta.title")}
        description={t("homepage:meta.description")}
      />
      <JsonLd schema={buildOrganizationSchema()} />
      <Hero />
      <Manifesto />
      {demoMode && <Discovery />}
      {demoMode && <Communities />}
      {demoMode && <Gatherings />}
      <PainPoints />
      {demoMode && <Stories />}
      {demoMode && <ChangeMakers />}
      <Newsletter />
      <Outro />
    </PageShell>
  );
}
