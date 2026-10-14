import { Link } from "react-router-dom";
import { FiList, FiRadio } from "react-icons/fi";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Collapse, ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { StudioAddToPlaylistButton } from "../../StudioAddToPlaylistButton";
import { StudioPlayerSeek } from "../../StudioPlayerSeek";
import { StudioPlayerShowcase } from "../../StudioPlayerShowcase";
import { useStudioShowcase } from "../../useStudioShowcase";
import {
  useStudioPlayer,
  type StudioQueueItem,
  type StudioRadioSession,
} from "../studioPlayerContext";
import { radioFilterLabelKey } from "../studioQueue";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { StudioCastButton } from "./StudioCastButton";
import { StudioChapterLine } from "./StudioChapterLine";
import { StudioPlayerMorePanel } from "./StudioPlayerMorePanel";
import {
  StudioRepeatButton,
  StudioShuffleButton,
  StudioTransport,
} from "./StudioPlayerControls";
import { StudioSleepTimerChip } from "./StudioSleepTimer";
import { StudioVolumeControl } from "./StudioVolumeControl";
import { STUDIO_QUEUE_BUTTON_ID } from "./studioQueueMoves";
import styles from "../../StudioPlayer.module.css";

/** "Radio · Fado" under the title while a station plays. It fades in and
 *  out with the station. */
function StudioPlayerRadioLine({
  radio,
}: {
  radio: StudioRadioSession | null;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {radio && (
        <m.span
          key="radio"
          className={styles.radioLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <FiRadio aria-hidden />
          {/* The text sits in its own span: a flex container's loose text
              never ellipsizes. */}
          <span className={styles.radioText}>
            {t("studio:radio.playerLabel", {
              name: t(radioFilterLabelKey(radio.filter)),
            })}
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}

/** Cover, title, artist, chapter and radio lines, and Add to playlist. A
 *  private preview (`previewToken`) shows plain text and offers no save. */
function StudioPlayerNow({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const surface = useStudioPlayerSurface();
  const isPreview = Boolean(item.previewToken);
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
        <ImageSlot
          src={item.coverUrl ?? undefined}
          tint={item.tint}
          width={48}
          height={48}
          radius={8}
          placeholder=""
        />
      </button>
      <span className={styles.titles}>
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
        <StudioChapterLine />
        <StudioPlayerRadioLine radio={player.radio} />
      </span>
      {!isPreview && (
        <StudioAddToPlaylistButton
          trackIds={[item.trackId]}
          subjectTitle={item.title}
          ariaLabel={t("studio:playlist.add.trackAria", { title: item.title })}
          className={styles.addToPlaylist}
        />
      )}
    </div>
  );
}

/** Sleep chip, Cast, the queue toggle, volume and the More panel. While Now
 *  playing is open its own chip announces, so this one stays silent. */
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
      <div className={styles.controls}>
        <StudioShuffleButton />
        <StudioTransport size="bar" />
        <StudioRepeatButton />
      </div>
      <div className={styles.seekArea}>
        <StudioPlayerSeek onSeek={player.seek} />
      </div>
      <StudioPlayerTools />
      <StudioPlayerStatus />
      {isShowcase && <StudioPlayerShowcase artistName={item.artistName} />}
    </>
  );
}
