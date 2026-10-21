import { Link } from "react-router-dom";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLatestEpisodeView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioMediaCard } from "./kit/StudioMediaCard";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import css from "./StudioFormats.module.css";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/** An episode from an earlier year names its year too. */
const DATE_FORMAT_WITH_YEAR: Intl.DateTimeFormatOptions = {
  ...DATE_FORMAT,
  year: "numeric",
};

function publishedDateOptions(publishedAt: Date): Intl.DateTimeFormatOptions {
  const isThisYear = publishedAt.getFullYear() === new Date().getFullYear();
  return isThisYear ? DATE_FORMAT : DATE_FORMAT_WITH_YEAR;
}

/** Whole minutes left, at least 1 while anything is left. */
function minutesLeftOf(durationSeconds: number, positionSeconds: number) {
  return Math.max(1, Math.ceil((durationSeconds - positionSeconds) / 60));
}

/** The saved place as a thin bar along the foot of the art. Decorative:
 *  the meta line says how much is left in words. */
function StudioEpisodeProgressBar({ share }: { share: number }) {
  return (
    <span className={css.progressTrack} aria-hidden="true">
      <span
        className={css.progressFill}
        style={{ transform: `scaleX(${share})` }}
      />
    </span>
  );
}

/** One episode on a shelf: the show's cover, the episode title, the show
 *  name and the date. Play starts the episode alone (spec 5.6) and resumes
 *  a saved place. With `positionSeconds` (Continue listening) the art shows
 *  how far the member got and the meta line says how much is left. */
export function StudioEpisodeCard({
  episode,
  positionSeconds,
}: {
  episode: StudioLatestEpisodeView;
  positionSeconds?: number;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const { track, release } = episode;
  const publishedAt = track.publishedAt ? new Date(track.publishedAt) : null;
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";
  // Spec 7: the card honours "Hide explicit tracks" and plays only with
  // audio, like every other row.
  const isHidden = useStudioHideExplicit() && track.isExplicit;
  const isPlayBlocked = !track.hasAudio || isHidden;
  const duration = track.durationSeconds ?? 0;
  const hasProgress = positionSeconds !== undefined && duration > 0;
  const savedPosition = positionSeconds ?? 0;
  const progressShare = hasProgress
    ? Math.min(1, Math.max(0, savedPosition / duration))
    : 0;
  return (
    <StudioMediaCard
      kind="episode"
      href={track.href}
      title={track.title}
      isPlaying={isPlaying}
      playLabel={t(
        isPlaying
          ? "studio:episodeCard.pauseAria"
          : "studio:episodeCard.playAria",
        { title: track.title },
      )}
      onPlay={
        isCurrent || !isPlayBlocked
          ? () => {
              if (isCurrent) player.togglePlay();
              else
                void playEpisode(
                  player,
                  queueItemFromEpisode(track, release),
                  showQueueSource(release),
                );
            }
          : undefined
      }
      cover={
        <>
          <StudioReleaseCoverArt
            src={release.coverUrl}
            title={release.title}
            format={release.format}
            tint={release.tint}
          />
          {hasProgress && <StudioEpisodeProgressBar share={progressShare} />}
        </>
      }
      meta={
        <>
          <span className={css.shelfMeta}>
            <Link to={release.href} className={css.metaLink}>
              {release.title}
            </Link>
            {hasProgress ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {t("studio:home.continue.minutesLeft", {
                    count: minutesLeftOf(duration, savedPosition),
                  })}
                </span>
              </>
            ) : (
              publishedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {formatters.date(
                      publishedAt,
                      publishedDateOptions(publishedAt),
                    )}
                  </span>
                </>
              )
            )}
          </span>
          <Collapse isOpen={isHidden}>
            <StudioHiddenTrackNote />
          </Collapse>
        </>
      }
    />
  );
}
