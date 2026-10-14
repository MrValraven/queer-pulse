import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLikedTracks } from "./api/useStudioLikedTracks";
import { StudioLikedCover } from "./StudioLikedCover";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioPlaylist.module.css";

/** Liked songs on the library's Playlists grid, always first. It mirrors
 *  StudioPlaylistCard: the cover link sits out of the tab order and the
 *  title link is the one a keyboard or screen reader meets. Only the member
 *  ever sees it, so it always reads Private. */
export function StudioLikedSongsCard() {
  const { t } = useTranslation();
  const { trackCount, loadState } = useStudioLikedTracks();
  const hasCount = !loadState.isLoading && !loadState.isError;
  return (
    <article className={styles.card}>
      <div className={kit.coverArea}>
        <Link
          to={routes.studioLiked}
          className={kit.coverLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className={styles.cardCov}>
            <StudioLikedCover />
          </div>
        </Link>
      </div>
      <h4>
        <Link to={routes.studioLiked} className={kit.titleLink}>
          {t("studio:liked.title")}
        </Link>
      </h4>
      <div className={`${styles.meta} ${css.metaRow}`}>
        {hasCount && (
          <FadeIn as="span">
            {t("studio:facts.trackCount", { count: trackCount })}
          </FadeIn>
        )}
        <span className={css.visibilityChip}>
          {t("studio:playlist.visibility.private")}
        </span>
      </div>
    </article>
  );
}
