import type { QuizshowDraft } from "./quizshowDraft";

/** The most undo steps the studio keeps; the oldest step drops off past it. */
export const QUIZSHOW_DRAFT_HISTORY_LIMIT = 50;
/** Changes with the same coalesce key this close together are one undo step (typing in one field). */
export const QUIZSHOW_DRAFT_COALESCE_MS = 800;

/**
 * The draft's undo and redo stacks (item 20). `past` holds the drafts before
 * each step, oldest first; `future` holds the drafts an undo stepped back
 * from, the next redo first. Plain data, so it lives in the draft state.
 */
export interface QuizshowDraftHistory {
  past: QuizshowDraft[];
  future: QuizshowDraft[];
  /** The last recorded change, for coalescing; null after an undo, a redo or a clear. */
  lastChange: { coalesceKey: string; recordedAt: number } | null;
}

export const EMPTY_DRAFT_HISTORY: QuizshowDraftHistory = {
  past: [],
  future: [],
  lastChange: null,
};

/** A draft and the history that goes with it, after an undo or a redo. */
export interface QuizshowDraftHistoryStep {
  draft: QuizshowDraft;
  history: QuizshowDraftHistory;
}

/** Keeps the newest `QUIZSHOW_DRAFT_HISTORY_LIMIT` drafts. */
function cappedOf(drafts: QuizshowDraft[]): QuizshowDraft[] {
  return drafts.length > QUIZSHOW_DRAFT_HISTORY_LIMIT
    ? drafts.slice(drafts.length - QUIZSHOW_DRAFT_HISTORY_LIMIT)
    : drafts;
}

/**
 * Records one change made to `previousDraft`. A change with the same
 * `coalesceKey` as the last one, within `QUIZSHOW_DRAFT_COALESCE_MS` of it,
 * joins that step (each keystroke moves the window on). A null key always
 * starts a step of its own (adds, removes and moves). Any change clears the
 * redo stack.
 */
export function recordDraftChange(
  history: QuizshowDraftHistory,
  previousDraft: QuizshowDraft,
  coalesceKey: string | null,
  now: number,
): QuizshowDraftHistory {
  const { lastChange } = history;
  const isCoalesced =
    coalesceKey !== null &&
    lastChange !== null &&
    lastChange.coalesceKey === coalesceKey &&
    now - lastChange.recordedAt <= QUIZSHOW_DRAFT_COALESCE_MS &&
    history.past.length > 0;
  return {
    past: isCoalesced
      ? history.past
      : cappedOf([...history.past, previousDraft]),
    future: [],
    lastChange: coalesceKey === null ? null : { coalesceKey, recordedAt: now },
  };
}

/** Steps back from `currentDraft`; null when there is nothing to undo. */
export function undoDraft(
  history: QuizshowDraftHistory,
  currentDraft: QuizshowDraft,
): QuizshowDraftHistoryStep | null {
  const draft = history.past.at(-1);
  if (draft === undefined) return null;
  return {
    draft,
    history: {
      past: history.past.slice(0, -1),
      future: [currentDraft, ...history.future].slice(
        0,
        QUIZSHOW_DRAFT_HISTORY_LIMIT,
      ),
      lastChange: null,
    },
  };
}

/** Steps forward again from `currentDraft`; null when there is nothing to redo. */
export function redoDraft(
  history: QuizshowDraftHistory,
  currentDraft: QuizshowDraft,
): QuizshowDraftHistoryStep | null {
  const [draft, ...future] = history.future;
  if (draft === undefined) return null;
  return {
    draft,
    history: {
      past: cappedOf([...history.past, currentDraft]),
      future,
      lastChange: null,
    },
  };
}
