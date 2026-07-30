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

export interface SavedItem {
  /** Stable unique id, conventionally `${kind}:${slug}`. */
  id: string;
  kind: SavedKind;
  title: string;
  /** Original design href or router path; pass through linkToPath() when rendering. */
  href?: string;
  /** Small supporting line (author, org, neighbourhood…). */
  meta?: string;
  /** One- to two-line blurb shown on the saved card. */
  description?: string;
  /** Short read/length pill, e.g. "6 min". Falls back to a "N min" parsed from meta. */
  readTime?: string;
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
