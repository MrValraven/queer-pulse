import type { PitchStage, StageState } from "./pitchTracker.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./PitchTrackerPage.module.css";

const STAGE_CLASS: Record<StageState, string> = {
  done: styles.stageDone!,
  active: styles.stageActive!,
  upcoming: "",
  rejected: styles.stageRejected!,
};

/**
 * Where the pitch is now: the last stage it has reached. That is the active
 * stage while the desk works on it, the closing stage of a pitch that was
 * turned down, and the final stage once it is published.
 */
function currentStageIndex(stages: PitchStage[]): number {
  const reachedIndex = stages.findLastIndex(
    (stage) => stage.state !== "upcoming",
  );
  return Math.max(reachedIndex, 0);
}

/**
 * Segmented progress rail: done (jade) · active (coral) · upcoming (muted).
 *
 * Every segment is the same width at every card size. On a narrow card only
 * the current stage keeps a visible label (the rest stay in the accessibility
 * tree), anchored to its own segment and allowed to run across the hidden
 * neighbours: rightward from a stage in the first half, leftward from one in
 * the second half, so it never leaves the card.
 */
export function PitchStages({ stages }: { stages: PitchStage[] }) {
  const { t } = useTranslation();
  const currentIndex = currentStageIndex(stages);

  return (
    <ol className={styles.stages}>
      {stages.map((stage, stageIndex) => {
        const isCurrent = stageIndex === currentIndex;
        return (
          <li
            key={`${stage.labelKey}-${stageIndex}`}
            className={[styles.stage, STAGE_CLASS[stage.state]]
              .filter(Boolean)
              .join(" ")}
            aria-current={isCurrent ? "step" : undefined}
            data-label-align={stageIndex >= stages.length / 2 ? "end" : "start"}
          >
            <span className={styles.stageBar} aria-hidden />
            <span className={styles.stageLabel}>{t(stage.labelKey)}</span>
          </li>
        );
      })}
    </ol>
  );
}
