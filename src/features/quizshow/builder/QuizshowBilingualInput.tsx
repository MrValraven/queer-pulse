import { useCallback, useId, useRef, useState, type ChangeEvent } from "react";
import { FiInfo } from "react-icons/fi";
import type {
  QuizshowLanguage,
  QuizshowLanguageMode,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  Button,
  Collapse,
  FormField,
  Toggle,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowQuestionEditor.module.css";
import {
  useHasQuizshowReviewMarks,
  useQuizshowReviewMarks,
} from "./quizshowReviewMarks";
import { usedLanguagesOf } from "./quizshowValidation";

/**
 * The group's name: `label`, drawn above its fields, or `labelledById`, the
 * id of a label the caller draws itself (a list row's "Answer 1", set in the
 * row's first line); the group then draws none and is named by it.
 */
type QuizshowBilingualInputName =
  | { label: string; labelledById?: undefined }
  | { label?: undefined; labelledById: string };

type QuizshowBilingualInputProps = QuizshowBilingualInputName & {
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
};

interface QuizshowLanguageInputProps {
  language: QuizshowLanguage;
  text: string;
  maxLength: number;
  isMultiline: boolean;
  error: string | undefined;
  describedBy: string | undefined;
  onTextChange: (text: string) => void;
  /** Receives the input or textarea, so a caller can move focus to it. */
  controlRef?: (element: HTMLInputElement | HTMLTextAreaElement | null) => void;
}

/** One language's input, tagged EN or PT, with its own counter. */
function QuizshowLanguageInput({
  language,
  text,
  maxLength,
  isMultiline,
  error,
  describedBy,
  onTextChange,
  controlRef,
}: QuizshowLanguageInputProps) {
  const { t } = useTranslation();
  const sharedProps = {
    value: text,
    maxLength,
    lang: language,
    "aria-describedby": describedBy,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onTextChange(event.target.value),
  };
  return (
    <FormField
      className={styles.languageField}
      label={t(`quizshow:language.tag.${language}`)}
      labelAside={`${text.length}/${maxLength}`}
      error={error}
    >
      {isMultiline ? (
        <textarea rows={3} ref={controlRef} {...sharedProps} />
      ) : (
        <input type="text" ref={controlRef} {...sharedProps} />
      )}
    </FormField>
  );
}

/** "Check this translation" under a PT text filled from EN, with "Mark as checked" to clear it. */
function QuizshowReviewMark({
  isOpen,
  markId,
  fieldLabelId,
  onReviewed,
}: {
  isOpen: boolean;
  /** Id of the mark's text, which the PT input also names in its description. */
  markId: string;
  fieldLabelId: string;
  onReviewed: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={isOpen}>
      <div className={styles.reviewMark}>
        <p id={markId} className={styles.reviewMarkText}>
          <FiInfo aria-hidden fill="none" className={styles.reviewMarkIcon} />
          {t("quizshow:studio.checkTranslation")}
        </p>
        <Button
          variant="stage-ghost"
          size="sm"
          type="button"
          aria-describedby={`${markId} ${fieldLabelId}`}
          onClick={onReviewed}
        >
          {t("quizshow:studio.looksRight")}
        </Button>
      </div>
    </Collapse>
  );
}

/** The muted PT line "Same in both" shows where the PT input was. */
function QuizshowMirrorLine({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <p className={styles.mirrorLine}>
      <span className={styles.mirrorTag}>{t("quizshow:language.tag.pt")}</span>
      <span lang="pt" className={styles.mirrorText}>
        {text}
      </span>
    </p>
  );
}

/** A field starts in "Same in both" when its texts already match, are not blank and were checked. */
function isSameTextAtStart(value: QuizshowText, isUnreviewed: boolean) {
  return value.en.trim() !== "" && value.en === value.pt && !isUnreviewed;
}

/**
 * One field per language the quiz uses, tagged EN or PT, each with its own
 * counter. In the studio (under the review marks provider) a quiz in both
 * languages also offers "Same in both" per field and marks a PT text filled
 * from EN until someone checks it (item 24).
 */
export function QuizshowBilingualInput({
  label,
  labelledById,
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
  const ownLabelId = useId();
  const labelId = labelledById ?? ownLabelId;
  const hintId = useId();
  const sameSwitchId = useId();
  const reviewMarkId = useId();
  const portugueseInputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);
  const setPortugueseInput = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement | null) => {
      portugueseInputRef.current = element;
    },
    [],
  );
  const reviewMarks = useQuizshowReviewMarks();
  const hasReviewMarks = useHasQuizshowReviewMarks();
  const isBothOffered = hasReviewMarks && languages === "both";
  const isValueUnreviewed = reviewMarks.isUnreviewed(value);
  const [isSameInBoth, setIsSameInBoth] = useState(() =>
    isSameTextAtStart(value, isValueUnreviewed),
  );
  // Derived from the value too, so an undo, an edit elsewhere or a language
  // round trip that leaves PT different never hides a PT the next EN keystroke would overwrite.
  const isSameShown = isSameInBoth && value.en === value.pt;
  // Once the texts part, the switch stays off until someone turns it on again.
  if (isSameInBoth && !isSameShown) setIsSameInBoth(false);
  const isMirrored = isBothOffered && isSameShown;

  const errorFor = (language: QuizshowLanguage) =>
    missingLanguages.includes(language) && errorText !== undefined
      ? typeof errorText === "function"
        ? errorText(language)
        : errorText
      : undefined;

  const handleTextChange = (language: QuizshowLanguage, text: string) => {
    // While mirrored, every EN change writes the same text to PT.
    if (isMirrored && language === "en") onChange({ en: text, pt: text });
    else onChange({ ...value, [language]: text });
  };

  // Turning it on copies EN to PT and counts as checking the translation; off keeps the copy editable.
  const handleSameInBoth = (isOn: boolean) => {
    setIsSameInBoth(isOn);
    if (!isOn) return;
    reviewMarks.markReviewed({ en: value.en, pt: value.en });
    if (value.pt !== value.en) onChange({ ...value, pt: value.en });
  };

  // The mark folds away with its button, so focus moves to the PT input it was about.
  const handleReviewed = () => {
    reviewMarks.markReviewed(value);
    portugueseInputRef.current?.focus();
  };

  const describedByFor = (language: QuizshowLanguage) => {
    const ids = [
      hint ? hintId : null,
      language === "pt" && isBothOffered && isValueUnreviewed
        ? reviewMarkId
        : null,
    ].filter((id) => id !== null);
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  const renderLanguage = (language: QuizshowLanguage) => {
    const languageInput = (
      <QuizshowLanguageInput
        key={language}
        language={language}
        text={value[language]}
        maxLength={maxLength}
        isMultiline={isMultiline}
        error={errorFor(language)}
        describedBy={describedByFor(language)}
        onTextChange={(text) => handleTextChange(language, text)}
        controlRef={language === "pt" ? setPortugueseInput : undefined}
      />
    );
    if (language !== "pt" || !isBothOffered) return languageInput;
    return (
      <div key={language} className={styles.portugueseSlot}>
        <Collapse isOpen={!isMirrored}>
          {languageInput}
          <QuizshowReviewMark
            isOpen={isValueUnreviewed}
            markId={reviewMarkId}
            fieldLabelId={labelId}
            onReviewed={handleReviewed}
          />
        </Collapse>
        <Collapse isOpen={isMirrored}>
          <QuizshowMirrorLine text={value.en} />
        </Collapse>
      </div>
    );
  };

  return (
    <div role="group" aria-labelledby={labelId} className={styles.bilingual}>
      {labelledById === undefined && (
        <span id={labelId} className={styles.groupLabel}>
          {label}
        </span>
      )}
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {hasReviewMarks && (
        <Collapse isOpen={isBothOffered}>
          <div className={styles.sameRow}>
            <label htmlFor={sameSwitchId} className={styles.sameLabel}>
              {t("quizshow:studio.sameInBoth")}
            </label>
            <Toggle
              id={sameSwitchId}
              checked={isSameShown}
              label={t("quizshow:studio.sameInBoth")}
              aria-describedby={labelId}
              onChange={handleSameInBoth}
            />
          </div>
        </Collapse>
      )}
      {usedLanguagesOf(languages).map(renderLanguage)}
    </div>
  );
}
