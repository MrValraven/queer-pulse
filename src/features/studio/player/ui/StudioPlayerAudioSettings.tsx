import { useId, useRef } from "react";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { StudioCrossfadeSetting } from "../../StudioCrossfadeSetting";
import { useStudioPlayer } from "../studioPlayerContext";
import { StudioEqualizer } from "./StudioEqualizer";
import { useStudioSliderKeyGuard } from "./StudioEqualizer.hooks";
import equalizerStyles from "./StudioEqualizer.module.css";
import styles from "./StudioPlayerControls.module.css";

/** Why the browser's audio settings rest: a cast device plays the stream
 *  itself, and plain mode has no graph for crossfade. */
function crossfadeHintKey(isCasting: boolean, isPlainMode: boolean): string {
  if (isCasting) return "studio:player.crossfade.castHint";
  return isPlainMode
    ? "studio:player.crossfade.unavailable"
    : "studio:player.crossfade.hint";
}

function loudnessHintKey(isCasting: boolean, isPlainMode: boolean): string {
  if (isCasting) return "studio:player.loudness.castHint";
  return isPlainMode
    ? "studio:player.loudness.plainHint"
    : "studio:player.loudness.hint";
}

/** The More panel's Audio group opens here: its heading, then the shared
 *  crossfade slider (the one Studio Settings shows). Plain mode shows it at
 *  0 and at rest, and casting at rest, each with the reason. */
export function CrossfadeSetting() {
  const { t } = useTranslation();
  const { preferences, isPlainMode, remote, setCrossfadeSeconds } =
    useStudioPlayer();
  const isCasting = remote.isConnected;
  const isResting = isPlainMode || isCasting;
  const labelId = useId();
  const hintId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  useStudioSliderKeyGuard(rootRef);
  return (
    <>
      <p className={`${styles.popoverHeading} ${equalizerStyles.audioHeading}`}>
        {t("studio:player.audio.heading")}
      </p>
      <div
        ref={rootRef}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={hintId}
        className={styles.setting}
      >
        <p id={labelId} className={equalizerStyles.crossfadeLabel}>
          {t("studio:player.crossfade.label")}
        </p>
        <div className={equalizerStyles.crossfadeBody} inert={isResting}>
          <StudioCrossfadeSetting
            seconds={isPlainMode ? 0 : preferences.crossfadeSeconds}
            hasHeading={false}
            describedById={hintId}
            onCommit={(seconds) => {
              if (!isResting) setCrossfadeSeconds(seconds);
            }}
          />
        </div>
        <p id={hintId} className={styles.settingHint}>
          {t(crossfadeHintKey(isCasting, isPlainMode))}
        </p>
      </div>
    </>
  );
}

/** The More panel's Even out loudness switch, then the equaliser that
 *  closes the Audio group (PRD-14). Casting rests the switch. */
export function LoudnessSetting() {
  const { t } = useTranslation();
  const { preferences, isPlainMode, remote, setLoudnessEven } =
    useStudioPlayer();
  const isCasting = remote.isConnected;
  const hintId = useId();
  return (
    <>
      <div className={styles.setting}>
        <Button
          variant="quiet"
          role="switch"
          aria-checked={preferences.isLoudnessEven}
          aria-describedby={hintId}
          aria-disabled={isCasting || undefined}
          className={`${styles.switchRow} ${equalizerStyles.switchButton} ${equalizerStyles.restingSwitch}`}
          onClick={() => {
            if (!isCasting) setLoudnessEven(!preferences.isLoudnessEven);
          }}
        >
          <span>{t("studio:player.loudness.label")}</span>
          <span className={styles.switchTrack} aria-hidden="true" />
        </Button>
        <p id={hintId} className={styles.settingHint}>
          {t(loudnessHintKey(isCasting, isPlainMode))}
        </p>
      </div>
      <StudioEqualizer />
    </>
  );
}
