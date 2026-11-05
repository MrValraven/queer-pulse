import {
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowLanguage,
  type QuizshowQuestionView,
  type QuizshowReveal,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_ANSWER_SWATCH_KEYS,
  trueFalseSwatchFor,
} from "../quizshowSwatches";
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
  text: string;
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
      state: stateFor(
        correct?.type === "true_false" && correct.isTrue === isTrue,
      ),
      share: shareAt(reveal, optionIndex),
    }));
  }
  const options = question.options ?? [];
  const isOrder = question.type === "order";
  const shownTiles = options.map((option, optionIndex) => ({
    key: option.id,
    colorKey: ORDER_SWATCH_KEYS[optionIndex] ?? "star",
    letter: optionLetter(optionIndex),
    text: pickQuizshowText(option.text, language),
    state: stateFor(
      correct?.type === "multiple_choice" &&
        correct.correctIndex === optionIndex,
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
 * option's count, the typed answers marked right, the orders fully right.
 * A closest-number question has no single right guess, so it shows none.
 */
export function gotItOf(
  reveal: QuizshowReveal | null,
): { count: number; total: number } | null {
  if (reveal === null || reveal.correct === null || reveal.eligibleCount === 0)
    return null;
  const { correct, distribution } = reveal;
  let count: number | null = null;
  if (distribution.kind === "options" && correct.type === "multiple_choice")
    count = distribution.counts[correct.correctIndex] ?? 0;
  else if (distribution.kind === "true_false" && correct.type === "true_false")
    count = correct.isTrue ? distribution.trueCount : distribution.falseCount;
  else if (distribution.kind === "typed") count = distribution.correctCount;
  else if (distribution.kind === "order") count = distribution.exactCount;
  return count === null ? null : { count, total: reveal.eligibleCount };
}
