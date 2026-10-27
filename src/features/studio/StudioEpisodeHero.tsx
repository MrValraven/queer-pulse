import { useSearchParams } from "react-router-dom";
import { Tooltip } from "../../shared/components/ui";
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
import { StudioMorphLink } from "./StudioMorphLink";
import {
  useIsHeroActionsCompact,
  useIsHeroShareFolded,
} from "./studioHeroLayout";
import heroStyles from "./StudioTrackHero.module.css";
import styles from "./studio.module.css";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";
import { useStudioLikeBlockedReason } from "./useStudioLikeBlockedReason";
import {
  StudioFoldedShareItemsContext,
  useStudioFoldedShareItems,
} from "./useStudioFoldedShareItem";

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
  const isCompact = useIsHeroActionsCompact();
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
            <StudioMorphLink to={track.release.href} destination="release">
              <strong>{track.release.title}</strong>
            </StudioMorphLink>
            {!isArtistNamedAsShow && (
              <>
                {" · "}
                <StudioMorphLink
                  to={track.release.artist.href}
                  destination="artist"
                >
                  {track.release.artist.name}
                </StudioMorphLink>
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
 *  which stays last. Below 1440px Share folds into the menu with every way
 *  to share, and below 1280px every action after Play is a round icon with
 *  a tooltip ("Play from {time}" keeps its words). A published episode
 *  without audio offers Share beside an inert Play; a draft shows the inert
 *  Play alone. */
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
  const isShareFolded = useIsHeroShareFolded();
  const likeSubject = {
    trackId: track.id,
    title: track.title,
    href: track.href,
    artistName: track.release.artist.name,
  };
  const likeBlockedReason = useStudioLikeBlockedReason(
    likeSubject,
    track.isReleaseWithdrawn,
  );
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isPlayable = track.hasAudio && track.isDraft !== true;
  // The menu shows only for a playable episode, so the fold needs one.
  const foldedShare = useStudioFoldedShareItems(
    isPlayable && isShareFolded
      ? {
          target: { kind: "track", id: track.id, startAtSeconds: null },
          title: track.title,
        }
      : undefined,
  );
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
        {startLabel && (
          <span
            className={heroStyles.playFromLabel}
            data-hero-play-from=""
            aria-hidden="true"
          >
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
                label={likeBlockedReason ?? t("studio:like.cta")}
                placement="top"
                isDisabled={!isCompact && !likeBlockedReason}
              >
                <StudioLikeButton
                  subject={likeSubject}
                  variant={isCompact ? "icon" : "labelled"}
                  blockedReason={likeBlockedReason}
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
                  likeSubject={
                    track.isReleaseWithdrawn ? undefined : likeSubject
                  }
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
              <StudioFoldedShareItemsContext value={foldedShare.items}>
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
              </StudioFoldedShareItemsContext>
            )}
            {foldedShare.dialog}
          </div>
        </div>
      )}
    </>
  );
}
