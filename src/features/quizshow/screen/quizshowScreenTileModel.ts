import {
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowClosestTolerance,
  type QuizshowCursor,
  type QuizshowLanguage,
  type QuizshowQuestionView,
  type QuizshowReveal,
  type QuizshowTeamColorKey,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_ANSWER_SWATCH_KEYS,
  trueFalseSwatchFor,
} from "../quizshowSwatches";
import { isQuizRoundKind } from "../quizshowWheel";
import type { QuizshowAnswerShare } from "../stage/QuizshowAnswerTile";
import { optionLetter, pickQuizshowText } from "../stage/quizshowText";

/** Multiple choice keeps the four answer shapes; order adds two more for its fifth and sixth items. */
const ORDER_SWATCH_KEYS: readonly QuizshowTeamColorKey[] = [
  ...QUIZSHOW_ANSWER_SWATCH_KEYS,
  ...QUIZSHOW_TEAM_COLOR_KEYS.filter(
    (colorKey) =>
      !(QUIZSHOW_ANSWER_SWATCH_KEYS as readonly string[]).includes(colorKey),
  ),
];

type TileState = "idle" | "correct" | "dimmed";

export interface ScreenTile {
  key: string;
  colorKey: QuizshowTeamColorKey;
  letter: string;
  /** The answer in the screen's lead language: the tile's words and its accessible name. */
  text: string;
  /** The option's own two-language text, so a renderer can show both lines
   *  under screen language Both (C6.26); null for True and False, which are UI copy. */
  optionText: QuizshowText | null;
  state: TileState;
  /** The vote share at reveal, multiple choice and true or false only. */
  share: QuizshowAnswerShare | null;
}

/** Each option's count at reveal, in tile order, for the two types whose share sits in the tiles. */
function shareCountsOf(reveal: QuizshowReveal | null): number[] | null {
  const distribution = reveal?.distribution ?? null;
  if (distribution?.kind === "options") return distribution.counts;
  if (distribution?.kind === "true_false")
    return [distribution.trueCount, distribution.falseCount];
  return null;
}

function shareAt(
  reveal: QuizshowReveal | null,
  optionIndex: number,
): QuizshowAnswerShare | null {
  const counts = shareCountsOf(reveal);
  // Nobody answered (a preview with no players): no share to draw.
  if (reveal === null || counts === null || reveal.answeredCount === 0)
    return null;
  const count = counts[optionIndex] ?? 0;
  const percent =
    reveal.answeredCount > 0
      ? Math.round((count / reveal.answeredCount) * 100)
      : 0;
  return { count, percent };
}

export function tilesFor(
  question: QuizshowQuestionView,
  reveal: QuizshowReveal | null,
  /** The screen's lead language (`primaryLanguageOf`); `optionText` keeps both. */
  language: QuizshowLanguage,
  trueFalseTexts: { true: string; false: string },
): ScreenTile[] {
  const correct = reveal?.correct ?? null;
  const stateFor = (isCorrect: boolean): TileState => {
    if (correct === null) return "idle";
    return isCorrect ? "correct" : "dimmed";
  };
  if (question.type === "true_false") {
    return [true, false].map((isTrue, optionIndex) => ({
      key: String(isTrue),
      colorKey: trueFalseSwatchFor(isTrue).colorKey,
      letter: optionLetter(optionIndex),
      text: isTrue ? trueFalseTexts.true : trueFalseTexts.false,
      optionText: null,
      state: stateFor(
        correct?.type === "true_false" && correct.isTrue === isTrue,
      ),
      share: shareAt(reveal, optionIndex),
    }));
  }
  const options = question.options ?? [];
  const isOrder = question.type === "order";
  // Typed as ScreenTile, so `optionText` keeps its nullable type and the
  // order reveal's narrowing below matches the tile shape.
  const shownTiles = options.map((option, optionIndex): ScreenTile => ({
    key: option.id,
    colorKey: ORDER_SWATCH_KEYS[optionIndex] ?? "star",
    letter: optionLetter(optionIndex),
    text: pickQuizshowText(option.text, language),
    optionText: option.text,
    // Every index in the key is right (C6.22); a poll has no key, so its tiles stay idle.
    state: stateFor(
      correct?.type === "multiple_choice" &&
        correct.correctIndexes.includes(optionIndex),
    ),
    share: isOrder ? null : shareAt(reveal, optionIndex),
  }));
  if (!isOrder) return shownTiles;
  // Order: tiles keep their letters; the reveal lists them in the right order.
  const orderedIds = correct?.type === "order" ? correct.orderedIds : null;
  if (orderedIds === null) return shownTiles;
  return orderedIds
    .map((optionId) => shownTiles.find((tile) => tile.key === optionId))
    .filter((tile): tile is ScreenTile => tile !== undefined)
    .map((tile): ScreenTile => ({ ...tile, state: "idle" }));
}

/**
 * "7 of 12 got it", from the counts the reveal already carries: the right
 * options' counts, the typed answers marked right, the orders fully right.
 * A closest-number question has no single right guess and a poll has no
 * right answer, so neither shows one.
 */
export function gotItOf(
  reveal: QuizshowReveal | null,
): { count: number; total: number } | null {
  if (reveal === null || reveal.correct === null || reveal.eligibleCount === 0)
    return null;
  const { correct, distribution } = reveal;
  let count: number | null = null;
  if (distribution.kind === "options" && correct.type === "multiple_choice")
    count = correct.correctIndexes.reduce(
      (sum, optionIndex) => sum + (distribution.counts[optionIndex] ?? 0),
      0,
    );
  else if (distribution.kind === "true_false" && correct.type === "true_false")
    count = correct.isTrue ? distribution.trueCount : distribution.falseCount;
  else if (distribution.kind === "typed") count = distribution.correctCount;
  else if (distribution.kind === "order") count = distribution.exactCount;
  return count === null ? null : { count, total: reveal.eligibleCount };
}

/** A catalog key with its values, translated by the caller in the screen language. */
export interface ScreenCopy {
  key: string;
  values: Record<string, string>;
}

/**
 * The closest-number half-points rule (C6.1): "Within 10 years scores half",
 * "Within 10 scores half" when the unit is blank, "Within 10% scores half";
 * null for exact, which shows nothing. `formattedAmount` is the margin as the
 * screen prints numbers; `unit` the number unit in the screen's lead language.
 */
export function closestBandCopyOf(
  tolerance: QuizshowClosestTolerance,
  formattedAmount: string,
  unit: string,
): ScreenCopy | null {
  if (tolerance.mode === "exact") return null;
  if (tolerance.mode === "percent")
    return {
      key: "quizshow:stage.closestBand.percent",
      values: { amount: formattedAmount },
    };
  const trimmedUnit = unit.trim();
  return trimmedUnit === ""
    ? {
        key: "quizshow:stage.closestBand.absoluteNoUnit",
        values: { amount: formattedAmount },
      }
    : {
        key: "quizshow:stage.closestBand.absolute",
        values: { amount: formattedAmount, unit: trimmedUnit },
      };
}

/**
 * A number answer with the question's unit after it in each language
 * ("1969 years" / "1969 anos"); a side with a blank unit borrows the other
 * side's, and a unit blank in both leaves the number alone.
 */
export function numberWithUnit(
  formattedValue: string,
  unit: QuizshowText,
): QuizshowText {
  const englishUnit = unit.en.trim() || unit.pt.trim();
  const portugueseUnit = unit.pt.trim() || unit.en.trim();
  return {
    en:
      englishUnit === "" ? formattedValue : `${formattedValue} ${englishUnit}`,
    pt:
      portugueseUnit === ""
        ? formattedValue
        : `${formattedValue} ${portugueseUnit}`,
  };
}

/** The slow picture reveal's window and state (C6.23). */
export interface ScreenSlowReveal {
  startsAt: number;
  endsAt: number;
  isCleared: boolean;
}

/**
 * The slow reveal of a quiz question's picture (C6.23): it runs from the
 * start of `read` to the `open` deadline on the server clock and is clear
 * from `reveal` on. In `read` the window ends one answer limit after the read
 * deadline; in `open` it started one read length (and any talk time, C6.20)
 * before the phase did. While paused the deadline is null, so the window is
 * measured from the phase start instead. Null when the picture shows clear
 * at once: an instant picture, a party question, or no phase start yet.
 */
export function slowRevealOf(
  question: QuizshowQuestionView,
  cursor: QuizshowCursor,
  talkMs: number,
): ScreenSlowReveal | null {
  if (question.mediaUrl === null || question.mediaReveal !== "slow")
    return null;
  // A wheel question is a quiz question; every other round kind is a party round.
  const isPartyQuestion =
    question.roundKind !== "wheel" && !isQuizRoundKind(question.roundKind);
  if (isPartyQuestion) return null;
  if (cursor.phase === "reveal")
    return { startsAt: 0, endsAt: 0, isCleared: true };
  const phaseStartedAt = cursor.phaseStartedAt;
  if (phaseStartedAt === null) return null;
  const limitMs = question.timeLimitSeconds * 1000;
  if (cursor.phase === "read") {
    const readDeadline =
      cursor.deadline ?? phaseStartedAt + question.readMs + talkMs;
    return {
      startsAt: phaseStartedAt,
      endsAt: readDeadline + limitMs,
      isCleared: false,
    };
  }
  if (cursor.phase === "open") {
    return {
      startsAt: phaseStartedAt - question.readMs - talkMs,
      endsAt: cursor.deadline ?? phaseStartedAt + limitMs,
      isCleared: false,
    };
  }
  return null;
}
