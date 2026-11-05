import type {
  QuizshowLanguage,
  QuizshowText,
} from "../../../shared/contracts/quizshow";

/** The text in the screen's language, or the other language when that one is blank. */
export function pickQuizshowText(
  text: QuizshowText,
  language: QuizshowLanguage,
): string {
  const otherLanguage: QuizshowLanguage = language === "en" ? "pt" : "en";
  return text[language].trim() !== "" ? text[language] : text[otherLanguage];
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

/** "A" to "F" for an option index; the letter every answer carries beside its shape. */
export function optionLetter(optionIndex: number): string {
  return OPTION_LETTERS[optionIndex] ?? String(optionIndex + 1);
}

/** Where a stage piece is drawn: the big screen, a player's phone, or a small preview. */
export type QuizshowStageSize = "screen" | "phone" | "preview";

/** Below this a number answer prints bare, so a year reads 1956 as people write it. */
const ANSWER_GROUPING_FROM = 10_000;

/**
 * Formats a number answer (a closest-number key or guess) the way people
 * write it: no thousands separator under 10,000, so a year stays "1956",
 * and the locale's grouping from 10,000 up. The TV, the reveal counts and
 * the phone all read a number answer through it.
 */
export function quizshowAnswerNumberFormatter(
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string,
): (value: number) => string {
  return (value) =>
    Math.abs(value) >= ANSWER_GROUPING_FROM
      ? formatNumber(value)
      : formatNumber(value, { useGrouping: false });
}
