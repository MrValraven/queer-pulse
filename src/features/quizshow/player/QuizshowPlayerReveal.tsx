import { FiCheck, FiMinus, FiX } from "react-icons/fi";
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
import {
  optionLetter,
  pickQuizshowText,
  quizshowAnswerNumberFormatter,
} from "../stage/quizshowText";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import styles from "./QuizshowPlayer.module.css";
import {
  QuizshowPointsLine,
  QuizshowRevealWash,
  type QuizshowRevealTone,
} from "./QuizshowPhoneResult";
import {
  entrantTotalOf,
  isPartialOrder,
  outcomeKeyOf,
} from "./quizshowRevealOutcome";

function OutcomeIcon({ myReveal }: { myReveal: QuizshowMyReveal }) {
  if (!myReveal.hasAnswered) return <FiMinus aria-hidden fill="none" />;
  // A half filled circle: some of the order landed in place.
  if (isPartialOrder(myReveal)) return <LuContrast aria-hidden />;
  if (myReveal.isCorrect === false) return <FiX aria-hidden fill="none" />;
  return <FiCheck aria-hidden fill="none" />;
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
    <ul className={styles.tiles} data-count={choices.length}>
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
        // The right answer is the hero; the player's own pick steps back to an outline and a tag.
        const tileState = choice.isCorrect ? "correct" : "dimmed";
        return (
          <li
            key={choice.key}
            className={styles.tileSlot}
            data-mine={choice.isMine ? "true" : undefined}
          >
            {choice.isMine && (
              <span className={styles.mineTag} aria-hidden="true">
                {t("quizshow:player.ownAnswer")}
              </span>
            )}
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

/** The tone of the wash: right, wrong (some in place counts as wrong), or none without an answer. */
function revealToneOf(
  myReveal: QuizshowMyReveal | null,
): QuizshowRevealTone | null {
  if (myReveal === null || !myReveal.hasAnswered) return null;
  if (myReveal.isCorrect === true) return "right";
  return myReveal.isCorrect === false ? "wrong" : null;
}

/** Points rolling up, then streak, joker and place as glass pills. */
function RevealFacts({ state }: { state: QuizshowPlayerState }) {
  const { t } = useTranslation();
  const { myReveal, question } = state;
  if (myReveal === null) return null;
  return (
    <>
      <QuizshowPointsLine points={myReveal.pointsAwarded} />
      <ul className={styles.facts}>
        {myReveal.correctPositions !== null && question?.options && (
          <li className={styles.fact}>
            {t("quizshow:player.partial", {
              count: myReveal.correctPositions,
              total: question.options.length,
            })}
          </li>
        )}
        {myReveal.isJokerActive && myReveal.pointsAwarded > 0 && (
          <li className={styles.fact}>{t("quizshow:player.jokerDoubled")}</li>
        )}
        {myReveal.streak > 1 && (
          <li className={styles.fact}>
            {t("quizshow:player.streak", { count: myReveal.streak })}
          </li>
        )}
        <li className={`${styles.fact} ${styles.placeFact}`}>
          {t(
            state.playMode === "teams"
              ? "quizshow:player.teamPlace"
              : "quizshow:player.place",
            { place: myReveal.rank, total: entrantTotalOf(state) },
          )}
        </li>
      </ul>
    </>
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
      ? correctLineOf(
          correct,
          quizshowAnswerNumberFormatter(format.number),
          question,
          language,
        )
      : null;
  const tone = revealToneOf(myReveal);
  return (
    <div className={styles.screenBody}>
      <QuizshowRevealWash tone={tone} />
      <Collapse isOpen={isWaiting}>
        <p className={styles.readyPill}>
          {t(
            state.isEligibleForQuestion
              ? "quizshow:player.getReady"
              : "quizshow:player.waitNextQuestion",
          )}
        </p>
      </Collapse>
      <Collapse isOpen={myReveal !== null && outcomeKey !== null}>
        {myReveal !== null && outcomeKey !== null && (
          <div className={styles.result}>
            <span
              className={styles.outcomeMark}
              data-tone={tone ?? undefined}
              aria-hidden="true"
            >
              <OutcomeIcon myReveal={myReveal} />
            </span>
            <p className={styles.outcome}>{t(outcomeKey)}</p>
            <RevealFacts state={state} />
          </div>
        )}
      </Collapse>
      <div className={styles.answers}>
        <Collapse isOpen={correct !== null && question !== null}>
          <p className={styles.correctLabel}>
            {t("quizshow:stage.correctAnswer")}
          </p>
        </Collapse>
        <Collapse isOpen={correctLine !== null}>
          <p className={styles.correctCard}>{correctLine}</p>
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
      </div>
    </div>
  );
}
