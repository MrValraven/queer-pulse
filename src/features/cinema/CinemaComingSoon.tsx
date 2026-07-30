import { FiFilm } from "react-icons/fi";
import { CinemaShell } from "./CinemaShell";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CinemaComingSoon.module.css";

/**
 * Live-mode placeholder for the corners of Cinema that aren't wired to the
 * backend yet (collections, made-here shorts, filmmaker/curator profiles, open
 * calls, the mock film-detail page). Cinema itself is live — Browse and Watch
 * read the real `/cinema/titles` catalog — so this stays inside `CinemaShell`
 * and points people at the working catalogue instead of pretending these
 * sections exist. Rendered only when demo mode is OFF; the demo build still
 * shows the full mock page.
 */
export function CinemaComingSoon() {
  const { t } = useTranslation();
  return (
    <CinemaShell>
      <div className={styles.wrap}>
        <EmptyState
          icon={<FiFilm aria-hidden />}
          title={t("cinema:comingSoon.title")}
          description={t("cinema:comingSoon.description")}
          action={{
            label: t("cinema:comingSoon.browseCta"),
            to: routes.cinemaBrowse,
          }}
          secondaryAction={{
            label: t("cinema:comingSoon.backHome"),
            to: routes.homepage,
          }}
        />
      </div>
    </CinemaShell>
  );
}
