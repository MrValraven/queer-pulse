import { Link, useSearchParams } from "react-router-dom";
import { FiCheck, FiPause, FiPlay, FiPlus } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatTrackTime, type StudioTrackView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { parseStartSeconds } from "./player/studioTimestampLink";
import { StudioTrackMenu } from "./player/ui/StudioTrackMenu";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioDetailHero } from "./StudioDetailHero";
import css from "./StudioEpisode.module.css";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import hiddenCss from "./StudioHiddenTrack.module.css";
import { StudioMarkPlayedButton } from "./StudioMarkPlayedButton";
import heroStyles from "./StudioTrackHero.module.css";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import styles from "./studio.module.css";
import releaseStyles from "./StudioRelease.module.css";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/** An episode's hero (spec 5.3): its show, its date, Play (the episode
 *  alone; a `&t=` link starts there and wins over a saved place), Mark as
 *  played, Save, Add to playlist, the track menu and Share. Nothing
 *  autoplays. "Hide explicit tracks" hides Play as on the track hero. */
export function StudioEpisodeHero({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const isHidden = useStudioHideExplicit() && track.isExplicit;
  // A show usually carries its persona's name; the line names it once.
  const isArtistNamedAsShow = track.release.artist.name === track.release.title;
  return (
    <div
      className={[css.heroFrame, isHidden && hiddenCss.hidden]
        .filter(Boolean)
        .join(" ")}
    >
      <StudioDetailHero
        art={
          <ImageSlot
            src={track.release.coverUrl ?? undefined}
            tint={track.release.tint}
            width="100%"
            height="100%"
            radius={16}
            placeholder={`${t("studio:media.coverLabel")} · ${track.release.title}`}
            style={{ position: "absolute", inset: 0 }}
            loading="eager"
            fetchPriority="high"
          />
        }
        kind={t("studio:episode.crumbLabel")}
        title={track.title}
        by={
          <>
            {t("studio:episode.fromLabel")}{" "}
            <Link to={track.release.href}>
              <strong>{track.release.title}</strong>
            </Link>
            {!isArtistNamedAsShow && (
              <>
                {" · "}
                <Link to={track.release.artist.href}>
                  {track.release.artist.name}
                </Link>
              </>
            )}
            {track.publishedAt &&
              ` · ${t("studio:episode.publishedOn", {
                date: formatters.date(new Date(track.publishedAt), DATE_FORMAT),
              })}`}
            <div className={styles.stats}>
              {track.durationLabel && <span>{track.durationLabel}</span>}
              {track.isExplicit && (
                <>
                  <span className={styles.dot} />
                  <span>{t("studio:release.explicit")}</span>
                </>
              )}
              {isHidden && <StudioHiddenTrackNote />}
            </div>
          </>
        }
        actions={<EpisodeHeroActions track={track} isHidden={isHidden} />}
      />
    </div>
  );
}

/** The hero's action row in two groups that wrap whole: Play with its start
 *  time and Mark as played, then Save, Add to playlist, the menu and Share
 *  (the menu and Share keep one line). A published episode without audio
 *  offers Share beside an inert Play; a draft shows the inert Play alone. */
function EpisodeHeroActions({
  track,
  isHidden,
}: {
  track: StudioTrackView;
  isHidden: boolean;
}) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const player = useStudioPlayer();
  const { share } = useShareLink({
    copied: t("studio:detail.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const save = useStudioSaveToggle({
    savedId: track.savedId,
    kind: "studio_track",
    title: track.title,
    href: track.href,
    meta: track.release.artist.name,
  });
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isPlayable = track.hasAudio && track.isDraft !== true;
  // A shared timestamp link (?t=) applies until this episode is the current
  // one, as on the track page; a hidden episode has no play to carry it.
  const startAtSeconds =
    isCurrent || isHidden || !isPlayable
      ? null
      : parseStartSeconds(searchParams, track.durationSeconds);
  const startLabel =
    startAtSeconds === null ? null : (formatTrackTime(startAtSeconds) ?? null);
  return (
    <>
      <div className={css.actionGroup}>
        {!isHidden && (
          <button
            type="button"
            className={`${styles.playBig} ${releaseStyles.heroPlay}`}
            aria-disabled={!isPlayable || undefined}
            aria-label={
              startLabel
                ? t("studio:player.playFromAria", {
                    title: track.title,
                    time: startLabel,
                  })
                : t(
                    isPlaying
                      ? "studio:episode.pauseAria"
                      : "studio:episode.playAria",
                    { title: track.title },
                  )
            }
            onClick={() => {
              if (!isPlayable) return;
              if (isCurrent) player.togglePlay();
              else
                void playEpisode(
                  player,
                  queueItemFromEpisode(track, track.release),
                  showQueueSource(track.release),
                  startAtSeconds ?? undefined,
                );
            }}
          >
            {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          </button>
        )}
        {startLabel && (
          <span className={heroStyles.playFromLabel} aria-hidden="true">
            {t("studio:player.playFrom", { time: startLabel })}
          </span>
        )}
        {isPlayable && (
          <StudioMarkPlayedButton trackId={track.id} title={track.title} />
        )}
      </div>
      {track.isDraft !== true && (
        <div className={css.actionGroup}>
          {isPlayable && (
            <>
              <button
                type="button"
                aria-pressed={save.isSaved}
                aria-label={t(
                  save.isSaved
                    ? "studio:save.removeSavedCta"
                    : "studio:save.saveReleaseCta",
                  { title: track.title },
                )}
                onClick={save.toggle}
              >
                {save.isSaved ? (
                  <FiCheck aria-hidden />
                ) : (
                  <FiPlus aria-hidden />
                )}{" "}
                {save.isSaved
                  ? t("studio:save.savedLabel")
                  : t("studio:save.saveCta")}
              </button>
              <StudioAddToPlaylistButton
                trackIds={[track.id]}
                subjectTitle={track.title}
                label={t("studio:playlist.add.trackCta")}
              />
            </>
          )}
          <div className={css.actionPair}>
            {isPlayable && (
              <StudioTrackMenu
                track={{
                  id: track.id,
                  title: track.title,
                  href: track.href,
                  hasAudio: track.hasAudio,
                  isExplicit: track.isExplicit,
                }}
              />
            )}
            <button
              type="button"
              onClick={() => void share(window.location.href)}
            >
              {t("studio:detail.shareCta")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
