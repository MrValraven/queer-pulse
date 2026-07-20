import { createContext, useContext } from "react";

export interface NavDrawerContextValue {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /**
   * Close because the user is navigating *out* of the drawer via one of its own
   * links. Distinct from `closeDrawer` because those links navigate with
   * `replace`, which overwrites the drawer's own history entry — so unlike
   * Escape / overlay click / the More button, there is no leftover entry left
   * to pop. See NavDrawerProvider for the full history handling.
   */
  closeDrawerForNavigation: () => void;
}

/**
 * Safe default so a shell rendered without the provider (isolated tests,
 * bespoke frames) degrades to "drawer permanently closed" rather than throwing.
 */
export const NavDrawerContext = createContext<NavDrawerContextValue>({
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  closeDrawerForNavigation: () => {},
});

export function useNavDrawer(): NavDrawerContextValue {
  return useContext(NavDrawerContext);
}
