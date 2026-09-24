import { createContext, useContext, type RefObject } from "react";

/**
 * The visit card's state that has to outlive the card itself.
 *
 * The card changes column when the page crosses the two-column threshold
 * (an iPad rotating, a window resized, a reader zooming in), and a change of
 * column is an unmount and a fresh mount. Anything the card held in its own
 * state would go with it: a half-written enquiry, the cap a 429 reported for
 * the rest of the visit, and the keyboard focus of whoever was using it. This
 * context keeps all three one level up, in `DirectoryVisitCardProvider`, which
 * stays mounted for the whole page.
 */
export interface DirectoryVisitCardState {
  /** The backend's own sentence from a 429 in this visit, or null. */
  capReason: string | null;
  /** Opens the enquiry composer, which the provider renders (it portals). */
  openComposer: (followUpAwaitsReply: boolean) => void;
  /** The "Message this business" trigger in whichever card is mounted now,
   *  where focus returns when the composer closes after a column change. */
  enquiryTriggerRef: RefObject<HTMLButtonElement | null>;
  /** Where focus sat inside the card that just unmounted, for the card that
   *  replaces it to restore (see `visitCardFocusCarry`). Null when nothing
   *  inside the card had focus. */
  carriedFocusRef: RefObject<number | null>;
}

export const DirectoryVisitCardContext =
  createContext<DirectoryVisitCardState | null>(null);

/** The surrounding provider's state, or null outside one (a test that renders
 *  `DirectorySpaceMain` on its own). `DirectoryVisitSection` then brings a
 *  provider of its own, so every consumer below it can rely on one. */
export function useOptionalDirectoryVisitCard(): DirectoryVisitCardState | null {
  return useContext(DirectoryVisitCardContext);
}

/** The provider's state, for components that always render inside the card. */
export function useDirectoryVisitCard(): DirectoryVisitCardState {
  const state = useContext(DirectoryVisitCardContext);
  if (!state) {
    throw new Error(
      "useDirectoryVisitCard must be used inside DirectoryVisitCardProvider",
    );
  }
  return state;
}
