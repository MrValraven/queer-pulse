import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioComingSoonClosing } from "./StudioComingSoonClosing";
import { StudioComingSoonHero } from "./StudioComingSoonHero";
import { StudioComingSoonManifesto } from "./StudioComingSoonManifesto";
import { StudioComingSoonTracklist } from "./StudioComingSoonTracklist";
import styles from "./StudioComingSoonPage.module.css";

/**
 * Live-mode teaser for the whole Studio domain. Studio is a demo-only
 * showcase (no backend, no data hooks, see `docs/superpowers/specs/
 * 2026-07-30-studio-live-mode-gate-design.md`), so when demo mode is OFF every
 * `/studio/*` route resolves here instead of rendering fabricated payouts,
 * tips and broadcast numbers as if they were real.
 *
 * The page is one full-bleed, permanently dark "island" in four scenes, the
 * same shape as `CinemaComingSoon`: an ON AIR hero over a live meter, the
 * Side A tracklist of what the Studio will be like, a manifesto on why local
 * queer artists matter, and a mixing-desk closing that points to the
 * magazine. The island owns the plum ground and a tape-hiss grain across all
 * four. It describes the idea only: no price, payout, tip or fund figure
 * appears anywhere on it, because none of them exist yet.
 *
 * Deliberately uses the marketing `PageShell` rather than Studio's own chrome:
 * showing the studio shell would itself imply the platform is live.
 */
export function StudioComingSoonPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta
        title={t("studio:comingSoon.metaTitle")}
        description={t("studio:comingSoon.description")}
        noIndex
      />
      <div className={styles.island}>
        <StudioComingSoonHero />
        <StudioComingSoonTracklist />
        <StudioComingSoonManifesto />
        <StudioComingSoonClosing />
      </div>
    </PageShell>
  );
}
