import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheckCircle, FiRotateCcw } from "react-icons/fi";
import { Tooltip, useChipMotion } from "../../../../shared/components/ui";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioTrack } from "../../api/useStudioTrack";
import { StudioAddToPlaylistButton } from "../../StudioAddToPlaylistButton";
import { StudioLikeButton } from "../../StudioLikeButton";
import { studioReleasePath } from "../../studioPaths";
import type { StudioLikeSubject } from "../../useStudioLike";
import type { StudioQueueItem } from "../studioPlayerContext";
import { useStudioEpisodeMemory } from "../useStudioEpisodeMemory";
import { StudioIconSwap } from "./StudioIconSwap";
import { StudioTrackMenu } from "./StudioTrackMenu";
import {
  studioTrackMenuTrackOf,
  type StudioTrackMenuTrack,
} from "./studioTrackMenuTrack";
import styles from "./StudioNowPlaying.module.css";

/** The menu's track from the queue item, until the track's detail answers.
 *  Report waits for the detail, which knows whether the release is out. */
function menuTrackOf(item: StudioQueueItem): StudioTrackMenuTrack {
  return {
    id: item.trackId,
    title: item.title,
    href: item.trackHref,
    hasAudio: true,
    isExplicit: item.isExplicit,
    artistId: item.artistId,
    artistHref: item.artistHref,
    artistName: item.artistName,
    releaseHref: studioReleasePath(item.releaseId),
  };
}

/** Mark as played or unplayed, for an episode, kept on this device. The
 *  name starts with the words the tooltip shows; the change reaches a status
 *  region, as on the episode page. */
function MarkPlayedButton({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const episodes = useStudioEpisodeMemory();
  const isPlayed = episodes.isPlayed(item.trackId);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const label = t(
    isPlayed
      ? "studio:nowPlaying.markUnplayed"
      : "studio:nowPlaying.markPlayed",
    { title: item.title },
  );
  return (
    <>
      <IconButton
        className={styles.action}
        aria-label={label}
        tooltip={t(
          isPlayed
            ? "studio:episode.markUnplayed"
            : "studio:episode.markPlayed",
        )}
        onClick={() => {
          if (isPlayed) episodes.markUnplayed(item.trackId);
          else episodes.markPlayed(item.trackId);
          setStatusKey(
            isPlayed
              ? "studio:episode.markedUnplayedStatus"
              : "studio:episode.markedPlayedStatus",
          );
        }}
      >
        <StudioIconSwap iconKey={isPlayed ? "played" : "unplayed"}>
          {isPlayed ? (
            <FiRotateCcw aria-hidden />
          ) : (
            <FiCheckCircle aria-hidden />
          )}
        </StudioIconSwap>
      </IconButton>
      <span role="status" className="visuallyHidden">
        {statusKey ? t(statusKey, { title: item.title }) : ""}
      </span>
    </>
  );
}

/** Now playing's action row (DES-18): Like, Add to playlist, Mark as played
 *  for an episode, and the track menu (Play next, Share, Copy link at the
 *  current time, Go to artist, Report), all one tap away on a phone. A
 *  private preview offers none of them: its pages are closed to visitors. */
export function StudioNowPlayingActions({
  item,
  onNavigate,
}: {
  item: StudioQueueItem;
  /** Go to artist and Go to release close the sheet without a history
   *  step back, as the title link does. */
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const { chip } = useChipMotion();
  // The same read the Credits pane makes, so it is usually cached already.
  const { track } = useStudioTrack(item.trackId);
  const likeSubject: StudioLikeSubject = {
    trackId: item.trackId,
    title: item.title,
    href: item.trackHref,
    artistName: item.artistName,
  };
  const menuTrack =
    track && track.id === item.trackId
      ? studioTrackMenuTrackOf(track)
      : menuTrackOf(item);
  return (
    <div className={styles.actions}>
      <StudioLikeButton
        subject={likeSubject}
        className={styles.action}
        hasTooltip
      />
      <Tooltip label={t("studio:playlist.add.trackCta")} placement="top">
        <StudioAddToPlaylistButton
          trackIds={[item.trackId]}
          subjectTitle={item.title}
          ariaLabel={t("studio:playlist.add.trackAria", {
            title: item.title,
          })}
          className={styles.action}
          likeSubject={likeSubject}
        />
      </Tooltip>
      <AnimatePresence initial={false}>
        {item.isEpisode === true && (
          <m.span key="mark-played" className={styles.actionSlot} {...chip}>
            <MarkPlayedButton item={item} />
          </m.span>
        )}
      </AnimatePresence>
      <StudioTrackMenu
        track={menuTrack}
        className={styles.actionMenu}
        onLinkNavigate={onNavigate}
        tooltip={t("studio:release.moreActions")}
      />
    </div>
  );
}
