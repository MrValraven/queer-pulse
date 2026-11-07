/**
 * Where focus and the eye go after the desk moves a piece out from under the
 * control that moved it (unpublish, and its Undo). The board card and the
 * pipeline row both mark their title button with `data-piece-id` and
 * `data-piece-stage`, and their outer box with `data-piece-surface`, so these
 * helpers can find the piece again in its new column or group once the desk
 * has refetched. Plain DOM, kept out of React: the piece moves between
 * components that unmount and remount, and the toast lives in the shared
 * provider, outside the desk's tree.
 */

/** Longest the desk waits for a moved piece to show in its new place (the
 *  refetch after the mutation) before settling for wherever it is. */
const PLACEMENT_WAIT_MS = 4000;

/** How long the "just moved" wash stays on the card or row; the CSS fade
 *  (`--dur-reveal`) plays inside it. */
const JUST_MOVED_MS = 1200;

function findPieceTitle(pieceId: string, stage?: string): HTMLElement | null {
  const titles = document.querySelectorAll<HTMLElement>("[data-piece-id]");
  for (const title of titles) {
    if (title.dataset.pieceId !== pieceId) continue;
    if (stage === undefined || title.dataset.pieceStage === stage) return title;
  }
  return null;
}

/**
 * Calls `onFound` with the piece's title once it shows at `stage`, watching
 * the DOM while the desk refetches. Past the wait it settles for the title
 * wherever it is (a refused Undo leaves the piece where it was), or `null`
 * when the current view does not show the piece at all. Returns a cancel.
 */
export function waitForPieceTitle(
  pieceId: string,
  stage: string,
  onFound: (title: HTMLElement | null) => void,
): () => void {
  let isDone = false;
  const finish = (title: HTMLElement | null) => {
    if (isDone) return;
    isDone = true;
    observer.disconnect();
    window.clearTimeout(timeoutId);
    onFound(title);
  };
  const observer = new MutationObserver(() => {
    const title = findPieceTitle(pieceId, stage);
    if (title) finish(title);
  });
  const timeoutId = window.setTimeout(
    () => finish(findPieceTitle(pieceId)),
    PLACEMENT_WAIT_MS,
  );
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-piece-stage"],
  });
  const alreadyThere = findPieceTitle(pieceId, stage);
  if (alreadyThere) finish(alreadyThere);
  return () => finish(null);
}

/**
 * Brings a moved piece into view in its new column or group and gives its
 * card or row one brief wash, so the eye finds where it landed. With
 * `shouldFocus` the title also takes focus. Reduced motion jumps straight
 * there and skips the wash (the CSS drops its animation).
 */
export function revealPieceTitle(
  title: HTMLElement,
  {
    shouldFocus,
    isReducedMotion,
  }: { shouldFocus: boolean; isReducedMotion: boolean },
): void {
  const surface = title.closest<HTMLElement>("[data-piece-surface]") ?? title;
  surface.scrollIntoView?.({
    block: "nearest",
    inline: "nearest",
    behavior: isReducedMotion ? "auto" : "smooth",
  });
  if (shouldFocus) title.focus({ preventScroll: true });
  // Re-adding the attribute after a reflow restarts the wash when the same
  // piece moves twice in a row.
  surface.removeAttribute("data-just-moved");
  void surface.offsetWidth;
  surface.setAttribute("data-just-moved", "");
  window.setTimeout(
    () => surface.removeAttribute("data-just-moved"),
    JUST_MOVED_MS,
  );
}

/**
 * Hands keyboard focus to a toast's action button (its Undo) as soon as the
 * toast renders, then reports once the toast leaves (its action ran, it was
 * closed, or it timed out), saying whether focus was left stranded with it:
 * on the page body or inside the departing toast. The shared toast stack
 * marks each card with `data-toast-id` and makes a leaving card `inert`.
 */
export function focusToastAction(
  toastId: number,
  onLeave: (isFocusStranded: boolean) => void,
): void {
  const selector = `[data-toast-id="${toastId}"]`;
  let card: HTMLElement | null = null;
  let hasLeft = false;
  const leave = () => {
    if (hasLeft || !card) return;
    hasLeft = true;
    observer.disconnect();
    const active = document.activeElement;
    const isFocusStranded =
      active === null || active === document.body || card.contains(active);
    onLeave(isFocusStranded);
  };
  const findCard = () => {
    card = document.querySelector<HTMLElement>(selector);
    if (!card) return;
    window.clearTimeout(giveUpTimeoutId);
    card.querySelector<HTMLElement>("button")?.focus();
  };
  const observer = new MutationObserver(() => {
    if (!card) findCard();
    else if (!card.isConnected || card.hasAttribute("inert")) leave();
  });
  // A toast that never renders (no stack on the page) stops the watch.
  const giveUpTimeoutId = window.setTimeout(() => {
    if (!card) observer.disconnect();
  }, PLACEMENT_WAIT_MS);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["inert"],
  });
  findCard();
}

export interface FollowUnpublishToastParams {
  /** The success toast's id, as `showToast` returned it. */
  toastId: number;
  pieceId: string;
  /** Where the piece stood before the unpublish (Published). */
  originalStage: string;
  /** The desk stage the unpublish put it in (Drafting or In review). */
  landingStage: string;
  /** Read when the toast leaves: whether its Undo ran. */
  wasUndone: () => boolean;
  isReducedMotion: boolean;
}

/**
 * The focus path through a desk unpublish. The control that raised the
 * confirm (the card's Unpublish button, the row's More menu) leaves with the
 * piece, so focus would drop to the page body:
 * - as the success toast shows, its Undo takes focus, and the piece's card
 *   or row is brought into view in its new column or group with a brief wash;
 * - after Undo, focus goes to the piece's title back in its original place
 *   once the desk has refetched (or where it stayed, if the Undo was
 *   refused), with the same wash;
 * - after the toast is closed or times out with focus still on it, focus goes
 *   to the title in its new place. Focus the member has moved elsewhere in
 *   the meantime is left alone.
 */
export function followUnpublishToast({
  toastId,
  pieceId,
  originalStage,
  landingStage,
  wasUndone,
  isReducedMotion,
}: FollowUnpublishToastParams): void {
  waitForPieceTitle(pieceId, landingStage, (title) => {
    if (title) revealPieceTitle(title, { shouldFocus: false, isReducedMotion });
  });
  focusToastAction(toastId, (isFocusStranded) => {
    const isUndo = wasUndone();
    if (!isUndo && !isFocusStranded) return;
    waitForPieceTitle(
      pieceId,
      isUndo ? originalStage : landingStage,
      (title) => {
        if (!title) return;
        // Focus that moved on while the desk refetched stays where it went.
        const active = document.activeElement;
        const isFocusStillFree =
          active === null ||
          active === document.body ||
          active.closest("[data-toast-id]") !== null;
        revealPieceTitle(title, {
          shouldFocus: isFocusStillFree,
          isReducedMotion,
        });
      },
    );
  });
}
