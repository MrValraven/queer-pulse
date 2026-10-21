import { Link, useSearchParams } from "react-router-dom";
import { Tooltip } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatTrackTime, type StudioTrackView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { parseStartSeconds } from "./player/studioTimestampLink";
import { StudioTrackMenu } from "./player/ui/StudioTrackMenu";
import { studioTrackMenuTrackOf } from "./player/ui/studioTrackMenuTrack";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioHeroShare } from "./StudioHeroShare";
import css from "./StudioEpisode.module.css";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import hiddenCss from "./StudioHiddenTrack.module.css";
import { StudioLikeButton } from "./StudioLikeButton";
import { StudioMarkPlayedButton } from "./StudioMarkPlayedButton";
import { useIsHeroCompact } from "./studioHeroLayout";
import heroStyles from "./StudioTrackHero.module.css";
import styles from "./studio.module.css";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";

/** Under this width Share leaves the row for the menu's own Send in a
 *  message and Copy link, so the row keeps one line beside the cover. */
const SHARE_FOLD_MAX_WIDTH = 1439;

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/** An episode's hero (spec 5.3): its show, its date, Play (the episode
 *  alone; a `&t=` link starts there and wins over a saved place), Mark as
 *  played, Like, Add to playlist, the track menu and Share. Nothing
 *  autoplays. "Hide explicit tracks" hides Play as on the track hero. */
export function StudioEpisodeHero({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const isHidden = useStudioHideExplicit() && track.isExplicit;
  const isCompact = useIsHeroCompact();
  // A show usually carries its persona's name; the line names it once.
  const isArtistNamedAsShow = track.release.artist.name === track.release.title;
  return (
    <div
      className={[css.heroFrame, isHidden && hiddenCss.hidden]
        .filter(Boolean)
        .join(" ")}
    >
      <StudioDetailHero
        tint={track.release.tint}
        isActionsCompact={isCompact}
        art={
          <StudioReleaseCoverArt
            src={track.release.coverUrl}
            title={track.release.title}
            format={track.release.format}
            tint={track.release.tint}
            radius={16}
            isPriority
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
            {track.durationLabel && ` · ${track.durationLabel}`}
            {(track.isExplicit || isHidden) && (
              <div className={styles.stats}>
                {track.isExplicit && (
                  <span>{t("studio:release.explicit")}</span>
                )}
                {isHidden && <StudioHiddenTrackNote />}
              </div>
            )}
          </>
        }
        actions={
          <EpisodeHeroActions
            track={track}
            isHidden={isHidden}
            isCompact={isCompact}
          />
        }
      />
    </div>
  );
}

/** The hero's action row in two groups that wrap whole: Play with its start
 *  time and Mark as played, then Like, Add to playlist, Share and the menu,
 *  which stays last. Below 1440px Share folds into the menu (Send in a
 *  message, Copy link), and on a phone every action after Play is a round
 *  icon with a tooltip. A published episode without audio offers Share
 *  beside an inert Play; a draft shows the inert Play alone. */
function EpisodeHeroActions({
  track,
  isHidden,
  isCompact,
}: {
  track: StudioTrackView;
  isHidden: boolean;
  isCompact: boolean;
}) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const player = useStudioPlayer();
  const isShareFolded = useMediaQuery(mediaMax(SHARE_FOLD_MAX_WIDTH));
  const likeSubject = {
    trackId: track.id,
    title: track.title,
    href: track.href,
    artistName: track.release.artist.name,
  };
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
  const addLabel = t("studio:playlist.add.trackCta");
  return (
    <>
      <div className={css.actionGroup}>
        {!isHidden && (
          <StudioPlayButton
            state={!isPlayable ? "blocked" : isPlaying ? "playing" : "idle"}
            blockedReason={
              isPlayable
                ? undefined
                : t(
                    track.isDraft === true
                      ? "studio:episode.draftReason"
                      : "studio:episode.noAudioReason",
                  )
            }
            label={
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
            onToggle={() => {
              if (isCurrent) player.togglePlay();
              else
                void playEpisode(
                  player,
                  queueItemFromEpisode(track, track.release),
                  showQueueSource(track.release),
                  startAtSeconds ?? undefined,
                );
            }}
          />
        )}
        {startLabel && !isCompact && (
          <span className={heroStyles.playFromLabel} aria-hidden="true">
            {t("studio:player.playFrom", { time: startLabel })}
          </span>
        )}
        {isPlayable && (
          <StudioMarkPlayedButton
            trackId={track.id}
            title={track.title}
            isIconOnly={isCompact}
          />
        )}
      </div>
      {track.isDraft !== true && (
        <div className={css.actionGroup}>
          {isPlayable && (
            <>
              <Tooltip
                label={t("studio:like.cta")}
                placement="top"
                isDisabled={!isCompact}
              >
                <StudioLikeButton
                  subject={likeSubject}
                  variant={isCompact ? "icon" : "labelled"}
                />
              </Tooltip>
              <Tooltip label={addLabel} placement="top" isDisabled={!isCompact}>
                <StudioAddToPlaylistButton
                  trackIds={[track.id]}
                  subjectTitle={track.title}
                  label={isCompact ? undefined : addLabel}
                  ariaLabel={
                    isCompact
                      ? t("studio:playlist.add.trackAria", {
                          title: track.title,
                        })
                      : undefined
                  }
                  likeSubject={likeSubject}
                />
              </Tooltip>
            </>
          )}
          <div className={css.actionPair}>
            {(!isPlayable || !isShareFolded) && (
              <StudioHeroShare
                target={{ kind: "track", id: track.id, startAtSeconds: null }}
                title={track.title}
                isIconOnly={isCompact}
              />
            )}
            {isPlayable && (
              <Tooltip
                label={t("studio:release.moreActions")}
                placement="top"
                align="end"
              >
                <StudioTrackMenu
                  className={heroStyles.heroMenu}
                  track={studioTrackMenuTrackOf(track)}
                />
              </Tooltip>
            )}
          </div>
        </div>
      )}
    </>
  );
}
