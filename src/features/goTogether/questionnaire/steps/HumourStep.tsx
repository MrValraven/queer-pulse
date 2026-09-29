import { FiCheck } from "react-icons/fi";
import { RadioCardGroup } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ACTIVE_HUMOUR_PAIR_IDS,
  type HumourPick,
} from "../../goTogetherQuestionnaire.data";
import { HUMOUR_PICKS } from "../questionnaireSteps.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

/** The active humour pairs: two large cards each, pick the funnier line. */
export function HumourStep({ questionnaire }: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const total = ACTIVE_HUMOUR_PAIR_IDS.length;
  return (
    <div className={styles.rows}>
      {ACTIVE_HUMOUR_PAIR_IDS.map((pairId, index) => {
        const pairLabel = t("goTogether:questionnaire.humour.pairLabel", {
          position: index + 1,
          total,
        });
        const picked = questionnaire.draft.humour[pairId];
        return (
          <div key={pairId} className={styles.humourPairBlock}>
            <p className={styles.pairCount} aria-hidden>
              {pairLabel}
            </p>
            <RadioCardGroup<HumourPick>
              value={picked ?? ""}
              onChange={(pick) => questionnaire.setHumourPick(pairId, pick)}
              ariaLabel={pairLabel}
              className={styles.humourPair}
              optionClassName={styles.humourCard}
              checkedClassName={styles.humourCardOn}
              options={HUMOUR_PICKS.map((pick) => ({
                id: pick,
                render: (
                  <>
                    <span className={styles.humourLine}>
                      {t(`goTogether:questionnaire.humour.${pairId}.${pick}`)}
                    </span>
                    {picked === pick && (
                      <FiCheck className={styles.cardTick} aria-hidden />
                    )}
                  </>
                ),
              }))}
            />
          </div>
        );
      })}
    </div>
  );
}
