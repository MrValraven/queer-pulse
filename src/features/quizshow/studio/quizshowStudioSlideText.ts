import type { CSSProperties } from "react";
import type {
  QuizshowLanguage,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowLocalProblemCode } from "../builder/quizshowValidation";
import type { QuizshowSwatch } from "../quizshowSwatches";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { studioProblemCopyOf } from "./quizshowStudioProblemCopy";

/** How much room a text needs: the slide steps its type down as it grows. */
export type QuizshowSlideLength = "short" | "medium" | "long";

export function slideLengthOf(
  text: string,
  mediumFrom: number,
  longFrom: number,
): QuizshowSlideLength {
  if (text.length >= longFrom) return "long";
  if (text.length >= mediumFrom) return "medium";
  return "short";
}

/** `text` with the `language` side replaced; the other language stays as it was. */
export function withLanguageText(
  text: QuizshowText,
  language: QuizshowLanguage,
  value: string,
): QuizshowText {
  return { ...text, [language]: value };
}

/** A tile's answer colour, as the stage tile reads it. */
export function swatchStyleOf(swatch: QuizshowSwatch): CSSProperties {
  return {
    "--quizshow-tile-fill": swatch.fillVar,
    "--quizshow-tile-ink": swatch.inkVar,
  } as CSSProperties;
}

/**
 * The selected question's first problem with `code`, as its sentence, or
 * undefined. A language-specific problem counts only in the language typed
 * on the slide.
 */
export function useSlideProblemLine(
  code: QuizshowLocalProblemCode,
): string | undefined {
  const { t } = useTranslation();
  const { problemsFor, selection, scope, viewLanguage, controller } =
    useQuizshowStudio();
  const problem = problemsFor(selection).find(
    (candidate) =>
      candidate.code === code &&
      (candidate.language === null || candidate.language === viewLanguage),
  );
  if (problem === undefined) return undefined;
  const copy = studioProblemCopyOf(
    problem,
    scope.kind,
    controller.draft.rounds,
  );
  return t(copy.key, {
    ...copy.values,
    language: copy.languageTagKey === null ? "" : t(copy.languageTagKey),
  });
}
