import {
  QUIZSHOW_PARTY_ROUND_KINDS,
  QUIZSHOW_PLAYABLE_ROUND_KINDS,
  type QuizshowLanguage,
  type QuizshowPartyRoundKind,
  type QuizshowPlayableRoundKind,
  type QuizshowQuestionInput,
  type QuizshowRoundKind,
  type QuizshowScreenLanguage,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { correctIndexesOf } from "../builder/quizshowDraft";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";

/** The answer layout a thumbnail sketches under its prompt. */
export type StudioThumbnailLayout =
  "choice" | "truth" | "typed" | "order" | "number" | "prompt" | "picture";

export function isPartyRoundKind(
  kind: QuizshowRoundKind,
): kind is QuizshowPartyRoundKind {
  return (QUIZSHOW_PARTY_ROUND_KINDS as readonly string[]).includes(kind);
}

/** Every kind that holds questions; false for a wheel row. */
export function isPlayableRoundKind(
  kind: QuizshowRoundKind,
): kind is QuizshowPlayableRoundKind {
  return (QUIZSHOW_PLAYABLE_ROUND_KINDS as readonly string[]).includes(kind);
}

/** What the miniature draws under the prompt, by question type and round kind. */
export function thumbnailLayoutOf(
  question: QuizshowQuestionInput,
  roundKind: QuizshowRoundKind,
): StudioThumbnailLayout {
  switch (question.type) {
    case "multiple_choice":
    case "poll":
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
 * How many answer cells the miniature draws, and which ones are right.
 * Multiple choice shows its own options with every correct one marked; a
 * poll shows its options with none marked; true or false shows two.
 */
export function thumbnailCellsOf(question: QuizshowQuestionInput): {
  count: number;
  correctIndexes: readonly number[];
} {
  if (question.type === "multiple_choice") {
    return {
      count: Math.max(question.options.length, 2),
      correctIndexes: correctIndexesOf(question),
    };
  }
  if (question.type === "poll") {
    return { count: Math.max(question.options.length, 2), correctIndexes: [] };
  }
  if (question.type === "true_false") {
    if (question.answer === null) return { count: 2, correctIndexes: [] };
    return { count: 2, correctIndexes: [question.answer.isTrue ? 0 : 1] };
  }
  if (question.type === "order") {
    return {
      count: Math.min(Math.max(question.options.length, 2), 4),
      correctIndexes: [],
    };
  }
  return { count: 0, correctIndexes: [] };
}

/** The text in the language the host types in, else the other one, trimmed. */
export function shownTextOf(
  text: QuizshowText,
  viewLanguage: QuizshowLanguage,
): string {
  return shownTextWithLanguageOf(text, viewLanguage).text;
}

/**
 * `shownTextOf` with the language the words are actually in, so read-only
 * quiz text can carry `lang` (item 41). Both blank answers the view language.
 */
export function shownTextWithLanguageOf(
  text: QuizshowText,
  viewLanguage: QuizshowLanguage,
): { text: string; language: QuizshowLanguage } {
  const otherLanguage: QuizshowLanguage = viewLanguage === "en" ? "pt" : "en";
  const viewText = text[viewLanguage].trim();
  if (viewText.length > 0) return { text: viewText, language: viewLanguage };
  const otherText = text[otherLanguage].trim();
  return otherText.length > 0
    ? { text: otherText, language: otherLanguage }
    : { text: "", language: viewLanguage };
}

/**
 * The language read-only text on a slide is drawn in: both lines when the
 * quiz shows both on the TV (C6.26), else the language the host types in.
 */
export function slideTextLanguageOf(
  screenLanguage: QuizshowScreenLanguage,
  viewLanguage: QuizshowLanguage,
): QuizshowScreenLanguage {
  return screenLanguage === "both" ? "both" : viewLanguage;
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
