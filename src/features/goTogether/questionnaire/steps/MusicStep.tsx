import { ChipSelect } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  MAX_MUSIC_TAGS,
  MUSIC_TAG_IDS,
} from "../../goTogetherQuestionnaire.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

/** Up to five music genres. Optional: none picked counts as neutral. The pick
 *  counter lives in the page's sticky action bar. */
export function MusicStep({
  questionnaire,
  headingId,
}: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const selected = new Set<string>(questionnaire.draft.music);
  return (
    <div className={styles.rows}>
      <ChipSelect
        labelledBy={headingId}
        options={MUSIC_TAG_IDS.map((tagId) => ({
          value: tagId,
          label: t(`goTogether:questionnaire.music.${tagId}`),
        }))}
        selected={selected}
        onToggle={(tagId) => questionnaire.toggleTag("music", tagId)}
        maxSelected={MAX_MUSIC_TAGS}
        size="touch"
        className={styles.chipRow}
      />
    </div>
  );
}
