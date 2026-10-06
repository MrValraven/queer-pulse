import {
  FiLoader,
  FiMaximize,
  FiMinimize,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal } from "../ui";
import { FilmFrame } from "./FilmFrame";
import { formatClock } from "./filmTime";
import { filmUrl, type MarketingVideo } from "./marketingVideos.data";
import { useFilmFullscreen } from "./useFilmFullscreen";
import { useFilmPlayback, type SoundState } from "./useFilmPlayback";
import styles from "./MarketingVideos.module.css";

const SOUND_ICON: Record<SoundState, typeof FiVolume2> = {
  loading: FiLoader,
  on: FiVolume2,
  failed: FiVolumeX,
};

const SOUND_KEY: Record<SoundState, string> = {
  loading: "admin:marketingVideos.preview.soundLoading",
  on: "admin:marketingVideos.preview.soundOn",
  failed: "admin:marketingVideos.preview.soundFailed",
};

/** Plays a film live, with transport controls and its score when ready. */
export function MarketingVideoPreviewModal({
  video,
  onClose,
}: {
  video: MarketingVideo;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const title = t(`admin:marketingVideos.films.${video.id}.title`);
  const playback = useFilmPlayback(video);
  const SoundIcon = SOUND_ICON[playback.sound];
  const {
    isSupported: canFullscreen,
    isFullscreen,
    areControlsHidden,
    toggle: toggleFullscreen,
    slotRef,
    stageRef,
    filmRef,
    controlsRef,
    veilRef,
    stageHandlers,
  } = useFilmFullscreen({ isPlaying: playback.isPlaying });
  const tone = isFullscreen ? "dark" : "light";

  // Escape in full screen belongs to the browser: it only leaves full screen.
  const handleClose = () => {
    if (!document.fullscreenElement) onClose();
  };

  return (
    <AdminModal
      eyebrow={t("admin:marketingVideos.preview.eyebrow")}
      title={title}
      onClose={handleClose}
      wide
    >
      <div ref={slotRef}>
        <div ref={veilRef} className={styles.veil} aria-hidden />
        <div
          ref={stageRef}
          className={styles.stage}
          data-controls-hidden={areControlsHidden || undefined}
          {...stageHandlers}
        >
          <div
            ref={filmRef}
            className={styles.previewFrame}
            onDoubleClick={canFullscreen ? toggleFullscreen : undefined}
          >
            <FilmFrame
              src={filmUrl(video.id)}
              title={t("admin:marketingVideos.preview.frameTitle", { title })}
              iframeRef={playback.iframeRef}
              onLoad={playback.handleLoad}
              loading="eager"
            />
          </div>
          <div ref={controlsRef} className={styles.transport}>
            <IconButton
              tone={tone}
              aria-label={t(
                playback.isPlaying
                  ? "admin:marketingVideos.preview.pause"
                  : "admin:marketingVideos.preview.play",
              )}
              onClick={playback.togglePlay}
              disabled={!playback.isReady}
            >
              {playback.isPlaying ? (
                <FiPause aria-hidden />
              ) : (
                <FiPlay aria-hidden />
              )}
            </IconButton>
            <IconButton
              tone={tone}
              aria-label={t("admin:marketingVideos.preview.restart")}
              onClick={() => playback.seek(0)}
              disabled={!playback.isReady}
            >
              <FiSkipBack aria-hidden />
            </IconButton>
            <input
              className={styles.scrub}
              type="range"
              min={0}
              max={video.durationSeconds}
              step={0.05}
              value={playback.time}
              onChange={(event) => playback.seek(Number(event.target.value))}
              disabled={!playback.isReady}
              aria-label={t("admin:marketingVideos.preview.scrub")}
              aria-valuetext={formatClock(playback.time)}
            />
            <span className={styles.clock}>
              {formatClock(playback.time)} /{" "}
              {formatClock(video.durationSeconds)}
            </span>
            {canFullscreen && (
              <IconButton
                tone={tone}
                aria-label={t(
                  isFullscreen
                    ? "admin:marketingVideos.preview.exitFullScreen"
                    : "admin:marketingVideos.preview.fullScreen",
                )}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <FiMinimize aria-hidden />
                ) : (
                  <FiMaximize aria-hidden />
                )}
              </IconButton>
            )}
          </div>
        </div>
      </div>
      <p className={styles.sound} role="status">
        <SoundIcon aria-hidden />
        {t(SOUND_KEY[playback.sound])}
      </p>
      <p className={styles.previewNote}>
        {t("admin:marketingVideos.preview.note")}
      </p>
    </AdminModal>
  );
}
