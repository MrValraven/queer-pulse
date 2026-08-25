/**
 * Pure guard behind the gesture (and the Task-14 test): only the very first
 * history entry — idx 0, a tab's landing page — has nothing behind it to pop
 * back to. Everything past it is fair game.
 */
export function canGoBack(historyIdx: number): boolean {
  return historyIdx > 0;
}
