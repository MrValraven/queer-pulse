import { useCallback, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../../../../shared/hooks";
import {
  RoadmapFiltersContext,
  type RoadmapFiltersContextValue,
} from "./roadmapFiltersContext";
import {
  DEFAULT_FILTERS,
  isRoadmapFilters,
  type RoadmapFilters,
} from "./roadmapFiltersTypes";

export function RoadmapFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useLocalStorage<RoadmapFilters>(
    "qp.roadmap.filters",
    DEFAULT_FILTERS,
    isRoadmapFilters,
  );

  const setFilter = useCallback(
    <K extends keyof RoadmapFilters>(key: K, value: RoadmapFilters[K]) => {
      setFilters((previous) => ({ ...previous, [key]: value }));
    },
    [setFilters],
  );

  // Clicking the already-active chip clears it — saved views are a toggle,
  // not a one-way radio group.
  const setSavedView = useCallback(
    (view: string | null) => {
      setFilters((previous) => ({
        ...previous,
        savedView: previous.savedView === view ? null : view,
      }));
    },
    [setFilters],
  );

  const value = useMemo<RoadmapFiltersContextValue>(
    () => ({ filters, setFilter, setSavedView }),
    [filters, setFilter, setSavedView],
  );

  return (
    <RoadmapFiltersContext.Provider value={value}>
      {children}
    </RoadmapFiltersContext.Provider>
  );
}
