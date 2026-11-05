import {
  QUIZ_SELECTION,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";

/** The save reason's element, so the template's Save can point at why it is held. One studio per page. */
export const STUDIO_SAVE_REASON_ID = "quizshow-studio-save-reason";

/** The rail's Quiz settings row. */
export const STUDIO_QUIZ_ROW_ATTRIBUTE = "data-studio-quiz-row";

/** A round's header button in the rail (with `data-round-index`). */
export const STUDIO_ROUND_HEADER_ATTRIBUTE = "data-studio-round-header";

/** Every rail item that takes part in the rail's roving tab stop (quiz row, round headers, thumbnails). */
export const STUDIO_RAIL_ITEM_ATTRIBUTE = "data-studio-rail-item";

/**
 * Moves focus to the rail's selected item, the one roving tab stop. For when
 * the element that had focus has gone (a deleted question, a problem fixed).
 */
export function focusSelectedRailItem(): void {
  document
    .querySelector<HTMLElement>(`[${STUDIO_RAIL_ITEM_ATTRIBUTE}][tabindex="0"]`)
    ?.focus({ preventScroll: true });
}

/** The selection a rail item stands for, read from its data attributes; null for anything else. */
export function selectionOfRailItem(
  element: Element,
): QuizshowStudioSelection | null {
  if (element.hasAttribute(STUDIO_QUIZ_ROW_ATTRIBUTE)) return QUIZ_SELECTION;
  const roundIndex = Number(element.getAttribute("data-round-index"));
  if (!Number.isInteger(roundIndex)) return null;
  if (element.hasAttribute(STUDIO_ROUND_HEADER_ATTRIBUTE)) {
    return { kind: "round", roundIndex };
  }
  const questionIndex = Number(element.getAttribute("data-question-index"));
  if (!Number.isInteger(questionIndex)) return null;
  return { kind: "question", roundIndex, questionIndex };
}

function railTargetIndexOf(
  step: "previous" | "next" | "first" | "last",
  current: number,
  count: number,
): number {
  if (step === "first") return 0;
  if (step === "last") return count - 1;
  if (step === "next") return Math.min(current + 1, count - 1);
  return Math.max(current - 1, 0);
}

/**
 * The rail item a rail key moves to, in DOM order (settings row, then each
 * round's header and thumbnails): the one before or after the focused item,
 * or the first or last. Null when the rail has none.
 */
export function railItemSelectionAfter(
  step: "previous" | "next" | "first" | "last",
): QuizshowStudioSelection | null {
  // A row folding away on its way out is inert and no longer a stop.
  const items = Array.from(
    document.querySelectorAll<HTMLElement>(`[${STUDIO_RAIL_ITEM_ATTRIBUTE}]`),
  ).filter((item) => item.closest("[inert]") === null);
  if (items.length === 0) return null;
  const focused = document.activeElement?.closest(
    `[${STUDIO_RAIL_ITEM_ATTRIBUTE}]`,
  );
  const focusedIndex = focused ? items.indexOf(focused as HTMLElement) : -1;
  const current =
    focusedIndex >= 0
      ? focusedIndex
      : items.findIndex((item) => item.tabIndex === 0);
  const targetIndex = railTargetIndexOf(step, current, items.length);
  const target = items[targetIndex];
  return target ? selectionOfRailItem(target) : null;
}
