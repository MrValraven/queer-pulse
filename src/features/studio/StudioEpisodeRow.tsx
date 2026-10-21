import { useCallback, useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiCheckCircle } from "react-icons/fi";
import { useChipMotion } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import type { StudioEpisodeRowView } from "./api/studioEpisodes";
import {
  StudioTrackRow,
  type StudioTrackRowAction,
  type StudioTrackRowHeadingLevel,
  type StudioTrackSummary,
} from "./kit/StudioTrackRow";
import { minutesLeft } from "./player/studioEpisodeRules";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { useStudioEpisodeMemory } from "./player/useStudioEpisodeMemory";
import { StudioMarkPlayedButton } from "./StudioMarkPlayedButton";
import { studioEpisodeUploadPath } from "./studioPaths";
import css from "./StudioShow.module.css";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/** A draft reaches its owner only: no like, no playlist, no track menu. */
const DRAFT_HIDDEN_ACTIONS: readonly StudioTrackRowAction[] = [
  "like",
  "addToPlaylist",
  "menu",
];

/** Where a listener left off: a thin bar and "N min left", or Played. The
 *  bar is decoration; the words say it. */
function EpisodeProgress({
  leftMinutes,
  progress,
  isPlayed,
}: {
  leftMinutes: number | null;
  progress: number;
  isPlayed: boolean;
}) {
  const { t } = useTranslation();
  const { chip } = useChipMotion();
  return (
    <span className={css.progress}>
      <AnimatePresence initial={false} mode="popLayout">
        {isPlayed ? (
          <m.span key="played" className={css.played} {...chip}>
            <FiCheckCircle aria-hidden /> {t("studio:episode.played")}
          </m.span>
        ) : leftMinutes !== null ? (
          <m.span key="left" className={css.progressLeft} {...chip}>
            <span
              className={css.progressBar}
              style={{ "--episode-progress": progress } as CSSProperties}
              aria-hidden="true"
            />
            <span>
              {t("studio:episode.minutesLeft", { count: leftMinutes })}
            </span>
          </m.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

/** One episode on the show page (spec 5.2), on the shared track row: play,
 *  the explicit badge, the heart, Add to playlist and the track menu (Play
 *  next, Add to queue, Share), with the date, the notes excerpt and, once
 *  started, the progress bar and minutes left. A draft reaches its owner
 *  only and offers Edit episode in place of Play and Mark as played. An
 *  explicit episode the member hides keeps its row with no Play. */
export function StudioEpisodeRow({
  episode,
  release,
  index,
  headingLevel = 3,
  shouldHideExplicit,
}: {
  episode: StudioEpisodeRowView;
  release: StudioReleaseView;
  index: number;
  headingLevel?: StudioTrackRowHeadingLevel;
  /** The list reads "Hide explicit tracks" once; left out, the row does. */
  shouldHideExplicit?: boolean;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const episodes = useStudioEpisodeMemory();
  const entry = episodes.entryOf(episode.id);
  const isPlayed = entry?.playedAt !== undefined;
  const isDraft = episode.isDraft === true || episode.number === null;
  const leftMinutes = isPlayed
    ? null
    : minutesLeft(entry?.positionSeconds, episode.durationSeconds);
  const progress =
    episode.durationSeconds && entry?.positionSeconds !== undefined
      ? Math.min(1, entry.positionSeconds / episode.durationSeconds)
      : 0;
  const isCurrent = player.isCurrentTrack(episode.id);
  const summary = useMemo(
    (): StudioTrackSummary => ({ ...episode, release }),
    [episode, release],
  );
  const onPlay = useCallback(() => {
    if (player.isCurrentTrack(episode.id)) player.togglePlay();
    else
      void playEpisode(
        player,
        queueItemFromEpisode(episode, release),
        showQueueSource(release),
      );
  }, [player, episode, release]);
  // The server cuts the excerpt (200 characters on a word); two lines show.
  const excerpt = episode.notesExcerpt ?? null;

  return (
    <StudioTrackRow
      track={summary}
      index={index}
      showCover={false}
      showArtist={false}
      showRelease={false}
      headingLevel={headingLevel}
      isCurrent={isCurrent}
      isPlaying={isCurrent && player.status === "playing"}
      onPlay={onPlay}
      isPlayBlocked={isDraft || release.status === "taken_down"}
      isOwnerView={release.isOwner}
      shouldHideExplicit={shouldHideExplicit}
      hiddenActions={isDraft ? DRAFT_HIDDEN_ACTIONS : undefined}
      isLayoutAnimated
      trailing={
        <EpisodeProgress
          leftMinutes={leftMinutes}
          progress={progress}
          isPlayed={isPlayed}
        />
      }
      details={
        <>
          <p className={css.facts}>
            {/* The lead cell already shows the episode's number. */}
            {isDraft && (
              <span className={css.draftChip}>
                {t("studio:show.draftChip")}
              </span>
            )}
            {episode.publishedAt && (
              <time dateTime={episode.publishedAt}>
                {formatters.date(new Date(episode.publishedAt), DATE_FORMAT)}
              </time>
            )}
          </p>
          {excerpt && <p className={css.excerpt}>{excerpt}</p>}
        </>
      }
      extraActions={
        isDraft ? (
          <Link
            to={studioEpisodeUploadPath(release.id, episode.id)}
            className={css.action}
          >
            {t("studio:show.editEpisodeCta")}
            <span className="visuallyHidden"> {episode.title}</span>
          </Link>
        ) : (
          // Rests faint with the row's other actions until the row is
          // hovered or focused; touch keeps it in view.
          <span data-studio-row-extra="hover">
            <StudioMarkPlayedButton
              trackId={episode.id}
              title={episode.title}
              isIconOnly
            />
          </span>
        )
      }
    />
  );
}
