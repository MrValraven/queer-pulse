import { createContext } from "react";
import type { RoadmapFilters } from "./roadmapFiltersTypes";

/**
 * The Board/Timeline toolbar's filter state — search text, category, owner,
 * sort, the active saved view, and the compact-density toggle. Persisted to
 * `localStorage` (view preference, not server data) so switching tabs or
 * reloading doesn't reset a triage session in progress; falls back silently
 * to `DEFAULT_FILTERS` in private-browsing or on a corrupt/legacy value.
 *
 * A context (not a bare hook instance per caller) because the writers
 * (`RoadmapToolbar`, `SavedViewChips`) and the readers (`BoardView`,
 * `TimelineView`, `ArchiveView`) are siblings under `AdminRoadmapPageContent`
 * that must share exactly one filter state — two independent
 * `useLocalStorage` instances would let the toolbar's search box update
 * while the board it's supposed to filter never re-renders. Mirrors
 * `state/useRoadmapSelection.tsx`'s provider shape exactly.
 */
export interface RoadmapFiltersContextValue {
  filters: RoadmapFilters;
  setFilter: <K extends keyof RoadmapFilters>(
    key: K,
    value: RoadmapFilters[K],
  ) => void;
  setSavedView: (view: string | null) => void;
}

export const RoadmapFiltersContext =
  createContext<RoadmapFiltersContextValue | null>(null);
