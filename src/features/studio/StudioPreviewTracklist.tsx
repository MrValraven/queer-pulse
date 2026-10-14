import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromRelease } from "./player/studioQueue";
import styles from "./StudioPreview.module.css";
import { StudioPreviewTrackRow } from "./StudioPreviewTrackRow";

/** The preview's tracks: each plays through the preview link. No track
 *  pages (they 404 for a release that is not out) and no track menu.
 *  Tracks hidden by "Hide explicit tracks" grey out as on the release page. */
export function StudioPreviewTracklist({
  release,
  previewToken,
}: {
  release: StudioReleaseView;
  previewToken: string;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const hideExplicit = useStudioHideExplicit();
  return (
    <ol
      className={styles.tracks}
      aria-label={t("studio:release.tracklistLabel", { title: release.title })}
    >
      {release.tracks.map((track) => {
        const isCurrent = player.isCurrentTrack(track.id);
        const isPlaying = isCurrent && player.status === "playing";
        return (
          <StudioPreviewTrackRow
            key={track.id}
            track={track}
            isCurrent={isCurrent}
            isPlaying={isPlaying}
            isHidden={hideExplicit && track.isExplicit}
            onPlay={() => {
              if (isCurrent) player.togglePlay();
              else {
                // Hidden explicit tracks stay in the queue: the player drops
                // them itself. A show queues just this row's episode.
                const queue = queueFromRelease(release, previewToken, track.id);
                void player.playTracks(queue, track.id);
              }
            }}
          />
        );
      })}
    </ol>
  );
}
