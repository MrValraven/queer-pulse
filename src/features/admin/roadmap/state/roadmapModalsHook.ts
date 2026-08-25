import { useContext } from "react";
import {
  RoadmapModalsContext,
  type RoadmapModalsContextValue,
} from "./roadmapModalsContext";

export function useRoadmapModals(): RoadmapModalsContextValue {
  const context = useContext(RoadmapModalsContext);
  if (!context) {
    throw new Error(
      "useRoadmapModals must be used within a RoadmapModalsProvider",
    );
  }
  return context;
}
