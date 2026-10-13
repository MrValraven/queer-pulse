import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistCardView } from "../studio/api/studio.adapters";
import { StudioPlaylistCover } from "../studio/StudioPlaylistCover";
import styles from "./PersonaStudioReleases.module.css";

/** Public Studio playlists credited to this persona, under its releases.
 *  Each opens in Studio; in the editor preview they show and do not
 *  navigate. */
export function PersonaStudioPlaylists({
  playlists,
  isInteractive = true,
}: {
  playlists: StudioPlaylistCardView[];
  isInteractive?: boolean;
}) {
  const { t } = useTranslation();
  if (playlists.length === 0) return null;
  return (
    <div className={styles.playlists}>
      <h3 className={styles.subheading}>
        {t("subprofiles:studioPlaylists.heading")}
      </h3>
      <ul
        className={styles.grid}
        aria-label={t("subprofiles:studioPlaylists.label")}
      >
        {playlists.map((playlist) => {
          const body = (
            <>
              <span className={styles.cover}>
                <StudioPlaylistCover
                  coverUrls={playlist.coverUrls}
                  tint={playlist.tint}
                  label=""
                  radius={8}
                />
              </span>
              <span className={styles.title}>{playlist.name}</span>
              <span className={styles.meta}>
                {t("subprofiles:studioPlaylists.trackCount", {
                  count: playlist.trackCount,
                })}
              </span>
            </>
          );
          return (
            <li key={playlist.id}>
              {isInteractive ? (
                <Link to={playlist.href} className={styles.card}>
                  {body}
                </Link>
              ) : (
                <span className={styles.card}>{body}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
