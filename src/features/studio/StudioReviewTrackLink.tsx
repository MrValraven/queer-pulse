import { useContext } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { Link } from "react-router-dom";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioPlayerContext } from "./player/studioPlayerContext";
import { StudioIconSwap } from "./player/ui/StudioIconSwap";
import css from "./StudioFlagReview.module.css";

/**
 * The track a staff card is about: its page, and Play so staff can hear it
 * before they decide. Play only shows inside the Studio player (always the
 * case in the app) and for a track with audio; pressing it again pauses.
 */
export function ReviewTrackLink({
  trackId,
  releaseId,
  href,
  label,
  title,
  canPlay,
}: {
  trackId: string;
  releaseId: string;
  href: string;
  /** "3. Track title": the visible link text. */
  label: string;
  title: string;
  canPlay: boolean;
}) {
  const { t } = useTranslation();
  const player = useContext(StudioPlayerContext);
  const isCurrent = player?.currentItem?.trackId === trackId;
  const isPlaying = isCurrent && player?.status === "playing";
  return (
    <span className={css.trackLine}>
      <Link to={href} className={css.trackLink}>
        {label}
      </Link>
      {player && canPlay ? (
        <IconButton
          size="sm"
          tooltip
          aria-label={t(
            isPlaying
              ? "studio:release.pauseTrack"
              : "studio:release.playTrack",
            { title },
          )}
          onClick={() => {
            if (isCurrent) player.togglePlay();
            else void player.playRelease(releaseId, trackId);
          }}
        >
          <StudioIconSwap iconKey={isPlaying ? "pause" : "play"}>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </StudioIconSwap>
        </IconButton>
      ) : null}
    </span>
  );
}
