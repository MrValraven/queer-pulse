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
  | "listing"
  // Studio v1: ids `studio_release:<id>` and `studio_track:<id>`, opening
  // `/studio/album?id=` and `/studio/track?id=`. Studio v2 adds
  // `studio_playlist:<id>`, opening `/studio/collection?id=`.
  | "studio_release"
  | "studio_track"
  | "studio_playlist";

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

/**
 * The one cause the API names, and only for Studio releases and tracks our
 * team took down after a report: those keep their `href`, whose page explains
 * what happened without saying more. Every other unavailable save carries no
 * reason and no href, as above.
 */
export type SavedItemUnavailableReason = "withdrawn";

export interface SavedItem {
  /** Stable unique id, conventionally `${kind}:${slug}`. */
  id: string;
  kind: SavedKind;
  title: string;
  /**
   * Original design href or router path; pass through linkToPath() when
   * rendering. `null` when the subject can no longer be opened, which the API
   * pairs with `availability: "unavailable"`; the one exception is a withdrawn
   * Studio save, which keeps its href (see `unavailableReason`). An unavailable
   * save names a cause only through `unavailableReason`, and only for a Studio
   * takedown; any other cause stays unnamed on purpose. Never render a link off this
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
  /** Set only with `availability: "unavailable"`, see
   *  `SavedItemUnavailableReason`. */
  unavailableReason?: SavedItemUnavailableReason;
  /** Studio Library cards: the cover of a saved release or playlist as the
   *  server last read it. Absent elsewhere, null when there is none. */
  coverUrl?: string | null;
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

export interface SavedToggleOptions {
  /** Live only: runs once the server holds the change. It never runs in
   *  demo mode or after a failed request. */
  onSynced?: () => void;
}

export interface SavedRememberOptions {
  /** `readSaveScope()` as it stood before the request that read these
   *  items. A batch read under an earlier member is dropped. */
  scopeAtRead?: number;
}

export interface SavedContextValue {
  items: SavedItem[];
  isSaved: (id: string) => boolean;
  /** Toggle an item; returns the new saved state (true = now saved). */
  toggleSave: (item: SavedItem, options?: SavedToggleOptions) => boolean;
  save: (item: SavedItem) => void;
  unsave: (id: string) => void;
  byKind: (kind: SavedKind) => SavedItem[];
  /**
   * Adds saves the server already holds to the local store: ids the store
   * lacks are appended, ids it has keep their current copy. Sends nothing,
   * in either mode. A list that reads saves page by page (Studio's Liked
   * songs) calls it so every row it shows also reads as saved everywhere.
   * Live, a later hydration from the server's first page keeps them, after
   * the server's own items, until they are unsaved. An id unsaved this
   * session stays out until it is saved again, so a read that left the
   * server before the unsave can't bring it back.
   */
  remember: (items: SavedItem[], options?: SavedRememberOptions) => void;
  /** The scope the store holds now. It moves on when another member signs
   *  in on this device. Read it before a request whose items go to
   *  `remember`, and hand it back as `scopeAtRead`. */
  readSaveScope: () => number;
}

export const SavedContext = createContext<SavedContextValue | null>(null);

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved must be used within SavedProvider");
  }
  return ctx;
}
