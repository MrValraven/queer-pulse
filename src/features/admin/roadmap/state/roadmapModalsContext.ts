import { createContext } from "react";

/**
 * The 8 roadmap admin modals (Task C4), addressed by name from any view or
 * from the item drawer. One-at-a-time — opening a new modal replaces
 * whichever was open, matching the prototype's single dialog stack.
 */
export type RoadmapModalName =
  | "slip"
  | "safety"
  | "merge"
  | "decline"
  | "notify"
  | "digest"
  | "audit"
  | "shortcuts";

/**
 * Permissive payload every modal reads from. Not every field applies to
 * every modal — `slip` reads `itemId`/`from`/`to`, `merge`/`decline` read
 * `ideaId`, `notify` reads `itemId`, `digest`/`audit`/`shortcuts` read
 * nothing. Kept as one shape (rather than a modal-keyed discriminated union)
 * because `open()` is called from many different views that shouldn't need
 * to import every modal's specific payload type.
 */
export interface RoadmapModalPayload {
  itemId?: string;
  ideaId?: string;
  from?: string;
  to?: string;
}

export interface RoadmapModalsContextValue {
  modal: RoadmapModalName | null;
  payload: RoadmapModalPayload | null;
  open: (modal: RoadmapModalName, payload?: RoadmapModalPayload) => void;
  close: () => void;
}

export const RoadmapModalsContext =
  createContext<RoadmapModalsContextValue | null>(null);
