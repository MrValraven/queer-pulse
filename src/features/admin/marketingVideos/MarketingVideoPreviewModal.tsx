import {
  FiLoader,
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

  return (
    <AdminModal
      eyebrow={t("admin:marketingVideos.preview.eyebrow")}
      title={title}
      onClose={onClose}
      wide
    >
      <div className={styles.previewFrame}>
        <FilmFrame
          src={filmUrl(video.id)}
          title={t("admin:marketingVideos.preview.frameTitle", { title })}
          iframeRef={playback.iframeRef}
          onLoad={playback.handleLoad}
          loading="eager"
        />
      </div>
      <div className={styles.transport}>
        <IconButton
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
          {formatClock(playback.time)} / {formatClock(video.durationSeconds)}
        </span>
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
