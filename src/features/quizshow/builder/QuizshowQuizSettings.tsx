import { useId } from "react";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { FormField } from "../../../shared/components/ui/FormField";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
} from "../../../shared/contracts/quizshow";
import type { QuizshowDraftController } from "./useQuizshowDraft";
import styles from "./QuizshowRounds.module.css";

const LANGUAGE_MODES: readonly QuizshowLanguageMode[] = ["en", "pt", "both"];
const SCREEN_LANGUAGES: readonly QuizshowLanguage[] = ["en", "pt"];

export function QuizshowQuizSettings({
  controller,
}: {
  controller: QuizshowDraftController;
}) {
  const { t } = useTranslation();
  const languagesLabelId = useId();
  const screenLabelId = useId();
  const screenHintId = useId();
  const { draft, setQuizField } = controller;

  const handleLanguages = (languages: QuizshowLanguageMode) => {
    setQuizField("languages", languages);
    if (languages !== "both") setQuizField("screenLanguage", languages);
  };

  return (
    <div className={styles.fields}>
      <FormField label={t("quizshow:settings.title.label")}>
        <input
          type="text"
          value={draft.title}
          maxLength={QUIZSHOW_LIMITS.quizTitleMax}
          placeholder={t("quizshow:settings.title.placeholder")}
          onChange={(event) => setQuizField("title", event.target.value)}
        />
      </FormField>
      <div className={styles.fieldGroup}>
        <span id={languagesLabelId} className={styles.groupLabel}>
          {t("quizshow:settings.languages.label")}
        </span>
        <RadioCardGroup
          value={draft.languages}
          ariaLabel={t("quizshow:settings.languages.label")}
          ariaLabelledBy={languagesLabelId}
          className={styles.optionGrid}
          optionClassName={styles.choice}
          onChange={handleLanguages}
          options={LANGUAGE_MODES.map((mode) => ({
            id: mode,
            render: t(`quizshow:language.${mode}`),
          }))}
        />
      </div>
      <Collapse isOpen={draft.languages === "both"}>
        <div className={styles.fieldGroup}>
          <span id={screenLabelId} className={styles.groupLabel}>
            {t("quizshow:settings.screenLanguage.label")}
          </span>
          <p id={screenHintId} className={styles.hint}>
            {t("quizshow:settings.screenLanguage.hint")}
          </p>
          <RadioCardGroup
            value={draft.screenLanguage}
            ariaLabel={t("quizshow:settings.screenLanguage.label")}
            ariaLabelledBy={screenLabelId}
            ariaDescribedBy={screenHintId}
            className={styles.optionGrid}
            optionClassName={styles.choice}
            onChange={(language) => setQuizField("screenLanguage", language)}
            options={SCREEN_LANGUAGES.map((language) => ({
              id: language,
              render: t(`quizshow:language.${language}`),
            }))}
          />
        </div>
      </Collapse>
    </div>
  );
}
