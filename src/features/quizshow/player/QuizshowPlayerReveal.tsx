import { FiArrowDown, FiArrowUp, FiCheck, FiMinus, FiX } from "react-icons/fi";
import { LuContrast } from "react-icons/lu";
import type { ReactNode } from "react";
import { Collapse } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowAnswerKeyView,
  QuizshowLanguage,
  QuizshowMyReveal,
  QuizshowPlayerState,
  QuizshowQuestionView,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import type { QuizshowOwnRanks } from "../realtime/quizshowClientStore";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { quizshowPlaceOf } from "../stage/quizshowOrdinal";
import {
  optionLetter,
  pickQuizshowText,
  pickQuizshowTextWithLanguage,
  quizshowAnswerNumberFormatter,
} from "../stage/quizshowText";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import styles from "./QuizshowPlayer.module.css";
import { QuizshowPhaseHeading } from "./QuizshowPhaseHeading";
import {
  QuizshowPointsLine,
  QuizshowRevealWash,
  type QuizshowRevealTone,
} from "./QuizshowPhoneResult";
import {
  gapAheadOf,
  phoneScoresOf,
  placesMovedOf,
} from "./quizshowPhoneScores";
import {
  entrantTotalOf,
  isPartialOrder,
  outcomeKeyOf,
} from "./quizshowRevealOutcome";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";

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

interface RevealChoice {
  key: string;
  swatch: QuizshowSwatch;
  text: string;
  /** Set when the option text fell back to the other language. */
  textLanguage?: QuizshowLanguage;
  isCorrect: boolean;
  isMine: boolean;
}

/** The choices of a multiple choice or true or false reveal; every correct option is marked (C6.22). */
function revealChoicesOf(
  question: QuizshowQuestionView,
  correct: QuizshowAnswerKeyView,
  state: QuizshowPlayerState,
  language: QuizshowLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): RevealChoice[] {
  const myPayload = state.myAnswer?.payload;
  if (correct.type === "multiple_choice") {
    return (question.options ?? []).map((option, optionIndex) => {
      const picked = pickQuizshowTextWithLanguage(option.text, language);
      return {
        key: option.id,
        swatch: answerSwatchFor(optionIndex),
        text: picked.text,
        textLanguage:
          picked.language === language ? undefined : picked.language,
        isCorrect: correct.correctIndexes.includes(optionIndex),
        isMine:
          myPayload?.type === "multiple_choice" &&
          myPayload.optionIndex === optionIndex,
      };
    });
  }
  if (correct.type === "true_false") {
    return [true, false].map((isTrue) => ({
      key: String(isTrue),
      swatch: trueFalseSwatchFor(isTrue),
      text: t(
        isTrue
          ? "quizshow:questions.trueFalse.true"
          : "quizshow:questions.trueFalse.false",
      ),
      isCorrect: correct.isTrue === isTrue,
      isMine: myPayload?.type === "true_false" && myPayload.isTrue === isTrue,
    }));
  }
  return [];
}

function CorrectTiles({
  question,
  correct,
  state,
  language,
}: CorrectTilesProps) {
  const { t } = useTranslation();
  const choices = revealChoicesOf(question, correct, state, language, t);
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
        // The right answers are the hero; the player's own pick steps back to an outline and a tag.
        const tileState = choice.isCorrect ? "correct" : "dimmed";
        return (
          <li
            key={choice.key}
            className={styles.tileSlot}
            lang={choice.textLanguage}
            data-mine={choice.isMine ? "true" : undefined}
          >
            {choice.isMine && (
              <span className={styles.mineTag} aria-hidden="true">
                {!choice.isCorrect && <FiX aria-hidden fill="none" />}
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

/** A poll reveal (C6.22): each option's share of everyone who answered and the player's own
 *  pick, with no right or wrong. */
function PollTiles({
  question,
  counts,
  answeredCount,
  state,
  language,
}: {
  question: QuizshowQuestionView;
  counts: readonly number[];
  /** `reveal.answeredCount`, the TV's divisor; 0 draws no share. */
  answeredCount: number;
  state: QuizshowPlayerState;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const options = question.options ?? [];
  const myPayload = state.myAnswer?.payload;
  return (
    <ul
      className={`${styles.tiles} ${styles.pollTiles}`}
      data-count={options.length}
    >
      {options.map((option, optionIndex) => {
        const picked = pickQuizshowTextWithLanguage(option.text, language);
        const count = counts[optionIndex] ?? 0;
        const share =
          answeredCount > 0
            ? { count, percent: Math.round((count / answeredCount) * 100) }
            : null;
        const isMine =
          myPayload?.type === "poll" && myPayload.optionIndex === optionIndex;
        const swatch = answerSwatchFor(optionIndex);
        const letter = optionLetter(optionIndex);
        const labelParts = [
          t("quizshow:stage.answerLabel", {
            letter,
            shape: t(swatch.labelKey),
            text: picked.text,
          }),
          share === null
            ? ""
            : t("quizshow:player.pollShare", { percent: share.percent }),
          isMine ? t("quizshow:player.pollYourPick") : "",
        ];
        return (
          <li
            key={option.id}
            className={styles.tileSlot}
            lang={picked.language === language ? undefined : picked.language}
            data-mine={isMine ? "true" : undefined}
          >
            {isMine && (
              <span className={styles.mineTag} aria-hidden="true">
                {t("quizshow:player.pollYourPick")}
              </span>
            )}
            <QuizshowAnswerTile
              colorKey={swatch.colorKey}
              letter={letter}
              text={picked.text}
              size="phone"
              state="dimmed"
              share={share}
              ariaLabel={labelParts.filter(Boolean).join(". ")}
            />
          </li>
        );
      })}
    </ul>
  );
}

/** A unit after a number answer, in the language its words are in (C6.1). */
function UnitText({
  unit,
  language,
}: {
  unit: QuizshowText;
  language: QuizshowLanguage;
}) {
  const picked = pickQuizshowTextWithLanguage(unit, language);
  if (picked.text.trim() === "") return null;
  return (
    <>
      {" "}
      <span lang={picked.language}>{picked.text.trim()}</span>
    </>
  );
}

/** Answer kinds the reveal writes out as a line of text. */
function hasCorrectLine(correct: QuizshowAnswerKeyView | null): boolean {
  return (
    correct !== null &&
    (correct.type === "type_answer" ||
      correct.type === "closest_number" ||
      correct.type === "order")
  );
}

/** The correct answer as a line, each quiz text in its own `lang` (item 41). */
function CorrectLine({
  correct,
  question,
  language,
}: {
  correct: QuizshowAnswerKeyView;
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
}): ReactNode {
  const format = useFormat();
  if (correct.type === "type_answer") {
    return <QuizshowStageText text={correct.text} language={language} />;
  }
  if (correct.type === "closest_number") {
    const formatAnswer = preciseAnswerFormatterOf(format.number);
    return (
      <>
        {formatAnswer(correct.value)}
        <UnitText unit={question.numberUnit} language={language} />
      </>
    );
  }
  if (correct.type === "order") {
    const textById = new Map(
      (question.options ?? []).map((option) => [option.id, option.text]),
    );
    return correct.orderedIds.map((id, orderIndex) => {
      const text = textById.get(id);
      return (
        <span key={id}>
          {orderIndex > 0 && ", "}
          {text === undefined ? null : (
            <QuizshowStageText text={text} language={language} />
          )}
        </span>
      );
    });
  }
  return null;
}

/** The answer number format with enough fraction digits that a small value
 *  never reads as 0. */
function preciseAnswerFormatterOf(
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string,
): (value: number) => string {
  return quizshowAnswerNumberFormatter((value, options) =>
    formatNumber(value, { maximumFractionDigits: 8, ...options }),
  );
}

/** Float noise off a band edge, so 0.3 minus 0.1 reads 0.2. */
function tidyNumber(value: number): number {
  return Number(value.toPrecision(12));
}

/** "3 to 5 kilometres scores half" under a closest-number answer: the range of
 *  guesses that take half, from the same band the scoring uses (C6.1). A range
 *  names no plural, so the unit stays as the quiz wrote it. Null for exact and
 *  every other kind. */
function closestBandLineOf(
  correct: QuizshowAnswerKeyView | null,
  question: QuizshowQuestionView | null,
  language: QuizshowLanguage,
  formatNumber: (value: number) => string,
  t: ReturnType<typeof useTranslation>["t"],
): string | null {
  if (correct?.type !== "closest_number" || question === null) return null;
  const { tolerance, value } = correct;
  if (tolerance.mode === "exact") return null;
  const halfWidth =
    tolerance.mode === "percent"
      ? (Math.abs(value) * tolerance.amount) / 100
      : tolerance.amount;
  const low = tidyNumber(value - halfWidth);
  const high = tidyNumber(value + halfWidth);
  // A band as narrow as one number has no range to name.
  if (low === high) return null;
  const range = { low: formatNumber(low), high: formatNumber(high) };
  const unit = pickQuizshowText(question.numberUnit, language).trim();
  if (unit === "") {
    return t("quizshow:player.closestBand.rangeNoUnit", range);
  }
  return t("quizshow:player.closestBand.range", { ...range, unit });
}

/** "Yours: 2 kilometres": the player's own number under the correct one; null
 *  without a closest-number answer from this player. */
function closestYoursLineOf(
  state: QuizshowPlayerState,
  language: QuizshowLanguage,
  formatNumber: (value: number) => string,
  t: ReturnType<typeof useTranslation>["t"],
): string | null {
  const { question, reveal, myAnswer } = state;
  const payload = myAnswer?.payload;
  if (
    reveal?.correct?.type !== "closest_number" ||
    question === null ||
    payload?.type !== "closest_number"
  ) {
    return null;
  }
  const unit = pickQuizshowText(question.numberUnit, language).trim();
  const written = formatNumber(payload.value);
  return t("quizshow:player.closestYours", {
    value: unit === "" ? written : `${written} ${unit}`,
  });
}

/** The tone of the wash: right, wrong (some in place counts as wrong), or none without an answer. */
function revealToneOf(
  myReveal: QuizshowMyReveal | null,
): QuizshowRevealTone | null {
  if (myReveal === null || !myReveal.hasAnswered) return null;
  if (myReveal.isCorrect === true) return "right";
  return myReveal.isCorrect === false ? "wrong" : null;
}

/** "You're 3rd of 12" / "Your team is 3rd of 12" (item 44), as plain text for a fact pill. */
export function QuizshowPlaceLine({
  state,
  rank,
  total,
}: {
  state: QuizshowPlayerState;
  rank: number;
  /** Everyone ranked, when a scores frame says it; the lobby's count otherwise. */
  total?: number;
}) {
  const { t, language } = useTranslation();
  return t(
    state.playMode === "teams"
      ? "quizshow:player.teamPlaceLine"
      : "quizshow:player.placeLine",
    {
      place: quizshowPlaceOf(rank, total ?? entrantTotalOf(state), language, t),
    },
  );
}

const NO_OWN_RANKS: QuizshowOwnRanks = { previous: null, current: null };

/** How the player's place moved and how far the entrant above is (item 14). */
interface QuizshowStanding {
  /** Positive = places gained, negative = places lost; null without a move. */
  placesMoved: number | null;
  /** The entrant ranked just above, in the top 10 and not first; null otherwise. */
  gapAhead: { points: number; name: string } | null;
}

/**
 * The standing at `rank`: the move counts only when the store's current own
 * rank is this rank, and the gap reads the scores of the current phase (the
 * store clears an older phase's scores, so a reveal has no gap). No rank yet
 * says nothing.
 */
function standingOf(
  state: QuizshowPlayerState,
  ownRanks: QuizshowOwnRanks,
  rank: number | null,
  ownScore: number,
): QuizshowStanding {
  if (rank === null) return { placesMoved: null, gapAhead: null };
  const ownEntrantId =
    state.playMode === "teams"
      ? (state.me?.teamId ?? null)
      : (state.me?.playerId ?? null);
  return {
    placesMoved: ownRanks.current === rank ? placesMovedOf(ownRanks) : null,
    gapAhead: gapAheadOf(phoneScoresOf(state), ownEntrantId, ownScore),
  };
}

/** "Up 2 places" and "120 points behind Alex" as fact pills (list items for a `.facts` list). */
function StandingItems({ standing }: { standing: QuizshowStanding }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { placesMoved, gapAhead } = standing;
  const isUp = placesMoved !== null && placesMoved > 0;
  return (
    <>
      {placesMoved !== null && (
        <li className={`${styles.fact} ${styles.moveFact}`}>
          {isUp ? (
            <FiArrowUp aria-hidden fill="none" />
          ) : (
            <FiArrowDown aria-hidden fill="none" />
          )}
          {t(isUp ? "quizshow:player.placesUp" : "quizshow:player.placesDown", {
            count: Math.abs(placesMoved),
          })}
        </li>
      )}
      {gapAhead !== null && (
        <li className={styles.fact}>
          {t("quizshow:player.pointsBehind", {
            points: format.number(gapAhead.points),
            name: gapAhead.name,
          })}
        </li>
      )}
    </>
  );
}

interface QuizshowStandingFactsProps {
  state: QuizshowPlayerState;
  /** The store's own ranks (`controller.state.ownRanks`). */
  ownRanks: QuizshowOwnRanks;
  /** The rank on show: `myReveal.rank` or `myScores.rank`; null before it lands. */
  rank: number | null;
  /** The entrant's score on show (the team's in teams play). */
  ownScore: number;
  /** "items": pills for a `.facts` list the caller draws; "list": a list of
   *  its own, folded away while there is nothing to say. */
  variant: "items" | "list";
}

/** The move and the gap (item 14), shared by the reveal and the scores. */
export function QuizshowStandingFacts({
  state,
  ownRanks,
  rank,
  ownScore,
  variant,
}: QuizshowStandingFactsProps) {
  const standing = standingOf(state, ownRanks, rank, ownScore);
  if (variant === "items") return <StandingItems standing={standing} />;
  const hasFacts = standing.placesMoved !== null || standing.gapAhead !== null;
  return (
    <Collapse isOpen={hasFacts}>
      <ul className={`${styles.facts} ${styles.standingFacts}`}>
        <StandingItems standing={standing} />
      </ul>
    </Collapse>
  );
}

/** Whether the question on show belongs to a warm-up round: the round card the
 *  question's round index names, the current one first. */
function isWarmUpReveal(state: QuizshowPlayerState): boolean {
  const { question, round, rounds } = state;
  if (question === null) return false;
  const card =
    round?.roundIndex === question.roundIndex
      ? round
      : rounds.find(
          (candidate) => candidate.roundIndex === question.roundIndex,
        );
  return card?.isWarmUp ?? false;
}

/** Points rolling up, then streak, joker, place and the move as glass pills. A
 *  warm-up scores nothing and ranks no one, so it says that in one line and
 *  leaves the points, place and standing out. */
function RevealFacts({
  state,
  ownRanks,
}: {
  state: QuizshowPlayerState;
  ownRanks: QuizshowOwnRanks;
}) {
  const { t } = useTranslation();
  const { myReveal, question } = state;
  if (myReveal === null) return null;
  if (isWarmUpReveal(state)) {
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
        <li className={styles.fact}>{t("quizshow:player.warmUpNoPoints")}</li>
      </ul>
    );
  }
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
          <QuizshowPlaceLine state={state} rank={myReveal.rank} />
        </li>
        <QuizshowStandingFacts
          state={state}
          ownRanks={ownRanks}
          rank={myReveal.rank}
          ownScore={myReveal.teamScore ?? myReveal.score}
          variant="items"
        />
      </ul>
    </>
  );
}

/** The question's note under the answer, once the reveal is in (C6.22). */
function RevealNote({
  note,
  language,
}: {
  note: QuizshowText | null;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={note !== null}>
      {note !== null && (
        <div className={styles.noteCard}>
          <p className={styles.correctLabel}>
            {t("quizshow:stage.revealNote")}
          </p>
          <QuizshowStageText
            as="p"
            className={styles.noteText}
            text={note}
            language={language}
          />
        </div>
      )}
    </Collapse>
  );
}

/** The player's own reveal: the correct answer as soon as the reveal frame is in, then right or
 *  wrong in words, points, streak and place once the player's own frame lands. A poll shows the
 *  shares of every option and the player's pick, with no right, wrong or points. */
export function QuizshowPlayerReveal({
  state,
  ownRanks = NO_OWN_RANKS,
}: {
  state: QuizshowPlayerState;
  /** The store's own ranks, for "Up 2 places" (item 14). */
  ownRanks?: QuizshowOwnRanks;
}) {
  const { t, language } = useTranslation();
  const format = useFormat();
  const { myReveal, reveal, question } = state;
  const correct = reveal?.correct ?? null;
  const isPoll = question?.type === "poll";
  const pollCounts =
    isPoll && reveal?.distribution.kind === "options"
      ? reveal.distribution.counts
      : null;
  const isWaiting = reveal === null && myReveal === null;
  const outcomeKey =
    myReveal === null || isPoll ? null : outcomeKeyOf(myReveal);
  const tone = isPoll ? null : revealToneOf(myReveal);
  const formatAnswer = preciseAnswerFormatterOf(format.number);
  const bandLine = closestBandLineOf(
    correct,
    question,
    language,
    formatAnswer,
    t,
  );
  const yoursLine = closestYoursLineOf(state, language, formatAnswer, t);
  const hasOutcomeHeading = myReveal !== null && outcomeKey !== null;
  // The outcome line is the heading and takes focus once the player's own result
  // lands; before that, and for a poll or a player with no result, a hidden
  // heading carries the phase's own announcement.
  const headingRef = useQuizshowHeadingFocus(
    `${state.cursor.phaseId}:${hasOutcomeHeading ? "result" : "pending"}`,
  );
  return (
    <div className={styles.screenBody}>
      {!hasOutcomeHeading && (
        <QuizshowPhaseHeading headingRef={headingRef} phase="reveal" />
      )}
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
      <Collapse isOpen={hasOutcomeHeading}>
        {myReveal !== null && outcomeKey !== null && (
          <div className={styles.result}>
            <span
              className={styles.outcomeMark}
              data-tone={tone ?? undefined}
              aria-hidden="true"
            >
              <OutcomeIcon myReveal={myReveal} />
            </span>
            <h1 ref={headingRef} tabIndex={-1} className={styles.outcome}>
              {t(outcomeKey)}
            </h1>
            <RevealFacts state={state} ownRanks={ownRanks} />
          </div>
        )}
      </Collapse>
      <div className={styles.answers}>
        <Collapse isOpen={reveal?.wasCorrected === true}>
          <p className={styles.bandLine}>
            {t("quizshow:player.hostCorrected")}
          </p>
        </Collapse>
        <Collapse isOpen={correct !== null && question !== null}>
          <p className={styles.correctLabel}>
            {t("quizshow:stage.correctAnswer")}
          </p>
        </Collapse>
        <Collapse isOpen={question !== null && hasCorrectLine(correct)}>
          {correct !== null && question !== null && (
            <p className={styles.correctCard}>
              <CorrectLine
                correct={correct}
                question={question}
                language={language}
              />
            </p>
          )}
        </Collapse>
        <Collapse isOpen={yoursLine !== null}>
          <p className={styles.bandLine}>{yoursLine ?? ""}</p>
        </Collapse>
        <Collapse isOpen={bandLine !== null}>
          <p className={styles.bandLine}>{bandLine ?? ""}</p>
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
        <Collapse isOpen={pollCounts !== null && question !== null}>
          {pollCounts !== null && question !== null && (
            <>
              <p className={styles.correctLabel}>
                {t("quizshow:stage.pollResults")}
              </p>
              <PollTiles
                question={question}
                counts={pollCounts}
                answeredCount={reveal?.answeredCount ?? 0}
                state={state}
                language={language}
              />
            </>
          )}
        </Collapse>
        <RevealNote note={reveal?.note ?? null} language={language} />
      </div>
    </div>
  );
}
