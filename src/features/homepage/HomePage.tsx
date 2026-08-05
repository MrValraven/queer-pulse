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
  LiveChangeMakers,
  LiveCommunities,
  LiveDiscovery,
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
 * Live-mode honesty: three sections (Discovery member spotlights, Communities,
 * ChangeMakers) are backed by an admin-curated public endpoint
 * (`GET /landing/features`), so live mode renders their `Live*` counterparts
 * — real members/communities/changemakers the admin team chose to feature,
 * never fabricated ones. A `Live*` section renders nothing when nothing has
 * been curated yet, rather than showing an empty shell.
 *
 * Two sections (Gatherings, Stories) still have no live-curated equivalent —
 * their rich shapes (event chrome, story deks) come straight from the
 * prototype's static `data/*` registries, so wiring them is a per-section
 * redesign, not a wire. They render ONLY in demo mode. Live mode always keeps
 * the platform-authored sections (value proposition, manifesto, the "gaps we
 * felt" thread, newsletter) — all honest, identical in both modes.
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
      {demoMode ? <Discovery /> : <LiveDiscovery />}
      {demoMode ? <Communities /> : <LiveCommunities />}
      {demoMode && <Gatherings />}
      <PainPoints />
      {demoMode && <Stories />}
      {demoMode ? <ChangeMakers /> : <LiveChangeMakers />}
      <Newsletter />
      <Outro />
    </PageShell>
  );
}
