import { useId } from "react";
import { ChipSelect } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  INTEREST_TAGS_BY_FAMILY,
  MAX_INTEREST_TAGS,
  type InterestFamilyId,
} from "../../goTogetherQuestionnaire.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

const INTEREST_FAMILY_IDS = Object.keys(
  INTEREST_TAGS_BY_FAMILY,
) as InterestFamilyId[];

/** Up to eight interest tags, grouped under the gathering families. The pick
 *  counter lives in the page's sticky action bar. */
export function InterestsStep({ questionnaire }: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const selected = new Set<string>(questionnaire.draft.interests);
  return (
    <div className={styles.rows}>
      {INTEREST_FAMILY_IDS.map((familyId) => {
        const labelId = `${idPrefix}-${familyId}`;
        return (
          <section key={familyId} className={styles.block}>
            <h2 id={labelId} className={styles.groupLabel}>
              {t(`goTogether:questionnaire.interests.family.${familyId}`)}
            </h2>
            <ChipSelect
              labelledBy={labelId}
              options={INTEREST_TAGS_BY_FAMILY[familyId].map((tagId) => ({
                value: tagId,
                label: t(`goTogether:questionnaire.interests.tag.${tagId}`),
              }))}
              selected={selected}
              onToggle={(tagId) => questionnaire.toggleTag("interests", tagId)}
              maxSelected={MAX_INTEREST_TAGS}
              size="touch"
              className={styles.chipRow}
            />
          </section>
        );
      })}
    </div>
  );
}
