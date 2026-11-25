import type { Language } from "../../../shared/i18n/types";
import type { QuizBadgeText } from "../../../shared/contracts/quizWinBadges";

/**
 * A badge text in the viewer's language. A Portuguese viewer reads the
 * Portuguese text when it holds anything beyond blanks, and the English text
 * otherwise (contract section 3: `pt` null reads as `en`).
 */
export function quizBadgeTextIn(
  text: QuizBadgeText,
  language: Language,
): string {
  if (language === "pt" && text.pt !== null && text.pt.trim() !== "") {
    return text.pt;
  }
  return text.en;
}

/** Length in code points, so an emoji counts as one character like the server counts it. */
export function quizBadgeCodePointLength(text: string): number {
  return [...text].length;
}
