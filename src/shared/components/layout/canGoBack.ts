/**
 * Pure guard behind the gesture (and the Task-14 test): only the very first
 * history entry — idx 0, a tab's landing page — has nothing behind it to pop
 * back to. Everything past it is fair game.
 */
export function canGoBack(historyIdx: number): boolean {
  return historyIdx > 0;
}

/** React-router stamps a per-entry index on history.state; -1 when absent so
    `canGoBack` reads false. Shared by the edge-swipe, the app bar's back
    chevron and the Messages header's, so the three never disagree. */
export function currentHistoryIdx(): number {
  const state = window.history.state as { idx?: number } | null;
  return typeof state?.idx === "number" ? state.idx : -1;
}
