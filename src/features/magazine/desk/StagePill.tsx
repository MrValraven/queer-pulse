import type { CSSProperties } from "react";
import type { Stage } from "../data/desk.data";
import { STAGE_STEP, stageColorVar } from "./deskTones";
import { viewStageLabelKey } from "./stageLabels";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./StagePill.module.css";

/**
 * Small rounded pill showing a piece's workflow stage. Its colour is the
 * stage's step on the shared `--desk-stage-N` scale (see `deskTones.ts`), so
 * the pill, StageProgress and the board columns agree on what each stage
 * looks like. `data-stage-step` names the step for tests and later styling.
 */
export function StagePill({ stage }: { stage: Stage }) {
  const { t } = useTranslation();
  const isPublished = stage === "Published";
  return (
    <span
      className={cx(styles.pill, isPublished && styles.published)}
      data-stage-step={STAGE_STEP[stage]}
      style={{ "--stage-tone": stageColorVar(stage) } as CSSProperties}
    >
      {/* `stage` IS its own English label ("Sensitivity read"), so it goes
          through the shared stage-key lookup rather than straight to screen. */}
      {t(viewStageLabelKey(stage))}
    </span>
  );
}
