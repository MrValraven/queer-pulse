import { createContext } from "react";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";

/** Where the organisers' guest list stands: still on its way, refused,
 *  answered and seeded into the dashboard's state, or not provided at all
 *  (an opener that never asked for it). */
export type GuestListStatus = "loading" | "failed" | "ready" | "unavailable";

/** The saved guest list as the edit modal's field reads it. */
export interface SavedGuestList {
  status: GuestListStatus;
  /** The saved rows, empty until the list has answered. */
  guests: GuestCommunityDraftEntry[];
  /** Asks for the list again after it failed. */
  onRetry: () => void;
}

/**
 * The saved guest list, provided by each surface that opens the edit modal.
 * The modal freezes its draft when it opens, so a modal opened before the
 * list answered holds no guest list of its own; its field reads this one,
 * shows the loading state until it arrives, and works from the saved rows
 * once it has.
 *
 * The default locks the field ("unavailable"): an opener that provides no
 * list can never offer edits measured against an empty list that may hide
 * saved rows.
 */
export const SavedGuestListContext = createContext<SavedGuestList>({
  status: "unavailable",
  guests: [],
  onRetry: () => {},
});
