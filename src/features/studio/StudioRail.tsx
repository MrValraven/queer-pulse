import { AnimatePresence, m } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "./api/useStudioAccess";
import { RAIL_MAIN } from "./studioShell.data";
import { LIVE_RAIL_LINKS } from "./studioRailLive.data";
import { RailGroup } from "./StudioRailGroup";
import { StudioRailCreatePlaylist } from "./StudioRailCreatePlaylist";
import { StudioRailPlaylists } from "./StudioRailPlaylists";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";

/**
 * The Studio rail, the member's listening home: the brand, the main nav,
 * then the Create playlist pill and their playlists. The pill and the list
 * mount once the member can use Studio (the demo always can), and only the
 * list scrolls. A footer row pinned to the bottom leaves Studio for the
 * feed, and the wordmark opens Studio home. Creator, staff, co-op and help
 * links live in the avatar menu.
 */
export function StudioRail() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const { hasAccess } = useStudioAccess();
  const { reducedMotion } = useMotionPrefs();
  const isListeningHomeShown = isShowcase || hasAccess;
  return (
    <aside className={styles.rail}>
      <div className={styles.brandRow}>
        <span className={styles.pulseDot} aria-hidden />
        <Link to={routes.studio} className={styles.brand}>
          <Translation
            i18nKey="studio:brand.lockup"
            components={{ em: <em /> }}
          />
        </Link>
        <span className={styles.product}>{t("studio:brand.studioLabel")}</span>
      </div>

      <nav className={styles.railGrp} aria-label={t("studio:rail.v1.navLabel")}>
        <RailGroup items={isShowcase ? RAIL_MAIN : LIVE_RAIL_LINKS} />
      </nav>

      <AnimatePresence initial={false}>
        {isListeningHomeShown && (
          <m.div
            key="listening"
            className={styles.railBody}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <StudioRailCreatePlaylist />
            <StudioRailPlaylists />
          </m.div>
        )}
      </AnimatePresence>

      <div className={styles.railFoot}>
        <Link
          to={routes.feed}
          className={`${styles.railItem} ${styles.railExit}`}
        >
          <FiArrowLeft aria-hidden className={styles.railIcon} />
          <span className={styles.nm}>
            {t("studio:shell.menu.backToQueerPulse")}
          </span>
        </Link>
      </div>
    </aside>
  );
}
