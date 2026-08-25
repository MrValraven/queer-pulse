import { useContext } from "react";
import {
  RoadmapFiltersContext,
  type RoadmapFiltersContextValue,
} from "./roadmapFiltersContext";

export function useRoadmapFilters(): RoadmapFiltersContextValue {
  const context = useContext(RoadmapFiltersContext);
  if (!context) {
    throw new Error(
      "useRoadmapFilters must be used within a RoadmapFiltersProvider",
    );
  }
  return context;
}
