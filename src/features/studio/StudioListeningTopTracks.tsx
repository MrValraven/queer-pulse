import { AnimatePresence } from "motion/react";
import { useCallback, useId, useMemo } from "react";
import { MeasuredHeightFrame } from "../../shared/components/layout/MeasuredHeightFrame";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioListeningSummaryView } from "./api/studioListening.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioTrackRow } from "./kit/StudioTrackRow";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { isSameName } from "./studioSameName";
import styles from "./StudioListeningSummary.module.css";

type TopTrack = StudioListeningSummaryView["topTracks"][number];

function StudioListeningTopTrackRow({
  row,
  index,
  shouldHideExplicit,
}: {
  row: TopTrack;
  index: number;
  shouldHideExplicit: boolean;
}) {
  const { t } = useTranslation();
  const { isCurrentTrack, status, togglePlay, playRelease } = useStudioPlayer();
  const { track, listens } = row;
  const isCurrent = isCurrentTrack(track.id);
  const releaseId = track.release.id;
  const trackId = track.id;
  const handlePlay = useCallback(() => {
    if (isCurrent) togglePlay();
    else void playRelease(releaseId, trackId);
  }, [isCurrent, togglePlay, playRelease, releaseId, trackId]);
  const listensLabel = t("studio:listening.listens", { count: listens });
  // Under the artist line, so the title keeps the row's width in a half
  // column. Memoised, so the memoised row skips renders the count did not
  // change.
  const details = useMemo(
    () => <span className={styles.trackListens}>{listensLabel}</span>,
    [listensLabel],
  );
  return (
    <StudioTrackRow
      track={track}
      index={index}
      isCurrent={isCurrent}
      isPlaying={isCurrent && status === "playing"}
      onPlay={handlePlay}
      showRelease={
        !isSameName(track.release.title, track.title) &&
        !isSameName(track.release.title, track.release.artist.name)
      }
      shouldHideExplicit={shouldHideExplicit}
      details={details}
      className={styles.topTrackRow}
      isLayoutAnimated
      isDraggable
    />
  );
}

/** The listener's most played tracks in the chosen range, each playable.
 *  A range change fades rows out and in, slides the ones that stay to their
 *  new rank, and the frame eases the list to its new height. */
export function StudioListeningTopTracks({ tracks }: { tracks: TopTrack[] }) {
  const { t } = useTranslation();
  const headingId = useId();
  const shouldHideExplicit = useStudioHideExplicit();
  return (
    <div className={styles.listBlock}>
      <h2 id={headingId} className={styles.heading}>
        {t("studio:listening.topTracks.heading")}
      </h2>
      <MeasuredHeightFrame className={styles.topTracksFrame}>
        <ol className={styles.list} aria-labelledby={headingId}>
          <AnimatePresence>
            {tracks.map((row, index) => (
              <StudioListeningTopTrackRow
                key={row.track.id}
                row={row}
                index={index}
                shouldHideExplicit={shouldHideExplicit}
              />
            ))}
          </AnimatePresence>
        </ol>
      </MeasuredHeightFrame>
    </div>
  );
}
