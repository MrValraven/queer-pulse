import { Link } from "react-router-dom";
import { FiList } from "react-icons/fi";
import { Collapse, ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { StudioAddToPlaylistButton } from "../../StudioAddToPlaylistButton";
import { StudioLikeButton } from "../../StudioLikeButton";
import { StudioPlayerSeek } from "../../StudioPlayerSeek";
import { StudioPlayerShowcase } from "../../StudioPlayerShowcase";
import type { StudioLikeSubject } from "../../useStudioLike";
import { useStudioShowcase } from "../../useStudioShowcase";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { StudioCastButton } from "./StudioCastButton";
import { StudioChapterLine } from "./StudioChapterLine";
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
  const isPreview = Boolean(item.previewToken);
  const swapKey = `${item.trackId}-${isPreview ? "preview" : "track"}`;
  const likeSubject = studioLikeSubjectFor(item);
  return (
    <div className={styles.now}>
      <button
        type="button"
        className={styles.art}
        aria-label={t("studio:player.openNowPlaying", {
          title: item.title,
          artist: item.artistName,
        })}
        onClick={() => surface.openNowPlaying()}
      >
        <StudioNowCoverSwap swapKey={item.trackId}>
          <ImageSlot
            src={item.coverUrl ?? undefined}
            tint={item.tint}
            width={48}
            height={48}
            radius={8}
            placeholder=""
          />
        </StudioNowCoverSwap>
      </button>
      <span className={styles.titles}>
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
      </span>
      {/* The heart and Add to playlist share one slot, so they sit
          together at the row's end and fade as one for a preview. */}
      <StudioNowSaveSlot isShown={!isPreview}>
        <StudioLikeButton subject={likeSubject} className={styles.like} />
        <StudioAddToPlaylistButton
          trackIds={[item.trackId]}
          subjectTitle={item.title}
          ariaLabel={t("studio:playlist.add.trackAria", { title: item.title })}
          className={styles.addToPlaylist}
          likeSubject={likeSubject}
        />
      </StudioNowSaveSlot>
    </div>
  );
}

/** Sleep chip, Cast, the queue toggle, volume, the More panel and Close
 *  player. While Now playing is open its own chip announces, so this one
 *  stays silent. */
function StudioPlayerTools() {
  const { t } = useTranslation();
  const surface = useStudioPlayerSurface();
  return (
    <div className={styles.tools}>
      <StudioSleepTimerChip announces={!surface.isNowPlayingOpen} />
      <StudioCastButton />
      <button
        type="button"
        id={STUDIO_QUEUE_BUTTON_ID}
        className={styles.toolButton}
        aria-expanded={surface.isQueuePanelOpen}
        aria-label={
          surface.isQueuePanelOpen
            ? t("studio:player.queueHide")
            : t("studio:player.queueShow")
        }
        onClick={surface.toggleQueuePanel}
      >
        <FiList aria-hidden />
      </button>
      <StudioVolumeControl />
      <StudioPlayerMorePanel placement="up" />
      <StudioPlayerCloseButton className={styles.toolButton} />
    </div>
  );
}

/** "This track can't play right now" with Retry, in both layouts. The status
 *  region stays mounted so the line is announced; the line folds in and out. */
export function StudioPlayerStatus() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  return (
    <div className={styles.status} role="status">
      <Collapse isOpen={player.status === "error"}>
        <span className={styles.error}>
          {t("studio:playerBar.cantPlay")}{" "}
          <button type="button" className={styles.retry} onClick={player.retry}>
            {t("studio:playerBar.retry")}
          </button>
        </span>
      </Collapse>
    </div>
  );
}

/** The desktop bar (spec 7.1). */
export function StudioPlayerBar({ item }: { item: StudioQueueItem }) {
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
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
      <StudioPlayerTools />
      <StudioPlayerStatus />
      {/* Studio safety: the pause before a warned track (spec 6.3). */}
      <StudioWarningGate />
      {isShowcase && <StudioPlayerShowcase artistName={item.artistName} />}
    </>
  );
}
