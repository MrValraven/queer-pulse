import type { ReactNode } from "react";
import { MyEventsContext } from "./MyEventsContext";
import { useMyEventsState } from "./useMyEventsState";

/** Provides all My Events state + actions to the dashboard subtree. */
export function MyEventsProvider({ children }: { children: ReactNode }) {
  const value = useMyEventsState();
  return (
    <MyEventsContext.Provider value={value}>
      {children}
    </MyEventsContext.Provider>
  );
}
