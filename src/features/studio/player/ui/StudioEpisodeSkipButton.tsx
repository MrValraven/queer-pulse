import { FiRotateCcw, FiRotateCw } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  EPISODE_SKIP_BACK_SECONDS,
  EPISODE_SKIP_FORWARD_SECONDS,
  skipTargetSeconds,
} from "../studioEpisodeRules";
import { useStudioPlayer, useStudioPlayerClock } from "../studioPlayerContext";
import styles from "./StudioPlayerControls.module.css";

/** Skip back 15 s or forward 30 s on an episode (spec 5.6). It reads the
 *  playhead itself, so only this button re-renders as the clock ticks. */
export function StudioEpisodeSkipButton({
  direction,
  className,
}: {
  direction: "back" | "forward";
  className?: string;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { currentTime, duration } = useStudioPlayerClock();
  const isBack = direction === "back";
  return (
    <IconButton
      className={[className, styles.skip].filter(Boolean).join(" ")}
      aria-label={t(
        isBack ? "studio:player.skipBack" : "studio:player.skipForward",
      )}
      tooltip
      onClick={() =>
        player.seek(skipTargetSeconds(currentTime, direction, duration))
      }
    >
      {isBack ? <FiRotateCcw aria-hidden /> : <FiRotateCw aria-hidden />}
      <span className={styles.skipSeconds} aria-hidden="true">
        {isBack ? EPISODE_SKIP_BACK_SECONDS : EPISODE_SKIP_FORWARD_SECONDS}
      </span>
    </IconButton>
  );
}
