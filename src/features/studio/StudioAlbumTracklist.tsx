import { useCallback, useId, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import {
  StudioTrackRow,
  type StudioTrackRowAction,
  type StudioTrackSummary,
} from "./kit/StudioTrackRow";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import css from "./StudioAlbumTracklist.module.css";

const PER_PLAY_AMOUNT = 0.05;

/** A preview read through its private link shows its rows without the
 *  heart, Add to playlist or the track menu (agreed with Studio v3); a
 *  draft or taken-down release offers neither the heart nor the add. */
const PREVIEW_HIDDEN: readonly StudioTrackRowAction[] = [
  "like",
  "addToPlaylist",
  "menu",
];
const UNPUBLISHED_HIDDEN: readonly StudioTrackRowAction[] = [
  "like",
  "addToPlaylist",
];
const TAKEN_DOWN_HIDDEN: readonly StudioTrackRowAction[] = [
  "like",
  "addToPlaylist",
  "menu",
];
const NONE_HIDDEN: readonly StudioTrackRowAction[] = [];

function hiddenActionsOf(release: StudioReleaseView) {
  if (release.isPreview) return PREVIEW_HIDDEN;
  if (release.status === "taken_down") return TAKEN_DOWN_HIDDEN;
  if (release.status !== "published") return UNPUBLISHED_HIDDEN;
  return NONE_HIDDEN;
}

/**
 * The playable tracklist on the shared Studio track row: the number turns
 * to play on hover, the playing row shows its equaliser, and the rows
 * arrive in a short stagger. Each row's play is stable across player
 * ticks, so only the rows whose state moved re-render. A listener's
 * withheld track keeps its place and number and offers nothing.
 */
export function StudioAlbumTracklist({
  release,
}: {
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const shouldHideExplicit = useStudioHideExplicit();
  const headingId = useId();
  // The server refuses every stream on a taken-down release, owners included.
  const isStreamable = release.status !== "taken_down";
  const hiddenActions = hiddenActionsOf(release);

  // The latest player behind one stable handler per track.
  const playerRef = useRef(player);
  useLayoutEffect(() => {
    playerRef.current = player;
  });
  const playTrack = useCallback(
    (trackId: string) => {
      const latest = playerRef.current;
      if (latest.isCurrentTrack(trackId)) latest.togglePlay();
      else void latest.playRelease(release.id, trackId);
    },
    [release.id],
  );
  const rows = useMemo(
    () =>
      release.tracks.map((track) => ({
        summary: { ...track, release } satisfies StudioTrackSummary,
        onPlay: () => playTrack(track.id),
      })),
    [release, playTrack],
  );
  // Showcase money, said once above the list instead of on every row.
  const perPlayNote = isShowcase
    ? t("studio:album.main.perPlayNote", {
        amount: formatters.currency(PER_PLAY_AMOUNT),
      })
    : null;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.visuallyHidden}>
        {t("studio:release.tracklistLabel", { title: release.title })}
      </h2>
      {perPlayNote && <p className={css.perPlay}>{perPlayNote}</p>}
      <ol className={css.list} aria-labelledby={headingId}>
        {rows.map(({ summary, onPlay }) => {
          const isCurrent = player.isCurrentTrack(summary.id);
          return (
            <StudioTrackRow
              key={summary.id}
              track={summary}
              showCover={false}
              showRelease={false}
              isCurrent={isCurrent}
              isPlaying={isCurrent && player.status === "playing"}
              onPlay={onPlay}
              isPlayBlocked={!isStreamable}
              isOwnerView={release.isOwner}
              hiddenActions={hiddenActions}
              shouldHideExplicit={shouldHideExplicit}
              headingLevel={3}
            />
          );
        })}
      </ol>
    </section>
  );
}
