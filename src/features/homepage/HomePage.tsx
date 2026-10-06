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
 * Gatherings and Stories have `Live*` counterparts too, each reading one of
 * two real sources depending on who is looking (see `useHomepageGatherings` /
 * `useHomepageStories`). A signed-in member sees the real events board and
 * the latest published magazine pieces (`GET /events`, `GET /magazine/articles`,
 * both behind the active-member guard). A signed-out visitor sees the
 * gathering and story slices of the same public `GET /landing/features` the
 * other three sections read: admin-curated, re-checked on every read (a
 * gathering must stay public, published, upcoming and not taken down; a story
 * must stay a published original), and carrying an area-level place only. The
 * response is CDN-cached, so a gathering or story that stops qualifying leaves
 * the page within a few minutes. With nothing curated, the section renders
 * nothing for that visitor. Live mode always
 * keeps the platform-authored sections (value proposition,
 * manifesto, the "gaps we felt" thread, housing, personas) — identical in
 * both modes. HousingShowcase and PersonasShowcase both link to real,
 * already-live features (`/local/housing`, `/subprofiles`); their
 * interactive showcase content (specific example listings/personas) is
 * fabricated illustrative copy shown in BOTH modes by product decision —
 * neither section is backed by real listing/persona data yet.
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
