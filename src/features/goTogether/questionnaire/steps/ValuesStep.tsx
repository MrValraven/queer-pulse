import { useId } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VALUE_ITEM_IDS } from "../../goTogetherQuestionnaire.data";
import { LikertScale } from "../LikertScale";
import { SCALE_POINTS } from "../questionnaireSteps.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

/** Six values, each a 1 to 5 "how much does this matter" row. */
export function ValuesStep({ questionnaire }: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const total = SCALE_POINTS.length;
  const scaleWords = SCALE_POINTS.map((point) =>
    t(`goTogether:questionnaire.values.scale.${point}`),
  );
  // Each name starts with the visible number, so a voice user can say
  // "click 3" (WCAG 2.5.3, label in name).
  const pointNames = SCALE_POINTS.map((point, index) =>
    t("goTogether:questionnaire.likert.anchored", {
      position: point,
      total,
      anchor: scaleWords[index] ?? "",
    }),
  );
  return (
    <div className={styles.rows}>
      {VALUE_ITEM_IDS.map((itemId) => {
        const labelId = `${idPrefix}-${itemId}`;
        return (
          <div key={itemId} className={styles.likertRow}>
            <p id={labelId} className={styles.rowLabel}>
              {t(`goTogether:questionnaire.values.${itemId}.label`)}
            </p>
            <LikertScale
              labelledBy={labelId}
              value={questionnaire.draft.values[itemId]}
              onChange={(score) => questionnaire.setValueScore(itemId, score)}
              pointNames={pointNames}
              lowAnchor={scaleWords[0] ?? ""}
              highAnchor={scaleWords[scaleWords.length - 1] ?? ""}
            />
          </div>
        );
      })}
    </div>
  );
}
