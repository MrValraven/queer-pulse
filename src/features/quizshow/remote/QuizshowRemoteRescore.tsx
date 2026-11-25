import { useId, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowAnswerKeyView,
  QuizshowHostQuestionView,
  QuizshowHostState,
  QuizshowLanguage,
} from "../../../shared/contracts/quizshow";
import type { QuizshowCorrectAnswerChange } from "../realtime/quizshowFrames";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import {
  optionLetter,
  pickQuizshowTextWithLanguage,
} from "../stage/quizshowText";
import { effectiveAnswerKeyOf } from "./QuizshowRemoteAnswerKey";
import { QuizshowRemoteErrorLine } from "./QuizshowRemoteControls";
import { QuizshowRemoteTypedAnswers } from "./QuizshowRemoteTypedAnswers";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import remoteStyles from "./QuizshowRemote.module.css";
import styles from "./QuizshowRemoteRescore.module.css";

/** One option the host can mark right or wrong. */
interface KeyChoice {
  id: string;
  letter: string;
  text: string;
  /** The language an option's words are in; undefined for app copy (True, False). */
  textLanguage: QuizshowLanguage | undefined;
  isMarked: boolean;
  /** Marking it would leave no wrong option (C6.4 rule 3). */
  isBlocked: boolean;
}

/** The key as the change command carries it; null for a question it cannot change. */
function changeOfKey(
  answerKey: QuizshowAnswerKeyView | null,
): QuizshowCorrectAnswerChange | null {
  if (answerKey?.type === "multiple_choice") {
    const correctIndexes = [...answerKey.correctIndexes].sort((a, b) => a - b);
    return { type: "multiple_choice", correctIndexes };
  }
  if (answerKey?.type === "true_false") {
    return { type: "true_false", isTrue: answerKey.isTrue };
  }
  return null;
}

function isSameChange(
  first: QuizshowCorrectAnswerChange,
  second: QuizshowCorrectAnswerChange,
): boolean {
  if (first.type === "true_false" && second.type === "true_false") {
    return first.isTrue === second.isTrue;
  }
  if (first.type === "multiple_choice" && second.type === "multiple_choice") {
    return first.correctIndexes.join(",") === second.correctIndexes.join(",");
  }
  return false;
}

/** The marked set after a tap on `choiceIndex`; the same set when the tap is refused. */
function toggledChange(
  change: QuizshowCorrectAnswerChange,
  choiceIndex: number,
  optionCount: number,
): QuizshowCorrectAnswerChange {
  if (change.type === "true_false") {
    return { type: "true_false", isTrue: choiceIndex === 0 };
  }
  const { correctIndexes } = change;
  if (correctIndexes.includes(choiceIndex)) {
    const remaining = correctIndexes.filter((index) => index !== choiceIndex);
    return { type: "multiple_choice", correctIndexes: remaining };
  }
  if (correctIndexes.length >= optionCount - 1) return change;
  const marked = [...correctIndexes, choiceIndex].sort((a, b) => a - b);
  return { type: "multiple_choice", correctIndexes: marked };
}

function choicesOf(
  change: QuizshowCorrectAnswerChange,
  question: QuizshowHostQuestionView,
  language: QuizshowLanguage,
  trueFalseLabels: readonly [string, string],
): KeyChoice[] {
  if (change.type === "true_false") {
    return [true, false].map((isTrue, choiceIndex) => ({
      id: String(isTrue),
      letter: optionLetter(choiceIndex),
      text: trueFalseLabels[choiceIndex] ?? "",
      textLanguage: undefined,
      isMarked: change.isTrue === isTrue,
      isBlocked: false,
    }));
  }
  const options = question.options ?? [];
  const isAtLimit = change.correctIndexes.length >= options.length - 1;
  return options.map((option, optionIndex) => {
    const picked = pickQuizshowTextWithLanguage(option.text, language);
    const isMarked = change.correctIndexes.includes(optionIndex);
    return {
      id: option.id,
      letter: optionLetter(optionIndex),
      text: picked.text,
      textLanguage: picked.language,
      isMarked,
      isBlocked: !isMarked && isAtLimit,
    };
  });
}

/**
 * Multiple choice and true or false: mark the right options and save. It
 * mounts again whenever the effective key changes, so it always starts from
 * the key the reveal shows.
 */
function ChangeKeyForm({
  controller,
  question,
  phaseId,
  savedChange,
}: {
  controller: QuizshowSessionController;
  question: QuizshowHostQuestionView;
  phaseId: string;
  savedChange: QuizshowCorrectAnswerChange;
}) {
  const { t, language } = useTranslation();
  const titleId = useId();
  const limitHintId = useId();
  const nothingMarkedHintId = useId();
  const [change, setChange] = useState(savedChange);
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const isSaveBusy = isPending("host:changeCorrectAnswer");
  const optionCount = question.options?.length ?? 2;
  const choices = choicesOf(change, question, language, [
    t("quizshow:questions.trueFalse.true"),
    t("quizshow:questions.trueFalse.false"),
  ]);
  const isNothingMarked =
    change.type === "multiple_choice" && change.correctIndexes.length === 0;
  const isAtLimit = choices.some((choice) => choice.isBlocked);
  const isUnchanged = isSameChange(change, savedChange);
  const isSaveBlocked = isSaveBusy || isNothingMarked || isUnchanged;
  // The label counts what it saves: one right answer, or several. Nothing marked still reads as one.
  const markedCount =
    change.type === "multiple_choice"
      ? Math.max(1, change.correctIndexes.length)
      : 1;

  return (
    <div className={styles.subsection} role="group" aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.subTitle}>
        {t("quizshow:remote.rescore.changeTitle")}
      </h3>
      <div className={styles.choices}>
        {choices.map((choice, choiceIndex) => (
          <Button
            key={choice.id}
            variant="stage-ghost"
            size="md"
            className={styles.choice}
            aria-pressed={choice.isMarked}
            aria-disabled={choice.isBlocked}
            aria-describedby={choice.isBlocked ? limitHintId : undefined}
            onClick={() => {
              if (choice.isBlocked) return;
              setChange((current) =>
                toggledChange(current, choiceIndex, optionCount),
              );
            }}
          >
            <span className={styles.choiceLetter}>{choice.letter}</span>
            <span className={styles.choiceText} lang={choice.textLanguage}>
              {choice.text}
            </span>
            <span className={styles.choiceMark} aria-hidden="true">
              {choice.isMarked && <FiCheck fill="none" />}
            </span>
          </Button>
        ))}
      </div>
      <Collapse isOpen={isAtLimit}>
        <p id={limitHintId} className={remoteStyles.hint}>
          {t("quizshow:errors.every_option_correct")}
        </p>
      </Collapse>
      <Collapse isOpen={isNothingMarked}>
        <p id={nothingMarkedHintId} className={remoteStyles.hint}>
          {t("quizshow:problems.correct_option_missing")}
        </p>
      </Collapse>
      <div className={styles.actions}>
        <Button
          variant="stage"
          size="md"
          aria-disabled={isSaveBlocked}
          aria-describedby={isNothingMarked ? nothingMarkedHintId : undefined}
          onClick={() => {
            if (isSaveBlocked) return;
            void run("host:changeCorrectAnswer", {
              phaseId,
              questionId: question.questionId,
              answer: change,
            });
          }}
        >
          {t("quizshow:remote.rescore.saveKey", { count: markedCount })}
        </Button>
      </div>
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
    </div>
  );
}

/**
 * "Fix answers" (item 5) in `reveal` and `scores` of a quiz-round question:
 * accept typed spellings, or change the right option. The console mounts it
 * only for a typed, multiple choice or true or false question of a quiz round,
 * so party rounds and polls never show it.
 */
export function QuizshowRemoteRescore({
  controller,
  session,
}: {
  controller: QuizshowSessionController;
  session: QuizshowHostState;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const { question, reveal, cursor } = session;
  if (question === null) return null;
  // The reveal carries the key after a correction; the question view keeps the first one.
  const savedChange = changeOfKey(effectiveAnswerKeyOf(question, reveal));
  const keySignature =
    savedChange === null ? "none" : JSON.stringify(savedChange);

  return (
    <section className={remoteStyles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={remoteStyles.sectionTitle}>
        {t("quizshow:remote.rescore.title")}
      </h2>
      {question.type === "type_answer" && (
        <QuizshowRemoteTypedAnswers
          controller={controller}
          typedAnswers={session.typedAnswers}
          phaseId={cursor.phaseId}
          questionId={question.questionId}
        />
      )}
      {savedChange !== null && (
        <ChangeKeyForm
          key={`${question.questionId}:${keySignature}`}
          controller={controller}
          question={question}
          phaseId={cursor.phaseId}
          savedChange={savedChange}
        />
      )}
    </section>
  );
}
