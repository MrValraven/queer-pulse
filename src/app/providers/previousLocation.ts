import { createContext, useContext } from "react";
import type { NavEntry } from "../navHistory";

export const PreviousLocationContext = createContext<NavEntry | null>(null);

/** The entry visited immediately before this one, or null if we can't know. */
export function usePreviousLocation(): NavEntry | null {
  return useContext(PreviousLocationContext);
}
