import { useId } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_CROSSFADE_MAX_SECONDS } from "../../api/studio.types";
import { useStudioPlayer } from "../studioPlayerContext";
import styles from "./StudioPlayerControls.module.css";

/** Keys the range steps itself with; Escape and Tab still reach the popover. */
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

/** The More panel's crossfade slider; plain mode shows it at 0, unavailable. */
export function CrossfadeSetting() {
  const { t } = useTranslation();
  const { preferences, isPlainMode, setCrossfadeSeconds } = useStudioPlayer();
  const hintId = useId();
  const sliderId = useId();
  const seconds = isPlainMode ? 0 : preferences.crossfadeSeconds;
  const valueText =
    seconds === 0
      ? t("studio:player.crossfade.off")
      : t("studio:player.crossfade.value", { count: seconds });
  return (
    <div className={styles.setting}>
      <div className={styles.settingRow}>
        <label htmlFor={sliderId}>{t("studio:player.crossfade.label")}</label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={STUDIO_CROSSFADE_MAX_SECONDS}
          step={1}
          value={seconds}
          aria-disabled={isPlainMode || undefined}
          aria-describedby={hintId}
          aria-valuetext={valueText}
          onKeyDown={(event) => {
            if (SLIDER_KEYS.has(event.key)) event.stopPropagation();
          }}
          onChange={(event) => {
            if (!isPlainMode) setCrossfadeSeconds(Number(event.target.value));
          }}
        />
        {/* The slider's value text says it to assistive tech already. */}
        <span className={styles.settingValue} aria-hidden="true">
          {valueText}
        </span>
      </div>
      <p id={hintId} className={styles.settingHint}>
        {isPlainMode
          ? t("studio:player.crossfade.unavailable")
          : t("studio:player.crossfade.hint")}
      </p>
    </div>
  );
}

/** The More panel's Even out loudness switch. */
export function LoudnessSetting() {
  const { t } = useTranslation();
  const { preferences, isPlainMode, setLoudnessEven } = useStudioPlayer();
  const hintId = useId();
  return (
    <div className={styles.setting}>
      <button
        type="button"
        role="switch"
        aria-checked={preferences.isLoudnessEven}
        aria-describedby={hintId}
        className={styles.switchRow}
        onClick={() => setLoudnessEven(!preferences.isLoudnessEven)}
      >
        <span>{t("studio:player.loudness.label")}</span>
        <span className={styles.switchTrack} aria-hidden="true" />
      </button>
      <p id={hintId} className={styles.settingHint}>
        {isPlainMode
          ? t("studio:player.loudness.plainHint")
          : t("studio:player.loudness.hint")}
      </p>
    </div>
  );
}
