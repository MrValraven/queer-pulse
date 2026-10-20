import { FiCheckCircle, FiMinusCircle, FiXCircle } from "react-icons/fi";
import { LuContrast } from "react-icons/lu";
import { Collapse } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowAnswerKeyView,
  QuizshowLanguage,
  QuizshowMyReveal,
  QuizshowPlayerState,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import { optionLetter, pickQuizshowText } from "../stage/quizshowText";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import styles from "./QuizshowPlayer.module.css";
import {
  entrantTotalOf,
  isPartialOrder,
  outcomeKeyOf,
} from "./quizshowRevealOutcome";

function OutcomeIcon({ myReveal }: { myReveal: QuizshowMyReveal }) {
  if (!myReveal.hasAnswered) return <FiMinusCircle aria-hidden />;
  // A half filled circle: some of the order landed in place.
  if (isPartialOrder(myReveal)) return <LuContrast aria-hidden />;
  if (myReveal.isCorrect === false) return <FiXCircle aria-hidden />;
  return <FiCheckCircle aria-hidden />;
}

interface CorrectTilesProps {
  question: QuizshowQuestionView;
  correct: QuizshowAnswerKeyView;
  state: QuizshowPlayerState;
  language: QuizshowLanguage;
}

function CorrectTiles({
  question,
  correct,
  state,
  language,
}: CorrectTilesProps) {
  const { t } = useTranslation();
  const myPayload = state.myAnswer?.payload;
  const choices: Array<{
    key: string;
    swatch: QuizshowSwatch;
    text: string;
    isCorrect: boolean;
    isMine: boolean;
  }> = [];
  if (correct.type === "multiple_choice") {
    (question.options ?? []).forEach((option, optionIndex) => {
      choices.push({
        key: option.id,
        swatch: answerSwatchFor(optionIndex),
        text: pickQuizshowText(option.text, language),
        isCorrect: correct.correctIndex === optionIndex,
        isMine:
          myPayload?.type === "multiple_choice" &&
          myPayload.optionIndex === optionIndex,
      });
    });
  } else if (correct.type === "true_false") {
    [true, false].forEach((isTrue) => {
      choices.push({
        key: String(isTrue),
        swatch: trueFalseSwatchFor(isTrue),
        text: t(
          isTrue
            ? "quizshow:questions.trueFalse.true"
            : "quizshow:questions.trueFalse.false",
        ),
        isCorrect: correct.isTrue === isTrue,
        isMine: myPayload?.type === "true_false" && myPayload.isTrue === isTrue,
      });
    });
  }
  return (
    <ul className={styles.tiles}>
      {choices.map((choice, choiceIndex) => {
        const letter = optionLetter(choiceIndex);
        const answerLabel = t("quizshow:stage.answerLabel", {
          letter,
          shape: t(choice.swatch.labelKey),
          text: choice.text,
        });
        let ariaLabel = answerLabel;
        if (choice.isCorrect) {
          ariaLabel = `${t("quizshow:stage.correctAnswer")}, ${answerLabel}`;
        } else if (choice.isMine) {
          ariaLabel = `${answerLabel}. ${t("quizshow:player.wrong")}`;
        }
        let tileState: "correct" | "selected" | "dimmed" = "dimmed";
        if (choice.isCorrect) tileState = "correct";
        else if (choice.isMine) tileState = "selected";
        return (
          <li key={choice.key}>
            <QuizshowAnswerTile
              colorKey={choice.swatch.colorKey}
              letter={letter}
              text={choice.text}
              size="phone"
              state={tileState}
              ariaLabel={ariaLabel}
            />
          </li>
        );
      })}
    </ul>
  );
}

function correctLineOf(
  correct: QuizshowAnswerKeyView,
  formatNumber: (value: number) => string,
  question: QuizshowQuestionView,
  language: QuizshowLanguage,
): string | null {
  if (correct.type === "type_answer") {
    return pickQuizshowText(correct.text, language);
  }
  if (correct.type === "closest_number") return formatNumber(correct.value);
  if (correct.type === "order") {
    const textById = new Map(
      (question.options ?? []).map((option) => [
        option.id,
        pickQuizshowText(option.text, language),
      ]),
    );
    return correct.orderedIds.map((id) => textById.get(id) ?? "").join(", ");
  }
  return null;
}

/** Facts that come from the player's own reveal frame. */
function RevealFacts({ state }: { state: QuizshowPlayerState }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { myReveal, question } = state;
  if (myReveal === null) return null;
  return (
    <ul className={styles.facts}>
      {myReveal.correctPositions !== null && question?.options && (
        <li className={styles.fact}>
          {t("quizshow:player.partial", {
            count: myReveal.correctPositions,
            total: question.options.length,
          })}
        </li>
      )}
      <li className={`${styles.fact} ${styles.factStrong}`}>
        {t("quizshow:player.pointsEarned", {
          points: format.number(myReveal.pointsAwarded),
        })}
      </li>
      {myReveal.isJokerActive && myReveal.pointsAwarded > 0 && (
        <li className={styles.fact}>{t("quizshow:player.jokerDoubled")}</li>
      )}
      {myReveal.streak > 1 && (
        <li className={styles.fact}>
          {t("quizshow:player.streak", { count: myReveal.streak })}
        </li>
      )}
      <li className={styles.fact}>
        {t(
          state.playMode === "teams"
            ? "quizshow:player.teamPlace"
            : "quizshow:player.place",
          { place: myReveal.rank, total: entrantTotalOf(state) },
        )}
      </li>
    </ul>
  );
}

/** The player's own reveal: the correct answer as soon as the reveal frame is in, then right or
 *  wrong in words, points, streak and place once the player's own frame lands. */
export function QuizshowPlayerReveal({
  state,
}: {
  state: QuizshowPlayerState;
}) {
  const { t, language } = useTranslation();
  const format = useFormat();
  const { myReveal, reveal, question } = state;
  const correct = reveal?.correct ?? null;
  const isWaiting = reveal === null && myReveal === null;
  const outcomeKey = myReveal === null ? null : outcomeKeyOf(myReveal);
  const correctLine =
    correct !== null && question !== null
      ? correctLineOf(correct, format.number, question, language)
      : null;
  return (
    <div className={styles.screenBody}>
      <Collapse isOpen={isWaiting}>
        <p className={styles.note}>
          {t(
            state.isEligibleForQuestion
              ? "quizshow:player.getReady"
              : "quizshow:player.waitNextQuestion",
          )}
        </p>
      </Collapse>
      <Collapse isOpen={myReveal !== null && outcomeKey !== null}>
        {myReveal !== null && outcomeKey !== null && (
          <p className={styles.outcome}>
            <OutcomeIcon myReveal={myReveal} />
            {t(outcomeKey)}
          </p>
        )}
      </Collapse>
      <Collapse isOpen={correct !== null && question !== null}>
        {correct !== null && question !== null && (
          <CorrectTiles
            question={question}
            correct={correct}
            state={state}
            language={language}
          />
        )}
      </Collapse>
      <Collapse isOpen={correctLine !== null}>
        <p className={styles.note}>
          {t("quizshow:stage.correctAnswer")}: {correctLine}
        </p>
      </Collapse>
      <Collapse isOpen={myReveal !== null}>
        <RevealFacts state={state} />
      </Collapse>
    </div>
  );
}
