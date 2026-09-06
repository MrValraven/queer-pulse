import { createContext, useContext } from "react";

export type SavedKind =
  | "article"
  | "film"
  | "job"
  | "post"
  | "event"
  | "group"
  | "housing"
  | "flatmate"
  | "landlord"
  | "listing";

/**
 * Whether the thing a save points at can still be opened.
 *
 * The API deliberately never says WHY something became unavailable (deleted,
 * made private, blocked, not launched yet): the reason is the leak. So this is
 * two states and no more, and every surface that renders it has to be honest
 * about the loss without guessing at a cause.
 *
 * Absent on a purely local save that has never round-tripped through the API,
 * which is treated as available: an offline cache has nothing to say about a
 * subject it has not asked about.
 */
export type SavedItemAvailability = "available" | "unavailable";

export interface SavedItem {
  /** Stable unique id, conventionally `${kind}:${slug}`. */
  id: string;
  kind: SavedKind;
  title: string;
  /**
   * Original design href or router path; pass through linkToPath() when
   * rendering. `null` when the subject can no longer be opened, which the API
   * pairs with `availability: "unavailable"`. Never render a link off this
   * without checking `availability` too.
   */
  href?: string | null;
  /** Small supporting line (author, org, neighbourhood…). */
  meta?: string;
  /** One- to two-line blurb shown on the saved card. */
  description?: string;
  /** Short read/length pill, e.g. "6 min". Falls back to a "N min" parsed from meta. */
  readTime?: string;
  /** Whether the subject can still be opened. Absent means available. */
  availability?: SavedItemAvailability;
}

/**
 * Whether a saved item's subject can no longer be opened. One place decides it
 * so the card, the list row and the shared-list row can never disagree, and so
 * an item that merely never carried an href (a demo fixture, an old save) is
 * not mistaken for one that was lost.
 */
export function isSavedItemUnavailable(item: {
  availability?: SavedItemAvailability;
}): boolean {
  return item.availability === "unavailable";
}

export interface SavedContextValue {
  items: SavedItem[];
  isSaved: (id: string) => boolean;
  /** Toggle an item; returns the new saved state (true = now saved). */
  toggleSave: (item: SavedItem) => boolean;
  save: (item: SavedItem) => void;
  unsave: (id: string) => void;
  byKind: (kind: SavedKind) => SavedItem[];
}

export const SavedContext = createContext<SavedContextValue | null>(null);

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved must be used within SavedProvider");
  }
  return ctx;
}
