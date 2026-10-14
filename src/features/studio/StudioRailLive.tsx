import { Link, NavLink, useLocation } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "./api/useStudioAccess";
import { RailGroup, railClass } from "./StudioRailGroup";
import {
  LIVE_RAIL_FLAG_REVIEW_LINK,
  LIVE_RAIL_LINKS,
  LIVE_RAIL_UTILITY_LINKS,
} from "./studioRailLive.data";
import { useIsStudioStaff } from "./useIsStudioStaff";
import { studioUploadPath } from "./studioPaths";
import styles from "./studio.module.css";

/** The rail a granted member sees: Home, Search, Library, Open calls and the
 *  Solidarity fund; Upload, Your numbers, Press kit and one "Your releases" link per
 *  musician or DJ persona they own; and Help and info (Help, About Studio,
 *  Rights and takedowns, Studio terms, Accessibility, plus Flag review for
 *  staff). */
export function StudioRailLive() {
  const { t } = useTranslation();
  const location = useLocation();
  const { uploadablePersonas } = useStudioAccess();
  const isStaff = useIsStudioStaff();
  const utilityLinks = isStaff
    ? [...LIVE_RAIL_UTILITY_LINKS, LIVE_RAIL_FLAG_REVIEW_LINK]
    : LIVE_RAIL_UTILITY_LINKS;
  const openArtistId =
    location.pathname === routes.studioArtist
      ? new URLSearchParams(location.search).get("id")
      : null;

  return (
    <>
      <nav className={styles.railGrp} aria-label={t("studio:rail.v1.navLabel")}>
        <RailGroup items={LIVE_RAIL_LINKS} />
      </nav>
      {uploadablePersonas.length > 0 && (
        <>
          <div className={styles.railDivider} />
          <div className={styles.railGrp}>
            <h5>{t("studio:rail.v1.yourMusic")}</h5>
            <NavLink to={studioUploadPath()} end className={railClass}>
              <span className={styles.nm}>{t("studio:rail.v1.upload")}</span>
            </NavLink>
            <NavLink to={routes.studioDashboard} className={railClass}>
              <span className={styles.nm}>
                {t("studio:rail.v2.yourNumbers")}
              </span>
            </NavLink>
            <NavLink to={routes.studioPressEdit} className={railClass}>
              <span className={styles.nm}>{t("studio:rail.v3.pressKit")}</span>
            </NavLink>
            {uploadablePersonas.map((persona) => {
              const isActive = openArtistId === persona.id;
              return (
                <Link
                  key={persona.id}
                  to={persona.href}
                  className={railClass({ isActive })}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.nm}>
                    {t("studio:rail.v1.yourReleases", { name: persona.name })}
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
      <div className={styles.railDivider} />
      <nav
        className={styles.railGrp}
        aria-label={t("studio:rail.live.utilityLabel")}
      >
        <h5>{t("studio:rail.live.utilityLabel")}</h5>
        <RailGroup items={utilityLinks} />
      </nav>
    </>
  );
}
