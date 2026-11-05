import {
  QUIZSHOW_PARTY_ROUND_KINDS,
  type QuizshowLanguage,
  type QuizshowQuestionInput,
  type QuizshowRoundKind,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";

/** The answer layout a thumbnail sketches under its prompt. */
export type StudioThumbnailLayout =
  "choice" | "truth" | "typed" | "order" | "number" | "prompt" | "picture";

export function isPartyRoundKind(kind: QuizshowRoundKind): boolean {
  return (QUIZSHOW_PARTY_ROUND_KINDS as readonly string[]).includes(kind);
}

/** What the miniature draws under the prompt, by question type and round kind. */
export function thumbnailLayoutOf(
  question: QuizshowQuestionInput,
  roundKind: QuizshowRoundKind,
): StudioThumbnailLayout {
  switch (question.type) {
    case "multiple_choice":
      return "choice";
    case "true_false":
      return "truth";
    case "type_answer":
      return "typed";
    case "order":
      return "order";
    case "closest_number":
      return "number";
    case "prompt":
      return roundKind === "caption_this" ? "picture" : "prompt";
    default:
      return "prompt";
  }
}

/**
 * How many answer cells the miniature draws, and which one is right (or -1).
 * Multiple choice shows its own options; true or false shows two.
 */
export function thumbnailCellsOf(question: QuizshowQuestionInput): {
  count: number;
  correctIndex: number;
} {
  if (question.type === "multiple_choice") {
    return {
      count: Math.max(question.options.length, 2),
      correctIndex: question.answer?.correctIndex ?? -1,
    };
  }
  if (question.type === "true_false") {
    if (question.answer === null) return { count: 2, correctIndex: -1 };
    return { count: 2, correctIndex: question.answer.isTrue ? 0 : 1 };
  }
  if (question.type === "order") {
    return {
      count: Math.min(Math.max(question.options.length, 2), 4),
      correctIndex: -1,
    };
  }
  return { count: 0, correctIndex: -1 };
}

/** The text in the language the host types in, else the other one, trimmed. */
export function shownTextOf(
  text: QuizshowText,
  viewLanguage: QuizshowLanguage,
): string {
  const otherLanguage: QuizshowLanguage = viewLanguage === "en" ? "pt" : "en";
  const viewText = text[viewLanguage].trim();
  return viewText.length > 0 ? viewText : text[otherLanguage].trim();
}

/** One key per round (questionIndex null) or question, for the problem dots. */
export function problemSpotKey(
  roundIndex: number,
  questionIndex: number | null,
): string {
  return questionIndex === null
    ? `round-${roundIndex}`
    : `question-${roundIndex}-${questionIndex}`;
}

/**
 * Every round and question that carries a problem. A round's dot also lights
 * for a problem in any of its questions, so a folded-away problem still shows.
 */
export function problemSpotsOf(
  problems: readonly QuizshowLocalProblem[],
): ReadonlySet<string> {
  const spots = new Set<string>();
  for (const problem of problems) {
    if (problem.roundIndex === null) continue;
    spots.add(problemSpotKey(problem.roundIndex, null));
    if (problem.questionIndex !== null) {
      spots.add(problemSpotKey(problem.roundIndex, problem.questionIndex));
    }
  }
  return spots;
}

/**
 * Focus for a rail item a mouse press selected. A press that may become a
 * drag keeps focus where it was, so the click moves it here, without the
 * keyboard ring where the browser supports saying so.
 */
export const STUDIO_PRESS_FOCUS = {
  preventScroll: true,
  focusVisible: false,
} as FocusOptions;

/** Shift+F10 or the keyboard's menu key: open the focused item's menu. */
export function isContextMenuKey(event: {
  key: string;
  shiftKey: boolean;
}): boolean {
  return event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
}

/** A right-click carries the pointer; a context menu raised from the keyboard opens at its item. */
export function contextMenuPointOf(event: {
  button: number;
  clientX: number;
  clientY: number;
}): { x: number; y: number } | null {
  return event.button === 2 ? { x: event.clientX, y: event.clientY } : null;
}
