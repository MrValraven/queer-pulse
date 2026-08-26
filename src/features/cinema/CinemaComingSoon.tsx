import { FiFilm } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CinemaComingSoon.module.css";

/**
 * Live-mode placeholder for the WHOLE Cinema domain. The backend ships
 * `launchedFeatures.cinema = { launched: false }`, so every `/cinema/*` call
 * 404s, no film can be streamed and no membership can be bought. Meanwhile the
 * demo pages advertise EUR 7/month and EUR 20/month tiers, a public ledger and
 * a 142-film catalogue that do not exist. So when demo mode is OFF every
 * `/cinema/*` route resolves here instead (see `cinemaRoutes`). CON-03.
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
      <div className={styles.wrap}>
        <EmptyState
          icon={<FiFilm aria-hidden />}
          title={t("cinema:comingSoon.title")}
          description={t("cinema:comingSoon.description")}
          action={{
            label: t("cinema:comingSoon.magazineCta"),
            to: routes.magazine,
          }}
          secondaryAction={{
            label: t("cinema:comingSoon.backHome"),
            to: routes.homepage,
          }}
        />
      </div>
    </PageShell>
  );
}
