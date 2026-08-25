import { useContext } from "react";
import {
  RoadmapSelectionContext,
  type RoadmapSelectionContextValue,
} from "./roadmapSelectionContext";

export function useRoadmapSelection(): RoadmapSelectionContextValue {
  const context = useContext(RoadmapSelectionContext);
  if (!context) {
    throw new Error(
      "useRoadmapSelection must be used within a SelectionProvider",
    );
  }
  return context;
}
