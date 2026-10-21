import { useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Button, Collapse } from "../../../../shared/components/ui";
import { useRovingRadioGroup } from "../../../../shared/hooks/useRovingRadioGroup";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import { useStudioPlayer } from "../studioPlayerContext";
import {
  FLAT_EQUALIZER_GAINS,
  isFlatEqualizer,
  writeEqualizerGains,
} from "../studioPlayerPreferences";
import { STUDIO_EQUALIZER_PRESETS } from "./StudioEqualizer.data";
import {
  useStudioEqualizerGains,
  useStudioSliderKeyGuard,
} from "./StudioEqualizer.hooks";
import { StudioEqualizerBands } from "./StudioEqualizerBands";
import controls from "./StudioPlayerControls.module.css";
import styles from "./StudioEqualizer.module.css";

function isSameCurve(first: readonly number[], second: readonly number[]) {
  return (
    first.length === second.length &&
    first.every((gainDb, index) => gainDb === second[index])
  );
}

function hintKeyOf(rest: "cast" | "plain" | null, isCustom: boolean): string {
  if (rest === "cast") return "studio:player.equalizer.castHint";
  if (rest === "plain") return "studio:player.equalizer.plainHint";
  return isCustom
    ? "studio:player.equalizer.customHint"
    : "studio:player.equalizer.hint";
}

/**
 * The More panel's equaliser (PRD-14): four presets, five bands to adjust
 * and a reset. It lives on this device only. Flat takes it out of the
 * audio graph, so the track plays as it was mixed. Plain mode has no graph
 * to filter, and a cast device plays the stream itself, so in both the
 * controls show and say why they rest.
 */
export function StudioEqualizer() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { isPlainMode, remote } = useStudioPlayer();
  const rest = remote.isConnected ? "cast" : isPlainMode ? "plain" : null;
  const isResting = rest !== null;
  const gainsDb = useStudioEqualizerGains();
  const [isAdjusting, setIsAdjusting] = useState(false);
  const adjustRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useStudioSliderKeyGuard(rootRef);
  const headingId = useId();
  const hintId = useId();
  const bandsId = useId();
  const isFlat = isFlatEqualizer(gainsDb);
  const checkedIndex = STUDIO_EQUALIZER_PRESETS.findIndex((preset) =>
    isSameCurve(preset.gainsDb, gainsDb),
  );
  const choosePreset = (index: number) => {
    const preset = STUDIO_EQUALIZER_PRESETS[index];
    if (!isResting && preset) writeEqualizerGains(preset.gainsDb);
  };
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: STUDIO_EQUALIZER_PRESETS.length,
    checkedIndex,
    onSelect: choosePreset,
  });
  const reset = () => {
    writeEqualizerGains(FLAT_EQUALIZER_GAINS);
    // Reset leaves once the curve is flat: focus stays in the panel.
    adjustRef.current?.focus();
  };
  return (
    <div ref={rootRef} className={`${controls.setting} ${styles.equalizer}`}>
      <p id={headingId} className={styles.heading}>
        {t("studio:player.equalizer.heading")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={hintId}
        className={styles.presets}
      >
        {STUDIO_EQUALIZER_PRESETS.map((preset, index) => (
          <Button
            key={preset.id}
            variant="quiet"
            size="sm"
            {...getRadioProps(index)}
            role="radio"
            aria-checked={index === checkedIndex}
            aria-disabled={isResting || undefined}
            className={styles.preset}
            onClick={() => choosePreset(index)}
          >
            {t(preset.labelKey)}
          </Button>
        ))}
      </div>
      <p id={hintId} className={controls.settingHint}>
        {t(hintKeyOf(rest, checkedIndex < 0))}
      </p>
      <div className={styles.actions}>
        <Button
          ref={adjustRef}
          variant="quiet"
          size="sm"
          aria-expanded={isAdjusting && !isResting}
          aria-controls={bandsId}
          aria-disabled={isResting || undefined}
          className={styles.action}
          onClick={() => {
            if (!isResting) setIsAdjusting((isOpen) => !isOpen);
          }}
        >
          {isAdjusting && !isResting
            ? t("studio:player.equalizer.hideBands")
            : t("studio:player.equalizer.adjustBands")}
        </Button>
        <AnimatePresence initial={false}>
          {!isFlat && !isResting && (
            <m.span
              key="reset"
              className={styles.resetSlot}
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
              animate={{ opacity: 1, scale: 1, transition: STUDIO_FADE }}
              exit={{
                opacity: 0,
                scale: reducedMotion ? 1 : 0.92,
                transition: STUDIO_EXIT,
              }}
            >
              <Button
                variant="quiet"
                size="sm"
                className={styles.action}
                onClick={reset}
              >
                {t("studio:player.equalizer.reset")}
              </Button>
            </m.span>
          )}
        </AnimatePresence>
      </div>
      <Collapse isOpen={isAdjusting && !isResting}>
        <StudioEqualizerBands id={bandsId} gainsDb={gainsDb} />
      </Collapse>
    </div>
  );
}
