import { useId, type ChangeEvent } from "react";
import type {
  QuizshowLanguage,
  QuizshowLanguageMode,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowQuestionEditor.module.css";
import { usedLanguagesOf } from "./quizshowValidation";

interface QuizshowBilingualInputProps {
  label: string;
  value: QuizshowText;
  languages: QuizshowLanguageMode;
  maxLength: number;
  isMultiline?: boolean;
  /** Languages whose input shows `errorText` beneath it. */
  missingLanguages?: readonly QuizshowLanguage[];
  /** One line for every missing language, or a line per language. */
  errorText?: string | ((language: QuizshowLanguage) => string);
  /** A hint under the group, tied to every input of it. */
  hint?: string;
  onChange: (value: QuizshowText) => void;
}

/** One field per language the quiz uses, tagged EN or PT, each with its own counter. */
export function QuizshowBilingualInput({
  label,
  value,
  languages,
  maxLength,
  isMultiline = false,
  missingLanguages = [],
  errorText,
  hint,
  onChange,
}: QuizshowBilingualInputProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className={styles.bilingual}>
      <span id={labelId} className={styles.groupLabel}>
        {label}
      </span>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {usedLanguagesOf(languages).map((language) => {
        const text = value[language];
        const isMissing = missingLanguages.includes(language);
        const error =
          isMissing && errorText !== undefined
            ? typeof errorText === "function"
              ? errorText(language)
              : errorText
            : undefined;
        const sharedProps = {
          value: text,
          maxLength,
          "aria-describedby": hint ? hintId : undefined,
          onChange: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => onChange({ ...value, [language]: event.target.value }),
        };
        return (
          <FormField
            key={language}
            className={styles.languageField}
            label={t(`quizshow:language.tag.${language}`)}
            labelAside={`${text.length}/${maxLength}`}
            error={error}
          >
            {isMultiline ? (
              <textarea rows={3} {...sharedProps} />
            ) : (
              <input type="text" {...sharedProps} />
            )}
          </FormField>
        );
      })}
    </div>
  );
}
