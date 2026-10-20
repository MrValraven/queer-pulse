import type { MouseEvent as ReactMouseEvent } from "react";
import { Link } from "react-router-dom";
import { ImageSlot } from "../../../../shared/components/ui";
import { StudioPlayerSeek } from "../../StudioPlayerSeek";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import { StudioCastButton } from "./StudioCastButton";
import { StudioPlayerStatus } from "./StudioPlayerBar";
import {
  StudioPlayerMorePanel,
  StudioSleepTimerButton,
} from "./StudioPlayerMorePanel";
import {
  StudioRepeatButton,
  StudioShuffleButton,
  StudioTransport,
} from "./StudioPlayerControls";
import { StudioSleepTimerChip } from "./StudioSleepTimer";
import { StudioVolumeControl } from "./StudioVolumeControl";
import { StudioWarningGate } from "./StudioWarningGate";
import styles from "./StudioNowPlaying.module.css";

/** Title and artist. A private preview names them as plain text: its pages
 *  are not public, so there is nothing to link to. */
function StageMeta({
  item,
  onNavigate,
}: {
  item: StudioQueueItem;
  onNavigate: () => void;
}) {
  const isPreview = Boolean(item.previewToken);
  // A middle press or a modified press opens a new tab: this one keeps its
  // history entry and Now playing stays open.
  const handleLinkClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const isNewTabPress =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;
    if (!isNewTabPress) onNavigate();
  };
  return (
    <div className={styles.meta}>
      <h2 className={styles.title}>
        {isPreview ? (
          item.title
        ) : (
          <Link
            to={item.trackHref}
            replace
            onClick={handleLinkClick}
            className={styles.titleLink}
          >
            {item.title}
          </Link>
        )}
      </h2>
      {isPreview ? (
        <p className={styles.artist}>{item.artistName}</p>
      ) : (
        <Link
          to={item.artistHref}
          replace
          onClick={handleLinkClick}
          className={styles.artist}
        >
          {item.artistName}
        </Link>
      )}
    </div>
  );
}

/** Cover, titles, scrubber and controls: Now playing's left column. */
export function StudioNowPlayingStage({
  item,
  isPhone,
  onNavigate,
}: {
  item: StudioQueueItem;
  isPhone: boolean;
  onNavigate: () => void;
}) {
  const player = useStudioPlayer();
  return (
    <div className={styles.stage} data-studio-player-surface="">
      <div className={styles.cover}>
        <ImageSlot
          src={item.coverUrl ?? undefined}
          tint={item.tint}
          width="100%"
          height="100%"
          radius={16}
          placeholder=""
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <StageMeta item={item} onNavigate={onNavigate} />
      <StudioPlayerSeek onSeek={player.seek} size="large" />
      {/* The warning gate moves focus to this transport's play button. */}
      <div className={styles.controlsRow} data-studio-transport="">
        <StudioShuffleButton />
        <StudioTransport size="large" />
        <StudioRepeatButton />
      </div>
      {/* The bar's "can't play" line and Retry: the bar sits behind this
          modal sheet, so the line has to show here too. The wrapper is
          `display: contents`, so the idle region stays out of the flow. */}
      <div className={styles.status}>
        <StudioPlayerStatus />
      </div>
      {/* Studio safety: the pause before a warned track (spec 6.3). */}
      <StudioWarningGate />
      {/* Both popovers open upward: this row sits low on the sheet. */}
      <div className={styles.toolsRow}>
        <StudioCastButton />
        <StudioSleepTimerChip />
        {isPhone ? (
          <StudioSleepTimerButton placement="up" />
        ) : (
          <StudioVolumeControl />
        )}
        <StudioPlayerMorePanel placement="up" />
      </div>
    </div>
  );
}
