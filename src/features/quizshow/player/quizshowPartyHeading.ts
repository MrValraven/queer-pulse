import type {
  QuizshowLanguage,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import type { TFunction } from "../../../shared/i18n/types";
import { pickQuizshowText } from "../stage/quizshowText";

/** The prompt in the phone's language, or the round kind's name when the prompt is blank
 *  (a Caption This picture can stand on its own). */
export function partyHeadingOf(
  question: QuizshowQuestionView,
  language: QuizshowLanguage,
  translate: TFunction,
): string {
  const prompt = pickQuizshowText(question.prompt, language).trim();
  return prompt === ""
    ? translate(`quizshow:kind.${question.roundKind}.name`)
    : prompt;
}
