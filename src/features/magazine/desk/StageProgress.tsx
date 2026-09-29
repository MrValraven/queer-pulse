import type { CSSProperties } from "react";
import type { Stage } from "../data/desk.data";
import { STAGE_STEP, STAGE_STEP_COUNT, stageColorVar } from "./deskTones";
import { viewStageLabelKey } from "./stageLabels";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./StageProgress.module.css";

export type StageProgressVariant = "dots" | "bar";
export type StageProgressSize = "sm" | "md";

export interface StageProgressProps {
  stage: Stage;
  /** Eight dots, or one bar split into eight segments. */
  variant?: StageProgressVariant;
  /** Print the translated stage name beside the indicator. */
  showLabel?: boolean;
  size?: StageProgressSize;
}

const VARIANT_CLASS: Record<StageProgressVariant, string | undefined> = {
  dots: styles.dots,
  bar: styles.bar,
};

/** `md` is the default sizing declared on `.progress` itself. */
const SIZE_CLASS: Record<StageProgressSize, string | undefined> = {
  sm: styles.sm,
  md: undefined,
};

/** Steps 1 to 8, one segment each. */
const SEGMENT_STEPS = Array.from(
  { length: STAGE_STEP_COUNT },
  (_unused, stepIndex) => stepIndex + 1,
);

/**
 * How far a piece has come through the pipeline, at a glance. A row can show
 * where a piece sits among the eight stages without a column of words: every
 * step up to the current one is filled in its own `--desk-stage-N` colour,
 * the current step is drawn larger, and the steps still ahead stay a hairline
 * grey. Screen readers get one sentence ("Layout, step 6 of 8") through
 * `role="img"`, so the visible label, when shown, is covered by it.
 */
export function StageProgress({
  stage,
  variant = "dots",
  showLabel = false,
  size = "md",
}: StageProgressProps) {
  const { t } = useTranslation();
  const currentStep = STAGE_STEP[stage];
  const stageLabel = t(viewStageLabelKey(stage));
  const ariaLabel = t("magazine:desk.stageProgress.aria", {
    stage: stageLabel,
    step: currentStep,
    total: STAGE_STEP_COUNT,
  });

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cx(styles.progress, SIZE_CLASS[size])}
      data-stage-step={currentStep}
      style={{ "--stage-tone": stageColorVar(stage) } as CSSProperties}
    >
      <span className={cx(styles.track, VARIANT_CLASS[variant])}>
        {SEGMENT_STEPS.map((step) => (
          <span
            key={step}
            className={cx(
              styles.segment,
              step <= currentStep && styles.filled,
              step === currentStep && styles.current,
            )}
            style={
              { "--segment-tone": `var(--desk-stage-${step})` } as CSSProperties
            }
          />
        ))}
      </span>
      {showLabel && <span className={styles.label}>{stageLabel}</span>}
    </span>
  );
}
