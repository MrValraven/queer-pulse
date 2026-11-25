import { useState } from "react";

// Shared by the admin list pages whose rows can leave (quiz templates, quiz
// badges): the header action that folds away while the empty panel carries
// its own, and the focus move after a delete takes the focused row away.

/** About a second and a half of frames to wait for the dialog's focus return to fail. */
const FOCUS_WATCH_FRAME_LIMIT = 90;

/**
 * After a delete, the dialog hands focus back to the row's delete button,
 * which leaves with its row, so focus drops to the body. This waits for that
 * drop and moves focus onto the page heading named by `headingId`. A staff
 * member who has already moved focus somewhere else keeps it there.
 */
export function focusHeadingOnceFocusDrops(
  headingId: string,
  framesLeft = FOCUS_WATCH_FRAME_LIMIT,
): void {
  requestAnimationFrame(() => {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      document.getElementById(headingId)?.focus();
      return;
    }
    if (framesLeft > 0) focusHeadingOnceFocusDrops(headingId, framesLeft - 1);
  });
}

export interface HeaderActionFold {
  isOpen: boolean;
  /** True once the fold has finished, so the header drops its empty slot. */
  isFolded: boolean;
  isInitialSkipped: boolean;
  markFolded: () => void;
}

/**
 * Folds the header action away and back. Once folded the slot leaves the
 * header, so the phone layout keeps no gap for it; a return grows it back in.
 * Pass the result to a `Collapse` (`isOpen`, `isInitialSkipped`,
 * `onExitComplete={markFolded}`) and leave the slot out while `isFolded`.
 */
export function useHeaderActionFold(isOpen: boolean): HeaderActionFold {
  const [isFolded, setIsFolded] = useState(!isOpen);
  const [hasReturned, setHasReturned] = useState(false);
  // Adjusted during render: the slot must be back before the fold-in starts.
  if (isOpen && isFolded) {
    setIsFolded(false);
    setHasReturned(true);
  }
  return {
    isOpen,
    isFolded,
    isInitialSkipped: !hasReturned,
    markFolded: () => setIsFolded(true),
  };
}
