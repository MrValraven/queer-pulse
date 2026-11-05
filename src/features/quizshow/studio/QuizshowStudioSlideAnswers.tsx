import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, IconButton } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mintOptionId } from "../builder/quizshowDraft";
import { QuizshowShape } from "../QuizshowShape";
import { answerSwatchFor, trueFalseSwatchFor } from "../quizshowSwatches";
import { optionLetter } from "../stage/quizshowText";
import { QuizshowStudioSlideField } from "./QuizshowStudioSlideParts";
import {
  swatchStyleOf,
  useSlideProblemLine,
  withLanguageText,
} from "./quizshowStudioSlideText";
import { QuizshowStudioSlideOrder } from "./QuizshowStudioSlideOrder";
import styles from "./QuizshowStudioSlide.module.css";

type QuestionOf<Type extends QuizshowQuestionInput["type"]> = Extract<
  QuizshowQuestionInput,
  { type: Type }
>;

interface AnswersProps<Question extends QuizshowQuestionInput> {
  question: Question;
  language: QuizshowLanguage;
  onChange: (question: QuizshowQuestionInput) => void;
}

const TILE_EASE = [0.22, 0.68, 0.16, 1] as const;

/** The circle that marks the right answer: a native radio, jade with a check once picked. */
function RightMark({
  name,
  label,
  isChecked,
  onCheck,
}: {
  name: string;
  label?: string;
  isChecked: boolean;
  onCheck: () => void;
}) {
  return (
    <span className={styles.markWrap}>
      <input
        type="radio"
        name={name}
        className={styles.mark}
        checked={isChecked}
        aria-label={label}
        onChange={onCheck}
      />
      <FiCheck
        className={styles.markCheck}
        aria-hidden="true"
        focusable="false"
      />
    </span>
  );
}

/** The right answer is no longer the one at `removedIndex`; the ones after it shift up. */
function correctIndexAfterRemoving(
  correctIndex: number | undefined,
  removedIndex: number,
): { correctIndex: number } | null {
  if (correctIndex === undefined || correctIndex === removedIndex) return null;
  return {
    correctIndex: correctIndex > removedIndex ? correctIndex - 1 : correctIndex,
  };
}

/** Multiple choice: two to four glass tiles, each typed on, one circle marked right. */
function ChoiceTiles({
  question,
  language,
  onChange,
}: AnswersProps<QuestionOf<"multiple_choice">>) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const radioName = useId();
  const { options, answer } = question;
  const isAddAllowed =
    options.length < QUIZSHOW_LIMITS.multipleChoiceOptionsMax;
  const isRemoveAllowed =
    options.length > QUIZSHOW_LIMITS.multipleChoiceOptionsMin;
  const correctIndex = answer?.correctIndex ?? null;
  const rightOption = correctIndex === null ? undefined : options[correctIndex];
  const optionProblem = useSlideProblemLine("option_text_missing");
  const tileMotion = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: reducedMotion ? 0 : 0.22, ease: TILE_EASE },
  };
  return (
    <>
      <fieldset className={styles.choiceSet}>
        <legend className={styles.visuallyHidden}>
          {t("quizshow:questions.options.label")}
        </legend>
        <ul className={styles.answerGrid}>
          <AnimatePresence initial={false} mode="popLayout">
            {options.map((option, optionIndex) => {
              const number = optionIndex + 1;
              const swatch = answerSwatchFor(optionIndex);
              return (
                <m.li
                  key={option.id}
                  className={styles.tileCell}
                  layout={reducedMotion ? false : "position"}
                  {...tileMotion}
                >
                  <div
                    className={styles.tile}
                    data-right={correctIndex === optionIndex}
                    style={swatchStyleOf(swatch)}
                  >
                    <QuizshowShape
                      colorKey={swatch.colorKey}
                      size="screen"
                      label={null}
                      isGlowing
                    />
                    <span className={styles.letter} aria-hidden="true">
                      {optionLetter(optionIndex)}
                    </span>
                    <QuizshowStudioSlideField
                      label={t("quizshow:questions.options.item", { number })}
                      value={option.text[language]}
                      placeholder={t("quizshow:studio.slide.answerPlaceholder")}
                      maxLength={QUIZSHOW_LIMITS.optionTextMax}
                      className={styles.tileField}
                      problemText={
                        option.text[language].trim() === ""
                          ? optionProblem
                          : undefined
                      }
                      onChange={(value) =>
                        onChange({
                          ...question,
                          options: options.map((existing, index) =>
                            index === optionIndex
                              ? {
                                  ...existing,
                                  text: withLanguageText(
                                    existing.text,
                                    language,
                                    value,
                                  ),
                                }
                              : existing,
                          ),
                        })
                      }
                    />
                    <RightMark
                      name={radioName}
                      label={t("quizshow:questions.options.markCorrect", {
                        number,
                      })}
                      isChecked={correctIndex === optionIndex}
                      onCheck={() =>
                        onChange({
                          ...question,
                          answer: { correctIndex: optionIndex },
                        })
                      }
                    />
                    <span
                      className={styles.tileRemove}
                      data-hidden={!isRemoveAllowed}
                    >
                      <IconButton
                        size="sm"
                        tone="dark"
                        aria-label={t("quizshow:questions.options.remove", {
                          number,
                        })}
                        onClick={() =>
                          onChange({
                            ...question,
                            options: options.filter(
                              (_existing, index) => index !== optionIndex,
                            ),
                            answer: correctIndexAfterRemoving(
                              answer?.correctIndex,
                              optionIndex,
                            ),
                          })
                        }
                      >
                        <FiX aria-hidden />
                      </IconButton>
                    </span>
                  </div>
                </m.li>
              );
            })}
            {isAddAllowed && (
              <m.li key="add" className={styles.tileCell} {...tileMotion}>
                <Button
                  type="button"
                  variant="stage-ghost"
                  className={styles.addTile}
                  onClick={() =>
                    onChange({
                      ...question,
                      options: [
                        ...options,
                        { id: mintOptionId(options), text: { en: "", pt: "" } },
                      ],
                    })
                  }
                >
                  <FiPlus aria-hidden /> {t("quizshow:questions.options.add")}
                </Button>
              </m.li>
            )}
          </AnimatePresence>
        </ul>
      </fieldset>
      <p className={styles.foot}>
        {rightOption === undefined || correctIndex === null ? (
          t("quizshow:studio.slide.markHint")
        ) : (
          // One span, so the foot's gap never opens beside the name.
          <span>
            <Translation
              i18nKey="quizshow:studio.slide.rightIs"
              values={{ answer: "" }}
              slots={{
                answer: (
                  <strong>
                    {rightOption.text[language].trim() ||
                      t("quizshow:questions.options.item", {
                        number: correctIndex + 1,
                      })}
                  </strong>
                ),
              }}
            />
          </span>
        )}
      </p>
    </>
  );
}

/** True or false: the two stage tiles; marking one sets what the statement is. */
function TrueFalseTiles({
  question,
  onChange,
}: AnswersProps<QuestionOf<"true_false">>) {
  const { t } = useTranslation();
  const radioName = useId();
  const isTrueAnswer = question.answer?.isTrue ?? null;
  return (
    <>
      <fieldset className={styles.choiceSet}>
        <legend className={styles.visuallyHidden}>
          {t("quizshow:questions.trueFalse.label")}
        </legend>
        <ul className={styles.answerGrid}>
          {[true, false].map((isTrue, optionIndex) => {
            const swatch = trueFalseSwatchFor(isTrue);
            const text = t(
              isTrue
                ? "quizshow:questions.trueFalse.true"
                : "quizshow:questions.trueFalse.false",
            );
            return (
              <li key={String(isTrue)} className={styles.tileCell}>
                <label
                  className={styles.tile}
                  data-right={isTrueAnswer === isTrue}
                  data-pickable="true"
                  style={swatchStyleOf(swatch)}
                >
                  <QuizshowShape
                    colorKey={swatch.colorKey}
                    size="screen"
                    label={null}
                    isGlowing
                  />
                  <span className={styles.letter} aria-hidden="true">
                    {optionLetter(optionIndex)}
                  </span>
                  <span className={styles.tileText}>{text}</span>
                  <RightMark
                    name={radioName}
                    isChecked={isTrueAnswer === isTrue}
                    onCheck={() =>
                      onChange({ ...question, answer: { isTrue } })
                    }
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      <p className={styles.foot}>
        {isTrueAnswer === null
          ? t("quizshow:studio.slide.markHint")
          : t("quizshow:studio.slide.statementIs", {
              // Mid-sentence: "The statement is true".
              answer: t(
                isTrueAnswer
                  ? "quizshow:questions.trueFalse.true"
                  : "quizshow:questions.trueFalse.false",
              ).toLocaleLowerCase(),
            })}
      </p>
    </>
  );
}

/** Reads typed text as a finite number within the limit, or null ("1,000" reads as a thousands mark). */
function parseNumberText(text: string): number | null {
  const trimmed = text.trim();
  if (
    !/^-?(\d+[.,]?\d*|[.,]\d+)$/.test(trimmed) ||
    /^-?\d{1,3}(,\d{3})+$/.test(trimmed)
  ) {
    return null;
  }
  const parsed = Number(trimmed.replace(",", "."));
  const isInRange =
    Number.isFinite(parsed) && Math.abs(parsed) <= QUIZSHOW_LIMITS.numberAbsMax;
  return isInRange ? parsed : null;
}

/** The stage's "Answer on your phone" box, with the right answer typed into it. */
function TypedAnswerBox({
  question,
  language,
  onChange,
}: AnswersProps<QuestionOf<"type_answer"> | QuestionOf<"closest_number">>) {
  const { t } = useTranslation();
  const hintId = useId();
  const savedNumber =
    question.type === "closest_number" && question.answer !== null
      ? question.answer.value
      : null;
  const [numberText, setNumberText] = useState(() =>
    savedNumber === null ? "" : String(savedNumber),
  );
  // The typed text stays while it reads as the saved number; an edit made
  // elsewhere (the inspector) shows through.
  const parsedNumber = parseNumberText(numberText);
  const shownNumberText =
    parsedNumber === savedNumber ||
    (savedNumber === null && parsedNumber === null)
      ? numberText
      : String(savedNumber);
  const isUnreadable =
    question.type === "closest_number" &&
    shownNumberText.trim() !== "" &&
    parseNumberText(shownNumberText) === null;
  const acceptedAnswers =
    question.type === "type_answer" ? question.acceptedAnswers : [];
  const answerProblem = useSlideProblemLine("answer_missing");
  const isNumberInvalid = isUnreadable || answerProblem !== undefined;
  return (
    <>
      <div className={styles.answerBox}>
        <p className={styles.answerBoxNote}>
          {t("quizshow:stage.answerOnPhone")}
        </p>
        <span className={styles.answerBoxLabel} aria-hidden="true">
          {t("quizshow:stage.correctAnswer")}
        </span>
        {question.type === "type_answer" ? (
          <QuizshowStudioSlideField
            label={t("quizshow:questions.typeAnswer.answer")}
            value={question.answer?.text[language] ?? ""}
            placeholder={t("quizshow:studio.slide.typedPlaceholder")}
            maxLength={QUIZSHOW_LIMITS.answerTextMax}
            className={styles.answerBoxField}
            problemText={answerProblem}
            onChange={(value) =>
              onChange({
                ...question,
                answer: {
                  text: withLanguageText(
                    question.answer?.text ?? { en: "", pt: "" },
                    language,
                    value,
                  ),
                },
              })
            }
          />
        ) : (
          <>
            <label
              htmlFor={hintId + "-number"}
              className={styles.visuallyHidden}
            >
              {t("quizshow:questions.closest.label")}
            </label>
            <input
              id={hintId + "-number"}
              type="text"
              inputMode="decimal"
              className={`${styles.field} ${styles.answerBoxField}`}
              value={shownNumberText}
              placeholder={t("quizshow:studio.slide.numberPlaceholder")}
              aria-invalid={isNumberInvalid || undefined}
              aria-describedby={hintId}
              onChange={(event) => {
                const nextText = event.target.value;
                setNumberText(nextText);
                const parsed = parseNumberText(nextText);
                onChange({
                  ...question,
                  answer: parsed === null ? null : { value: parsed },
                });
              }}
            />
          </>
        )}
      </div>
      <p
        id={hintId}
        className={styles.foot}
        data-tone={isNumberInvalid ? "problem" : undefined}
      >
        {question.type === "closest_number" &&
          (isUnreadable
            ? t("quizshow:questions.closest.invalid")
            : (answerProblem ?? t("quizshow:questions.closest.hint")))}
        {question.type === "type_answer" && acceptedAnswers.length > 0 && (
          <>
            <span>{t("quizshow:questions.typeAnswer.accepted")}</span>
            <strong>{acceptedAnswers.join(", ")}</strong>
          </>
        )}
      </p>
    </>
  );
}

/** The answers of a quiz question, drawn as the stage draws them and typed on in place. */
export function QuizshowStudioSlideAnswers({
  question,
  language,
  onChange,
}: AnswersProps<QuizshowQuestionInput>) {
  switch (question.type) {
    case "multiple_choice":
      return (
        <ChoiceTiles
          question={question}
          language={language}
          onChange={onChange}
        />
      );
    case "true_false":
      return (
        <TrueFalseTiles
          question={question}
          language={language}
          onChange={onChange}
        />
      );
    case "order":
      return (
        <QuizshowStudioSlideOrder
          question={question}
          language={language}
          onChange={onChange}
        />
      );
    case "type_answer":
    case "closest_number":
      return (
        <TypedAnswerBox
          question={question}
          language={language}
          onChange={onChange}
        />
      );
    case "prompt":
      return null;
  }
}
