import { useId } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ENERGY_ITEM_IDS } from "../../goTogetherQuestionnaire.data";
import { LikertScale } from "../LikertScale";
import { SCALE_POINTS } from "../questionnaireSteps.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

/** Three energy rows, each between a low and a high anchor. */
export function EnergyStep({ questionnaire }: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const total = SCALE_POINTS.length;
  return (
    <div className={styles.rows}>
      {ENERGY_ITEM_IDS.map((itemId) => {
        const labelId = `${idPrefix}-${itemId}`;
        const lowAnchor = t(`goTogether:questionnaire.energy.${itemId}.low`);
        const highAnchor = t(`goTogether:questionnaire.energy.${itemId}.high`);
        const pointNames = SCALE_POINTS.map((point) => {
          const anchor =
            point === 1 ? lowAnchor : point === total ? highAnchor : null;
          return anchor == null
            ? t("goTogether:questionnaire.likert.position", {
                position: point,
                total,
              })
            : t("goTogether:questionnaire.likert.anchored", {
                position: point,
                total,
                anchor,
              });
        });
        return (
          <div key={itemId} className={styles.likertRow}>
            <p id={labelId} className={styles.rowLabel}>
              {t(`goTogether:questionnaire.energy.${itemId}.prompt`)}
            </p>
            <LikertScale
              labelledBy={labelId}
              value={questionnaire.draft.energy[itemId]}
              onChange={(score) => questionnaire.setEnergyScore(itemId, score)}
              pointNames={pointNames}
              lowAnchor={lowAnchor}
              highAnchor={highAnchor}
            />
          </div>
        );
      })}
    </div>
  );
}
