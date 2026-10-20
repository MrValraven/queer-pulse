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
