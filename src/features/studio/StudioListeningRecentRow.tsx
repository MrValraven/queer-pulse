import { useCallback, useMemo } from "react";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchTrackView } from "./api/studio.adapters";
import type { StudioListenView } from "./api/studioListening.adapters";
import {
  StudioTrackRow,
  StudioTrackRowUnavailable,
} from "./kit/StudioTrackRow";
import { useStudioPlayer } from "./player/studioPlayerContext";
import styles from "./StudioListeningLists.module.css";

function isSameDay(first: Date, second: Date): boolean {
  return first.toDateString() === second.toDateString();
}

/** A single named after its track (or a release named after its artist)
 *  would print a name twice, so the release drops out of the line when the
 *  names match, ignoring case and outer spaces. */
function isSameName(first: string, second: string): boolean {
  return first.trim().toLowerCase() === second.trim().toLowerCase();
}

/** "Played 12 Oct", or the time for a listen from today. */
function usePlayedOnLabel(playedAt: Date): string {
  const { t } = useTranslation();
  const fmt = useFormat();
  const date = isSameDay(playedAt, new Date())
    ? fmt.time(playedAt)
    : fmt.date(playedAt, { day: "numeric", month: "short" });
  return t("studio:listening.recent.playedOn", { date });
}

function StudioListeningPlayableRow({
  track,
  index,
  playedOnLabel,
  shouldHideExplicit,
}: {
  track: StudioSearchTrackView;
  index: number;
  playedOnLabel: string;
  shouldHideExplicit: boolean;
}) {
  const { isCurrentTrack, status, togglePlay, playRelease } = useStudioPlayer();
  const isCurrent = isCurrentTrack(track.id);
  const releaseId = track.release.id;
  const trackId = track.id;
  const handlePlay = useCallback(() => {
    if (isCurrent) togglePlay();
    else void playRelease(releaseId, trackId);
  }, [isCurrent, togglePlay, playRelease, releaseId, trackId]);
  const trailing = useMemo(
    () => <span className={styles.playedOn}>{playedOnLabel}</span>,
    [playedOnLabel],
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
      trailing={trailing}
      isDraggable
    />
  );
}

/** One listen in the history. The same track can sit here many times, so
 *  the list keys rows by listen. A track the listener can no longer play
 *  keeps its place, says so, and keeps the date it was played. */
export function StudioListeningRecentRow({
  listen,
  index,
  shouldHideExplicit,
}: {
  listen: StudioListenView;
  index: number;
  shouldHideExplicit: boolean;
}) {
  const { t } = useTranslation();
  const playedOnLabel = usePlayedOnLabel(listen.playedAt);
  if (listen.track === null)
    return (
      <StudioTrackRowUnavailable
        number={index + 1}
        label={t("studio:listening.recent.unavailable")}
        details={
          // The row has no button or link, so this line is where focus
          // lands when Show more adds it as a page's first row
          // (`data-history-row`).
          <span
            className={styles.historyFocusTarget}
            tabIndex={-1}
            data-history-row=""
          >
            {playedOnLabel}
          </span>
        }
      />
    );
  return (
    <StudioListeningPlayableRow
      track={listen.track}
      index={index}
      playedOnLabel={playedOnLabel}
      shouldHideExplicit={shouldHideExplicit}
    />
  );
}
