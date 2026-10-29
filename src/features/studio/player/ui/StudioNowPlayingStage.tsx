import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "../../../../shared/components/ui";
import { StudioPlayerSeek } from "../../StudioPlayerSeek";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import { StudioCastButton } from "./StudioCastButton";
import { StudioFormatLine } from "./StudioFormatLine";
import { StudioGaplessTitleLine } from "./StudioGaplessBadge";
import { StudioNowPlayingActions } from "./StudioNowPlayingActions";
import { StudioNowPlayingCover } from "./StudioNowPlayingCover";
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

/** Title (with the gapless badge after it) and artist. A private preview
 *  names them as plain text: its pages are not public, so there is
 *  nothing to link to. */
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
      <StudioGaplessTitleLine item={item} size="stage">
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
      </StudioGaplessTitleLine>
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

/** Cover, titles, the action row, scrubber and controls: Now playing's
 *  left column. On a phone the cover takes the swipes (close and skip).
 *  The body under the cover is its own box, so a phone on its side can set
 *  it beside the cover. */
export function StudioNowPlayingStage({
  item,
  isPhone,
  onNavigate,
  sheetRef,
  frameRef,
  onClose,
}: {
  item: StudioQueueItem;
  isPhone: boolean;
  onNavigate: () => void;
  sheetRef: RefObject<HTMLElement | null>;
  frameRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const player = useStudioPlayer();
  return (
    <div className={styles.stage} data-studio-player-surface="">
      <StudioNowPlayingCover
        item={item}
        isPhone={isPhone}
        sheetRef={sheetRef}
        frameRef={frameRef}
        onClose={onClose}
      />
      <div className={styles.stageBody}>
        <StageMeta item={item} onNavigate={onNavigate} />
        <StudioFormatLine />
        <Collapse isOpen={!item.previewToken}>
          <StudioNowPlayingActions item={item} onNavigate={onNavigate} />
        </Collapse>
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
          <StudioPlayerMorePanel placement="up" onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
