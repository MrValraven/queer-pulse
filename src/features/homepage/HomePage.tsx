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
  HousingShowcase,
  LiveChangeMakers,
  LiveCommunities,
  LiveDiscovery,
  LiveGatherings,
  LiveStories,
  Manifesto,
  Outro,
  PainPoints,
  PersonasShowcase,
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
 * Gatherings and Stories now have `Live*` counterparts too, reading the real
 * events board and the real published magazine rather than the prototype's
 * static `data/*` registries. Neither has a PUBLIC source: `GET /events` and
 * `GET /magazine/articles` both sit behind the active-member guard, and
 * `/landing/features` carries no gatherings or stories slice, so both hooks
 * are gated on a signed-in session and the sections simply don't render for a
 * signed-out visitor (see `useHomepageGatherings` / `useHomepageStories`).
 * Live mode always keeps the platform-authored sections (value proposition,
 * manifesto, the "gaps we felt" thread, housing, personas) — identical in
 * both modes. HousingShowcase and PersonasShowcase both link to real,
 * already-live features (`/local/housing`, `/subprofiles`); their
 * interactive showcase content (specific example listings/personas) is
 * fabricated illustrative copy shown in BOTH modes by product decision —
 * neither section is backed by real listing/persona data yet.
 *
 * FOLLOW-UP: showing gatherings and stories to SIGNED-OUT visitors needs a
 * public source — either gathering/story slices on `GET /landing/features`
 * (admin-curated, mirroring the three that exist) or a public read of the
 * events board. Until one lands, a signed-out visitor sees neither section.
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
      {demoMode ? <Gatherings /> : <LiveGatherings />}
      <HousingShowcase />
      <PersonasShowcase />
      <PainPoints />
      {demoMode ? <Stories /> : <LiveStories />}
      {demoMode ? <ChangeMakers /> : <LiveChangeMakers />}
      <Outro />
    </PageShell>
  );
}
