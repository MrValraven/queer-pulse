import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiCheckCircle, FiPause, FiPlay } from "react-icons/fi";
import { Collapse, useChipMotion } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import type { StudioEpisodeRowView } from "./api/studioEpisodes";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { minutesLeft } from "./player/studioEpisodeRules";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { useStudioEpisodeMemory } from "./player/useStudioEpisodeMemory";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import { StudioMarkPlayedButton } from "./StudioMarkPlayedButton";
import { studioEpisodeUploadPath } from "./studioPaths";
import releaseStyles from "./StudioRelease.module.css";
import css from "./StudioShow.module.css";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/** One episode on the show page (spec 5.2). A draft reaches its owner only
 *  and offers Edit episode in place of Play and Mark as played. An explicit
 *  episode the member hides through their settings keeps its row with no
 *  Play, as the album tracklist does. */
export function StudioEpisodeRow({
  episode,
  release,
}: {
  episode: StudioEpisodeRowView;
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { chip } = useChipMotion();
  const player = useStudioPlayer();
  const episodes = useStudioEpisodeMemory();
  const hideExplicit = useStudioHideExplicit();
  const isHidden = hideExplicit && episode.isExplicit;
  const entry = episodes.entryOf(episode.id);
  const isPlayed = entry?.playedAt !== undefined;
  const isDraft = episode.isDraft === true || episode.number === null;
  const leftMinutes = isPlayed
    ? null
    : minutesLeft(entry?.positionSeconds, episode.durationSeconds);
  const isCurrent = player.isCurrentTrack(episode.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isPlayable =
    episode.hasAudio &&
    !isDraft &&
    !isHidden &&
    release.status !== "taken_down";
  // The server cuts the excerpt (200 characters on a word); two lines show.
  const excerpt = episode.notesExcerpt ?? null;

  return (
    <article
      className={css.episode}
      aria-current={isCurrent ? "true" : undefined}
    >
      {isPlayable ? (
        <button
          type="button"
          className={css.play}
          aria-label={t(
            isPlaying ? "studio:episode.pauseAria" : "studio:episode.playAria",
            { title: episode.title },
          )}
          onClick={() => {
            if (isCurrent) player.togglePlay();
            else
              void playEpisode(
                player,
                queueItemFromEpisode(episode, release),
                showQueueSource(release),
              );
          }}
        >
          {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </button>
      ) : (
        <span className={css.playSpacer} aria-hidden="true" />
      )}
      <div className={css.body}>
        <p className={css.eyebrow}>
          {episode.number !== null &&
            t("studio:episode.number", { number: episode.number })}
          <AnimatePresence initial={false}>
            {episode.number === null && (
              <m.span key="draft" className={css.draftChip} {...chip}>
                {t("studio:show.draftChip")}
              </m.span>
            )}
          </AnimatePresence>
        </p>
        <h3 className={css.title}>
          <Link to={episode.href}>{episode.title}</Link>
          {episode.isExplicit && (
            <abbr
              className={releaseStyles.explicit}
              title={t("studio:release.explicit")}
            >
              {t("studio:release.explicitShort")}
            </abbr>
          )}
        </h3>
        <p className={css.facts}>
          {episode.publishedAt && (
            <time dateTime={episode.publishedAt}>
              {formatters.date(new Date(episode.publishedAt), DATE_FORMAT)}
            </time>
          )}
          <span>
            {leftMinutes !== null
              ? t("studio:episode.minutesLeft", { count: leftMinutes })
              : (episode.durationLabel ?? t("studio:release.processing"))}
          </span>
          <AnimatePresence initial={false}>
            {isPlayed && (
              <m.span key="played" className={css.played} {...chip}>
                <FiCheckCircle aria-hidden /> {t("studio:episode.played")}
              </m.span>
            )}
          </AnimatePresence>
        </p>
        <Collapse isOpen={isHidden}>
          <p className={css.hiddenNote}>
            <StudioHiddenTrackNote />
          </p>
        </Collapse>
        {excerpt && <p className={css.excerpt}>{excerpt}</p>}
      </div>
      <div className={css.actions}>
        {isDraft ? (
          <Link
            to={studioEpisodeUploadPath(release.id, episode.id)}
            className={css.action}
          >
            {t("studio:show.editEpisodeCta")}
            <span className="visuallyHidden"> {episode.title}</span>
          </Link>
        ) : (
          <StudioMarkPlayedButton
            trackId={episode.id}
            title={episode.title}
            className={css.action}
          />
        )}
      </div>
    </article>
  );
}
