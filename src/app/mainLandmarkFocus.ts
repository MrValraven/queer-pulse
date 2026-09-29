import { MAIN_CONTENT_ID } from "../shared/components/layout/SkipToContentLink";

/**
 * How long after a route change a replaced `<main>` may still hand focus to
 * its successor. Long enough to cover a slow data fetch behind a loading
 * skeleton; short enough that a remount much later (a refetch, an error
 * boundary retry) can never pull focus anywhere.
 */
const REPLACED_MAIN_WATCH_WINDOW_MS = 10_000;

/** The single `<main>` landmark the shells render, whichever shell is on screen. */
export function findMainLandmark(): HTMLElement | null {
  return (
    document.getElementById(MAIN_CONTENT_ID) ??
    document.querySelector<HTMLElement>("main[data-page-main]") ??
    document.querySelector<HTMLElement>("main")
  );
}

function isFocusLost(): boolean {
  const activeElement = document.activeElement;
  return activeElement === null || activeElement === document.body;
}

/**
 * Keeps focus inside the page when the `<main>` a route change just focused
 * is swapped out underneath it.
 *
 * A route whose loading state renders its own `PageShell` (a skeleton) gets
 * that skeleton's `<main>` focused, and when the data arrives React unmounts
 * it. Focus then falls to `<body>` and the first Tab lands on the skip link.
 * This watches for exactly that: once the focused `<main>` has left the
 * document and focus sits on `<body>`, it focuses the current
 * `[data-page-main]` instead, without scrolling. The successor is watched the
 * same way, so a skeleton handing over to a second skeleton is covered too.
 *
 * It only ever restores a lost focus. It stops for good the moment the
 * visitor focuses anything else or presses a pointer, once the watch window
 * runs out, or when the returned function is called (the next navigation).
 */
export function watchForReplacedMain(focusedMain: HTMLElement): () => void {
  let watchedMain = focusedMain;
  let isWatching = true;

  const restoreFocusIfMainReplaced = (): void => {
    if (watchedMain.isConnected) return;
    if (!isFocusLost()) {
      stopWatching();
      return;
    }
    const currentMain = document.querySelector<HTMLElement>(
      "main[data-page-main]",
    );
    // Between the skeleton and the page there can be a moment with no
    // `<main>` at all (a Suspense fallback); the next mutation brings it.
    if (!currentMain) return;
    watchedMain = currentMain;
    currentMain.focus({ preventScroll: true });
  };

  const handleFocusIn = (event: FocusEvent): void => {
    if (event.target !== watchedMain) stopWatching();
  };

  const mainObserver = new MutationObserver(restoreFocusIfMainReplaced);
  const windowTimeoutId = window.setTimeout(
    () => stopWatching(),
    REPLACED_MAIN_WATCH_WINDOW_MS,
  );

  function stopWatching(): void {
    if (!isWatching) return;
    isWatching = false;
    mainObserver.disconnect();
    window.clearTimeout(windowTimeoutId);
    document.removeEventListener("focusin", handleFocusIn, true);
    document.removeEventListener("pointerdown", stopWatching, true);
  }

  mainObserver.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("focusin", handleFocusIn, true);
  document.addEventListener("pointerdown", stopWatching, true);

  return stopWatching;
}
