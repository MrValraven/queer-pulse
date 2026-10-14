import { useId } from "react";
import { useRovingRadioGroup } from "../../../../shared/hooks/useRovingRadioGroup";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EPISODE_SPEEDS } from "../studioEpisodeRules";
import { useStudioEpisodeSpeed } from "../useStudioEpisodeMemory";
import styles from "./StudioPlayerControls.module.css";

/** Speed for podcast episodes (spec 5.6): 0.8x to 2x, kept on this device.
 *  Music always plays at 1x. */
export function StudioSpeedSetting() {
  const { t } = useTranslation();
  const formatters = useFormat();
  const headingId = useId();
  const hintId = useId();
  const { speed, setSpeed } = useStudioEpisodeSpeed();
  // One speed at a time: a radio group, arrows move and choose (APG).
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: STUDIO_EPISODE_SPEEDS.length,
    checkedIndex: STUDIO_EPISODE_SPEEDS.indexOf(speed),
    onSelect: (index) => {
      const option = STUDIO_EPISODE_SPEEDS[index];
      if (option !== undefined) setSpeed(option);
    },
  });
  return (
    <div className={styles.setting}>
      <p id={headingId} className={styles.speedHeading}>
        {t("studio:player.speed.heading")}
      </p>
      <div
        className={styles.speedOptions}
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={hintId}
      >
        {STUDIO_EPISODE_SPEEDS.map((option, index) => (
          <button
            key={option}
            {...getRadioProps(index)}
            type="button"
            role="radio"
            className={styles.option}
            aria-checked={speed === option}
            onClick={() => setSpeed(option)}
          >
            {t("studio:player.speed.value", {
              rate: formatters.number(option),
            })}
          </button>
        ))}
      </div>
      <p id={hintId} className={styles.settingHint}>
        {t("studio:player.speed.hint")}
      </p>
    </div>
  );
}
