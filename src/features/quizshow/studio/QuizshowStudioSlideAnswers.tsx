import { Fragment, useId, useMemo } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse, IconButton } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import { intlLocale } from "../../../shared/i18n/locale";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  correctIndexesOf,
  isLastWrongOption,
  mintOptionId,
  withCorrectOptionToggled,
  withOptionRemoved,
  type QuizshowOptionListQuestion,
} from "../builder/quizshowDraft";
import { QuizshowShape } from "../QuizshowShape";
import { answerSwatchFor, trueFalseSwatchFor } from "../quizshowSwatches";
import { optionLetter } from "../stage/quizshowText";
import {
  QuizshowStudioSlideClosestNumber,
  QuizshowStudioSlideTypedAnswer,
} from "./QuizshowStudioSlideAnswerBoxes";
import {
  QuizshowStudioSlideField,
  QuizshowStudioSlideRightMark,
} from "./QuizshowStudioSlideParts";
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

interface ChoiceTileProps extends AnswersProps<QuizshowOptionListQuestion> {
  optionIndex: number;
  /** Names the "Leave at least one option wrong" line a blocked mark points at. */
  keepOneWrongId: string;
}

/**
 * One option tile, typed on: its shape and letter, its text, and for
 * multiple choice the toggle that marks it correct. A poll draws no mark.
 */
function ChoiceTile({
  question,
  language,
  optionIndex,
  keepOneWrongId,
  onChange,
}: ChoiceTileProps) {
  const { t } = useTranslation();
  const optionProblem = useSlideProblemLine("option_text_missing");
  const { options } = question;
  const option = options[optionIndex];
  const markable = question.type === "multiple_choice" ? question : null;
  const isMarked =
    markable !== null && correctIndexesOf(markable).includes(optionIndex);
  // Marking or removing this option would leave none wrong (contract 6.22).
  const isLastWrong =
    markable !== null && isLastWrongOption(markable, optionIndex);
  const isRemoveAllowed =
    options.length > QUIZSHOW_LIMITS.multipleChoiceOptionsMin && !isLastWrong;
  if (option === undefined) return null;
  const number = optionIndex + 1;
  const swatch = answerSwatchFor(optionIndex);
  return (
    <div
      className={styles.tile}
      data-right={isMarked}
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
        lang={language}
        problemText={
          option.text[language].trim() === "" ? optionProblem : undefined
        }
        onChange={(value) =>
          onChange({
            ...question,
            options: options.map((existing, index) =>
              index === optionIndex
                ? {
                    ...existing,
                    text: withLanguageText(existing.text, language, value),
                  }
                : existing,
            ),
          })
        }
      />
      {markable !== null && (
        <QuizshowStudioSlideRightMark
          type="checkbox"
          label={t("quizshow:questions.options.markCorrect", { number })}
          isChecked={isMarked}
          isBlocked={isLastWrong}
          describedBy={isLastWrong ? keepOneWrongId : undefined}
          onCheck={() =>
            onChange(withCorrectOptionToggled(markable, optionIndex))
          }
        />
      )}
      <span className={styles.tileRemove} data-hidden={!isRemoveAllowed}>
        <IconButton
          size="sm"
          tone="dark"
          aria-label={t("quizshow:questions.options.remove", { number })}
          onClick={() => onChange(withOptionRemoved(question, optionIndex))}
        >
          <FiX aria-hidden />
        </IconButton>
      </span>
    </div>
  );
}

/** "1970 is the right answer", or every marked option ("Lilac and Teal") when several are right. */
function RightAnswersLine({
  question,
  language,
}: {
  question: QuestionOf<"multiple_choice">;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const listFormat = useMemo(
    () => new Intl.ListFormat(intlLocale(language), { type: "conjunction" }),
    [language],
  );
  const marked = correctIndexesOf(question);
  if (marked.length === 0) return <>{t("quizshow:studio.slide.markHint")}</>;
  const names = marked.map((optionIndex) => {
    const text = question.options[optionIndex]?.text[language].trim() ?? "";
    return text === "" ? (
      <strong key={optionIndex}>
        {t("quizshow:questions.options.item", { number: optionIndex + 1 })}
      </strong>
    ) : (
      <strong key={optionIndex} lang={language}>
        {text}
      </strong>
    );
  });
  // The list format joins stand-in tokens (each name's index as text); each
  // token part comes back as the name it stands for.
  const joinedNames = listFormat
    .formatToParts(names.map((_name, index) => String(index)))
    .map((part, partIndex) => (
      <Fragment key={`${part.type}-${partIndex}`}>
        {part.type === "element" ? names[Number(part.value)] : part.value}
      </Fragment>
    ));
  return (
    // One span, so the foot's gap never opens beside the names.
    <span>
      <Translation
        i18nKey={
          marked.length === 1
            ? "quizshow:studio.slide.rightIs"
            : "quizshow:studio.slide.rightAre"
        }
        values={{ answer: "", answers: "" }}
        slots={{ answer: joinedNames, answers: joinedNames }}
      />
    </span>
  );
}

/** Multiple choice and poll: two to four glass tiles, each typed on; multiple choice marks every right one. */
function ChoiceTiles({
  question,
  language,
  onChange,
}: AnswersProps<QuizshowOptionListQuestion>) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const keepOneWrongId = useId();
  const { options } = question;
  const isAddAllowed =
    options.length < QUIZSHOW_LIMITS.multipleChoiceOptionsMax;
  const markable = question.type === "multiple_choice" ? question : null;
  const isEveryMarkTaken =
    markable !== null &&
    options.some((_option, index) => isLastWrongOption(markable, index));
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
            {options.map((option, optionIndex) => (
              <m.li
                key={option.id}
                className={styles.tileCell}
                layout={reducedMotion ? false : "position"}
                {...tileMotion}
              >
                <ChoiceTile
                  question={question}
                  language={language}
                  optionIndex={optionIndex}
                  keepOneWrongId={keepOneWrongId}
                  onChange={onChange}
                />
              </m.li>
            ))}
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
        {question.type === "poll" ? (
          <>
            <span className={styles.pill}>{t("quizshow:studio.pollTag")}</span>
            <span>{t("quizshow:type.pollHint")}</span>
          </>
        ) : (
          <RightAnswersLine question={question} language={language} />
        )}
      </p>
      {markable !== null && (
        <Collapse isOpen={isEveryMarkTaken}>
          <p id={keepOneWrongId} className={styles.foot}>
            {t("quizshow:questions.options.keepOneWrong")}
          </p>
        </Collapse>
      )}
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
                  <QuizshowStudioSlideRightMark
                    type="radio"
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

/** The answers of a quiz question, drawn as the stage draws them and typed on in place. */
export function QuizshowStudioSlideAnswers({
  question,
  language,
  onChange,
}: AnswersProps<QuizshowQuestionInput>) {
  switch (question.type) {
    case "multiple_choice":
    case "poll":
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
      return (
        <QuizshowStudioSlideTypedAnswer
          question={question}
          language={language}
          onChange={onChange}
        />
      );
    case "closest_number":
      return (
        <QuizshowStudioSlideClosestNumber
          question={question}
          language={language}
          onChange={onChange}
        />
      );
    case "prompt":
      return null;
  }
}
