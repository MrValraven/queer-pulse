import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CinemaComingSoonClosing } from "./CinemaComingSoonClosing";
import { CinemaComingSoonFilmStrip } from "./CinemaComingSoonFilmStrip";
import { CinemaComingSoonHero } from "./CinemaComingSoonHero";
import { CinemaComingSoonManifesto } from "./CinemaComingSoonManifesto";
import styles from "./CinemaComingSoon.module.css";

/**
 * Live-mode teaser for the WHOLE Cinema domain. The backend ships
 * `launchedFeatures.cinema = { launched: false }`, so every `/cinema/*` call
 * 404s, no film can be streamed and no membership can be bought. Meanwhile the
 * demo pages advertise EUR 7/month and EUR 20/month tiers, a public ledger and
 * a 142-film catalogue that do not exist. So when demo mode is OFF every
 * `/cinema/*` route resolves here instead (see `cinemaRoutes`). CON-03.
 *
 * The page is one full-bleed, permanently dark "island" in four scenes: a
 * projector-lit hero, a strip of film frames showing what the cinema will be
 * like, a manifesto on why local queer filmmakers matter, and a marquee
 * closing that points to the magazine. The island owns the plum ground and a
 * film-grain overlay across all four. It describes the idea only: no price,
 * revenue split, membership or ledger appears anywhere on it, because none of
 * them exist yet.
 *
 * Deliberately uses the marketing `PageShell` rather than `CinemaShell`: the
 * cinema frame carries a "Sustain from EUR 7/mo" button and a footer full of
 * membership links, so rendering it would keep making the same offer this page
 * exists to withdraw. Same reasoning as `StudioComingSoonPage`.
 *
 * When cinema launches, flip the backend flag AND drop the `!demoMode` branch
 * in `src/features/cinema/routes.tsx`.
 */
export function CinemaComingSoon() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta
        title={t("cinema:comingSoon.metaTitle")}
        description={t("cinema:comingSoon.description")}
        noIndex
      />
      <div className={styles.island}>
        <CinemaComingSoonHero />
        <CinemaComingSoonFilmStrip />
        <CinemaComingSoonManifesto />
        <CinemaComingSoonClosing />
      </div>
    </PageShell>
  );
}
