import { createContext, useContext } from "react";

export type NavMode = "mega" | "sidebar";

export interface NavModeContextValue {
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
  toggleNavMode: () => void;
  railCollapsed: boolean;
  setRailCollapsed: (collapsed: boolean) => void;
  toggleRail: () => void;
}

export const NavModeContext = createContext<NavModeContextValue | null>(null);

export function useNavMode(): NavModeContextValue {
  const context = useContext(NavModeContext);
  if (!context)
    throw new Error("useNavMode must be used within a NavModeProvider");
  return context;
}
