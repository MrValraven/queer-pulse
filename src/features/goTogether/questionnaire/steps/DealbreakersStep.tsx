import { useId } from "react";
import { ChipSelect } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  AGE_BRACKETS,
  AGE_PREFERENCES,
  CHAT_LANGUAGES,
  DRINKING_OPTIONS,
} from "../../goTogetherQuestionnaire.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import { ChoiceGroup } from "./IntentStep";
import styles from "../GoTogetherQuestionnaire.module.css";

/** The hard filters: a shared chat language, drinking, and age. The group
 *  is only ever formed from people these fit. */
export function DealbreakersStep({ questionnaire }: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const languagesLabelId = useId();
  const { draft, setChoice, toggleTag } = questionnaire;
  return (
    <div className={styles.rows}>
      <section className={styles.block}>
        <h2 id={languagesLabelId} className={styles.groupLabel}>
          {t("goTogether:questionnaire.language.label")}
        </h2>
        <p className={styles.groupHint}>
          {t("goTogether:questionnaire.language.hint")}
        </p>
        <ChipSelect
          labelledBy={languagesLabelId}
          options={CHAT_LANGUAGES.map((languageId) => ({
            value: languageId,
            label: t(`goTogether:questionnaire.language.${languageId}`),
          }))}
          selected={new Set<string>(draft.languages)}
          onToggle={(languageId) => toggleTag("languages", languageId)}
          size="touch"
          className={styles.chipRow}
        />
      </section>
      <ChoiceGroup
        label={t("goTogether:questionnaire.drinking.label")}
        options={DRINKING_OPTIONS}
        value={draft.drinking}
        onChange={(drinking) => setChoice("drinking", drinking)}
        labelKeyPrefix="goTogether:questionnaire.drinking"
      />
      <ChoiceGroup
        label={t("goTogether:questionnaire.age.label")}
        hint={t("goTogether:questionnaire.age.hint")}
        options={AGE_BRACKETS}
        value={draft.ageBracket}
        onChange={(ageBracket) => setChoice("ageBracket", ageBracket)}
        labelKeyPrefix="goTogether:questionnaire.age"
      />
      <ChoiceGroup
        label={t("goTogether:questionnaire.agePreference.label")}
        options={AGE_PREFERENCES}
        value={draft.agePreference}
        onChange={(agePreference) => setChoice("agePreference", agePreference)}
        labelKeyPrefix="goTogether:questionnaire.agePreference"
      />
    </div>
  );
}
