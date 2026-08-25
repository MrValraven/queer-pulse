import { createContext } from "react";

/**
 * Multi-select state for the Board/Timeline card checkboxes and the
 * `BulkBar` that acts on them. A context (not a bare hook instance per
 * caller) because the Board's cards and the page's `BulkBar` are siblings
 * that must share exactly one selection — two independent `useState<Set>`
 * instances would let a card claim "selected" while the bar it drives never
 * sees it.
 */
export interface RoadmapSelectionContextValue {
  selected: Set<string>;
  toggle: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
  selectMany: (ids: string[]) => void;
}

export const RoadmapSelectionContext =
  createContext<RoadmapSelectionContextValue | null>(null);
