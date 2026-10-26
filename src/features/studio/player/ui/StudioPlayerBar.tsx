import { Link } from "react-router-dom";
import { FiList } from "react-icons/fi";
import { Button, Collapse, Tooltip } from "../../../../shared/components/ui";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { StudioAddToPlaylistButton } from "../../StudioAddToPlaylistButton";
import { StudioLikeButton } from "../../StudioLikeButton";
import { StudioPlayerSeek } from "../../StudioPlayerSeek";
import { StudioPlayerShowcase } from "../../StudioPlayerShowcase";
import type { StudioLikeSubject } from "../../useStudioLike";
import { useStudioShowcase } from "../../useStudioShowcase";
import { studioReasonCopyKey } from "../../studioReason";
import { useStudioPlaybackSignals } from "../studioPlaybackSignals";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { StudioCastButton } from "./StudioCastButton";
import { StudioChapterLine } from "./StudioChapterLine";
import { StudioGoToTrackButton } from "./StudioGoToTrackButton";
import { StudioPlayerArt } from "./StudioPlayerArt";
import { StudioPlayerCloseButton } from "./StudioPlayerCloseButton";
import { StudioPlayerMorePanel } from "./StudioPlayerMorePanel";
import {
  StudioNowCoverSwap,
  StudioNowSaveSlot,
  StudioNowTextSwap,
} from "./StudioPlayerNowSwap";
import { StudioPlayerRadioLine } from "./StudioPlayerRadioLine";
import {
  StudioRepeatButton,
  StudioShuffleButton,
  StudioTransport,
} from "./StudioPlayerControls";
import { StudioSleepTimerChip } from "./StudioSleepTimer";
import { StudioVolumeControl } from "./StudioVolumeControl";
import { StudioWarningGate } from "./StudioWarningGate";
import { STUDIO_QUEUE_BUTTON_ID } from "./studioQueueMoves";
import styles from "../../StudioPlayer.module.css";
import { useStudioShortcutHint } from "./useStudioShortcutHint";

/** The current track as the heart likes it. */
function studioLikeSubjectFor(item: StudioQueueItem): StudioLikeSubject {
  return {
    trackId: item.trackId,
    title: item.title,
    href: item.trackHref,
    artistName: item.artistName,
  };
}

/** Cover, title, artist, chapter and radio lines, the Like heart and Add to
 *  playlist. A private preview (`previewToken`) shows plain text and offers
 *  no save or like. Cover and titles crossfade when the track changes; the
 *  key is the track, so the same track queued twice in a row stays still. */
function StudioPlayerNow({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const surface = useStudioPlayerSurface();
  const isShowcase = useStudioShowcase();
  const isPreview = Boolean(item.previewToken);
  const swapKey = `${item.trackId}-${isPreview ? "preview" : "track"}`;
  const likeSubject = studioLikeSubjectFor(item);
  return (
    <div className={styles.now}>
      <IconButton
        className={styles.art}
        aria-label={t("studio:player.openNowPlaying", {
          title: item.title,
          artist: item.artistName,
        })}
        onClick={() => surface.openNowPlaying()}
      >
        <StudioNowCoverSwap swapKey={item.trackId}>
          <StudioPlayerArt item={item} size={48} radius={8} />
        </StudioNowCoverSwap>
      </IconButton>
      <div className={styles.titles}>
        <StudioNowTextSwap swapKey={swapKey}>
          {isPreview ? (
            <>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.artist}>{item.artistName}</span>
            </>
          ) : (
            <>
              <Link to={item.trackHref} className={styles.title}>
                {item.title}
              </Link>
              <Link to={item.artistHref} className={styles.artist}>
                {item.artistName}
              </Link>
            </>
          )}
        </StudioNowTextSwap>
        <StudioChapterLine />
        <StudioPlayerRadioLine radio={player.radio} />
        {/* Demo only: the per-play line and the tip, under the artist so
            the bar keeps one row. */}
        {isShowcase && <StudioPlayerShowcase artistName={item.artistName} />}
      </div>
      {/* The heart and Add to playlist share one slot, so they sit
          together at the row's end and fade as one for a preview. */}
      <StudioNowSaveSlot isShown={!isPreview}>
        <StudioLikeButton
          subject={likeSubject}
          className={styles.like}
          hasTooltip
        />
        <Tooltip label={t("studio:playlist.add.trackCta")} placement="top">
          <StudioAddToPlaylistButton
            trackIds={[item.trackId]}
            subjectTitle={item.title}
            ariaLabel={t("studio:playlist.add.trackAria", {
              title: item.title,
            })}
            className={styles.addToPlaylist}
            likeSubject={likeSubject}
          />
        </Tooltip>
      </StudioNowSaveSlot>
    </div>
  );
}

/** Sleep chip, Cast, Go to track, the queue toggle, volume, the More panel
 *  and Close player. While Now playing is open its own chip announces, so
 *  this one stays silent. */
function StudioPlayerTools({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const surface = useStudioPlayerSurface();
  const hintFor = useStudioShortcutHint();
  const queueLabel = surface.isQueuePanelOpen
    ? t("studio:player.queueHide")
    : t("studio:player.queueShow");
  const queueHint = hintFor(queueLabel, "queue");
  return (
    <div className={styles.tools}>
      <StudioSleepTimerChip announces={!surface.isNowPlayingOpen} />
      <StudioCastButton />
      <StudioGoToTrackButton item={item} />
      <IconButton
        id={STUDIO_QUEUE_BUTTON_ID}
        className={styles.toolButton}
        aria-expanded={surface.isQueuePanelOpen}
        aria-label={queueLabel}
        aria-keyshortcuts={queueHint.ariaKeyShortcuts}
        tooltip={queueHint.tooltip}
        onClick={surface.toggleQueuePanel}
      >
        <FiList aria-hidden />
      </IconButton>
      <StudioVolumeControl />
      <StudioPlayerMorePanel placement="up" />
      <StudioPlayerCloseButton className={styles.toolButton} />
    </div>
  );
}

/** The player's status line, in both layouts (ENG-02): why the track
 *  can't play, with Retry; "Tap play to start" after a refused autoplay;
 *  the offline pause. The status region stays mounted so each line is
 *  announced; the lines fold in and out. */
export function StudioPlayerStatus() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const signals = useStudioPlaybackSignals();
  const isError = player.status === "error";
  const isOfflinePaused = signals.isPausedForOffline && !isError;
  const isAutoplayBlocked =
    signals.isAutoplayBlocked && player.status === "paused" && !isOfflinePaused;
  const errorKey = studioReasonCopyKey(
    signals.failureReason ?? "unknown",
    "play",
  );
  return (
    <div className={styles.status} role="status">
      <Collapse isOpen={isError}>
        <span className={styles.error}>
          <span>{t(errorKey)}</span>
          <Button
            variant="quiet"
            size="sm"
            className={styles.retry}
            onClick={player.retry}
          >
            {t("studio:playerBar.retry")}
          </Button>
        </span>
      </Collapse>
      <Collapse isOpen={isOfflinePaused}>
        <span className={styles.error}>
          {t("studio:playerBar.offlinePaused")}
        </span>
      </Collapse>
      <Collapse isOpen={isAutoplayBlocked}>
        <span className={styles.error}>
          {t("studio:playerBar.autoplayBlocked")}
        </span>
      </Collapse>
    </div>
  );
}

/** The desktop bar (spec 7.1). */
export function StudioPlayerBar({ item }: { item: StudioQueueItem }) {
  const player = useStudioPlayer();
  return (
    <>
      <StudioPlayerNow item={item} />
      {/* The warning gate moves focus to this transport's play button. */}
      <div className={styles.controls} data-studio-transport="">
        <StudioShuffleButton />
        <StudioTransport size="bar" />
        <StudioRepeatButton />
      </div>
      <div className={styles.seekArea}>
        <StudioPlayerSeek onSeek={player.seek} />
      </div>
      <StudioPlayerTools item={item} />
      <StudioPlayerStatus />
      {/* Studio safety: the pause before a warned track (spec 6.3). */}
      <StudioWarningGate layout="bar" />
    </>
  );
}
