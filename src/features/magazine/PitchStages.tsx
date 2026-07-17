import type { PitchStage, StageState } from "./pitchTracker.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./PitchTrackerPage.module.css";

const STAGE_CLASS: Record<StageState, string> = {
  done: styles.stageDone!,
  active: styles.stageActive!,
  upcoming: "",
  rejected: styles.stageRejected!,
};

/** Segmented progress rail: done (jade) · active (coral) · upcoming (muted). */
export function PitchStages({ stages }: { stages: PitchStage[] }) {
  const { t } = useTranslation();

  return (
    <div className={styles.stages}>
      {stages.map((stage, stageIndex) => (
        <div
          key={`${stage.labelKey}-${stageIndex}`}
          className={[styles.stage, STAGE_CLASS[stage.state]]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.stageBar} />
          <div className={styles.stageLabel}>{t(stage.labelKey)}</div>
        </div>
      ))}
    </div>
  );
}
