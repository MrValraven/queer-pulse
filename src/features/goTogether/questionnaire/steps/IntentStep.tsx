import { useId, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { RadioCardGroup } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { INTENTS, MEET_FREQUENCIES } from "../../goTogetherQuestionnaire.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

interface ChoiceGroupProps<OptionId extends string> {
  label: string;
  options: readonly OptionId[];
  value: OptionId | null;
  onChange: (optionId: OptionId) => void;
  /** Catalog prefix: each option reads `${labelKeyPrefix}.${optionId}`. */
  labelKeyPrefix: string;
  /** A short line under the label, when the question needs one. */
  hint?: ReactNode;
}

/** One labelled single-choice question as a group of tappable cards. */
export function ChoiceGroup<OptionId extends string>({
  label,
  options,
  value,
  onChange,
  labelKeyPrefix,
  hint,
}: ChoiceGroupProps<OptionId>) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  return (
    <section className={styles.block}>
      <h2 id={labelId} className={styles.groupLabel}>
        {label}
      </h2>
      {hint != null && (
        <p id={hintId} className={styles.groupHint}>
          {hint}
        </p>
      )}
      <RadioCardGroup<OptionId>
        value={value ?? ""}
        onChange={onChange}
        ariaLabel={label}
        ariaLabelledBy={labelId}
        ariaDescribedBy={hint != null ? hintId : undefined}
        className={styles.choiceGrid}
        optionClassName={styles.choiceCard}
        checkedClassName={styles.choiceCardOn}
        options={options.map((optionId) => ({
          id: optionId,
          render: (
            <>
              <span className={styles.choiceText}>
                {t(`${labelKeyPrefix}.${optionId}`)}
              </span>
              {value === optionId && (
                <FiCheck className={styles.cardTick} aria-hidden />
              )}
            </>
          ),
        }))}
      />
    </section>
  );
}

/** What kind of friendship they hope for, and how often they'd meet. */
export function IntentStep({ questionnaire }: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const { draft, setChoice } = questionnaire;
  return (
    <div className={styles.rows}>
      <ChoiceGroup
        label={t("goTogether:questionnaire.intent.label")}
        options={INTENTS}
        value={draft.intent}
        onChange={(intent) => setChoice("intent", intent)}
        labelKeyPrefix="goTogether:questionnaire.intent"
      />
      <ChoiceGroup
        label={t("goTogether:questionnaire.frequency.label")}
        options={MEET_FREQUENCIES}
        value={draft.meetFrequency}
        onChange={(frequency) => setChoice("meetFrequency", frequency)}
        labelKeyPrefix="goTogether:questionnaire.frequency"
      />
    </div>
  );
}
