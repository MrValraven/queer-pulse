import { useContext } from "react";
import {
  ItemDrawerContext,
  type ItemDrawerContextValue,
} from "./itemDrawerContext";

export function useItemDrawer(): ItemDrawerContextValue {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return context;
}
