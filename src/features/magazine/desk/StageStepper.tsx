import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STAGE_DTO_TO_VIEW } from "../api/pieces.adapters";
import type { PieceStage } from "../api/pieces.api";
import { DEMO_STAGES } from "../data/desk.data";
import styles from "./pieceTabs.module.css";

export interface StageStepperProps {
  /** A backend `PieceStage` code (e.g. `"edit"`). Falls back to rendering the
   *  raw value with nothing marked active if it isn't a known code. */
  stage: string;
}

/**
 * "Where it is" — the 7 editorial stages in order, with the piece's current
 * stage and everything before it marked active. Lives in the piece record's
 * `.erail` sidebar, alongside the publish gate.
 */
export function StageStepper({ stage }: StageStepperProps) {
  const { t } = useTranslation();
  const displayStage = STAGE_DTO_TO_VIEW[stage as PieceStage] ?? stage;
  const currentIndex = DEMO_STAGES.indexOf(displayStage);

  return (
    <div className={styles.card}>
      <h3>{t("magazine:piece.stageStepper.heading")}</h3>
      <div className={styles.steps}>
        {DEMO_STAGES.map((stageName, index) => {
          const isActive = currentIndex >= 0 && index <= currentIndex;
          return (
            <div key={stageName} className={cx(styles.step, isActive && styles.stepOn)}>
              <span className={styles.dot} />
              {stageName}
            </div>
          );
        })}
      </div>
    </div>
  );
}
