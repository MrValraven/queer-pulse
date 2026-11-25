import type {
  QuizshowLanguage,
  QuizshowScreenLanguage,
  QuizshowText,
} from "../../../shared/contracts/quizshow";

/** The text in the screen's language, or the other language when that one is blank. */
export function pickQuizshowText(
  text: QuizshowText,
  language: QuizshowLanguage,
): string {
  return pickQuizshowTextWithLanguage(text, language).text;
}

/**
 * The text and the language it is actually in after the blank fallback, so a
 * quiz text node can set `lang` to the language the words are in (item 41).
 * When both sides are blank it answers the asked language with an empty text.
 */
export function pickQuizshowTextWithLanguage(
  text: QuizshowText,
  language: QuizshowLanguage,
): { text: string; language: QuizshowLanguage } {
  const otherLanguage: QuizshowLanguage = language === "en" ? "pt" : "en";
  if (text[language].trim() !== "" || text[otherLanguage].trim() === "") {
    return { text: text[language], language };
  }
  return { text: text[otherLanguage], language: otherLanguage };
}

/** The one language a screen setting reads first: "both" leads with EN (C6.26). */
export function primaryLanguageOf(
  screenLanguage: QuizshowScreenLanguage,
): QuizshowLanguage {
  return screenLanguage === "both" ? "en" : screenLanguage;
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
