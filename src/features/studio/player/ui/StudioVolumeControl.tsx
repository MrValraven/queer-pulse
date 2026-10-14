import { FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import styles from "./StudioPlayerControls.module.css";

const SLIDER_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/** Desktop volume and mute (spec 7.11); phones use the hardware buttons. */
export function StudioVolumeControl() {
  const { t } = useTranslation();
  const { preferences, setVolume, toggleMute } = useStudioPlayer();
  const percent = Math.round(preferences.volume * 100);
  const shownPercent = preferences.isMuted ? 0 : percent;
  const Icon =
    shownPercent === 0 ? FiVolumeX : shownPercent < 50 ? FiVolume1 : FiVolume2;
  return (
    <div className={styles.volume}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={
          preferences.isMuted
            ? t("studio:player.unmute")
            : t("studio:player.mute")
        }
        onClick={toggleMute}
      >
        <Icon aria-hidden />
      </button>
      <input
        type="range"
        className={styles.volumeSlider}
        min={0}
        max={100}
        step={1}
        value={shownPercent}
        aria-label={t("studio:player.volume")}
        aria-valuetext={t("studio:player.volumeValue", {
          percent: shownPercent,
        })}
        onKeyDown={(event) => {
          // The slider steps itself; the window-level arrow shortcuts stay out.
          if (SLIDER_KEYS.has(event.key)) event.stopPropagation();
        }}
        onChange={(event) => {
          const nextPercent = Number(event.target.value);
          // Plan 2's setVolume unmutes on any level above 0, so this handler
          // never calls toggleMute after it (that would mute again).
          if (!preferences.isMuted) {
            setVolume(nextPercent / 100);
            return;
          }
          // Muted, the slider sits at 0. Moving it to 0 keeps the mute and
          // the remembered level. A one-step nudge from 0 (an arrow key)
          // unmutes at the remembered level; a drag or a press on the track
          // unmutes at the chosen point.
          if (nextPercent === 0) return;
          setVolume(
            nextPercent <= 1
              ? Math.max(preferences.volume, nextPercent / 100)
              : nextPercent / 100,
          );
        }}
      />
    </div>
  );
}
