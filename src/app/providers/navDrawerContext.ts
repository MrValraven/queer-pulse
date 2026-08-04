import { createContext, useContext } from "react";

export type NavSheet = "browse" | "account";

export interface NavDrawerContextValue {
  /** Which sheet is open, or null. At most one open at a time. */
  activeSheet: NavSheet | null;
  /** Open a sheet (switches if another is already open). */
  openSheet: (sheet: NavSheet) => void;
  /** Close the current sheet (Escape / backdrop / toggle / Back-cleanup). */
  closeSheet: () => void;
  /**
   * Close because the user is navigating *out* of a sheet via one of its own
   * links. Distinct from `closeSheet` because those links navigate with
   * `replace`, which overwrites the sheet's own history entry — so unlike
   * Escape / overlay click / the toggle button, there is no leftover entry left
   * to pop. See NavDrawerProvider for the full history handling.
   */
  closeSheetForNavigation: () => void;
}

/**
 * Safe default so a shell rendered without the provider (isolated tests,
 * bespoke frames) degrades to "no sheet open" rather than throwing.
 */
export const NavDrawerContext = createContext<NavDrawerContextValue>({
  activeSheet: null,
  openSheet: () => {},
  closeSheet: () => {},
  closeSheetForNavigation: () => {},
});

export function useNavDrawer(): NavDrawerContextValue {
  return useContext(NavDrawerContext);
}
