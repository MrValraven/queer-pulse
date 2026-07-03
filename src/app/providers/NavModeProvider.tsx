import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NavModeContext, type NavMode } from "./navModeContext";
import { useAuth } from "./authContext";

const MODE_KEY = "qp-nav-mode";
const COLLAPSED_KEY = "qp-nav-collapsed";

function getStoredMode(): NavMode {
  if (typeof window === "undefined") return "mega";
  return window.localStorage.getItem(MODE_KEY) === "sidebar"
    ? "sidebar"
    : "mega";
}

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(COLLAPSED_KEY) === "true";
}

/**
 * Lets the primary navigation switch between the top MegaNav (`"mega"`) and a
 * collapsible left Sidebar (`"sidebar"`). Mirrors ThemeProvider: the choice
 * persists to localStorage and is reflected onto <html> as `data-nav-mode` /
 * `data-nav-collapsed` so global CSS can offset page content without touching
 * every shell.
 *
 * The sidebar is a signed-in-only affordance, so the *effective* mode falls
 * back to `"mega"` whenever the visitor is signed out — but their stored
 * preference is preserved, so switching back to the sidebar happens
 * automatically the next time they sign in.
 */
export function NavModeProvider({ children }: { children: ReactNode }) {
  const { loggedIn } = useAuth();
  const [preferredMode, setPreferredMode] = useState<NavMode>(getStoredMode);
  const [railCollapsed, setCollapsedState] =
    useState<boolean>(getInitialCollapsed);

  // Signed-out visitors always get the MegaNav; signed-in members get their pick.
  const navMode: NavMode = loggedIn ? preferredMode : "mega";

  // Persist the *preference* (not the effective mode) so signing out never
  // erases a member's choice to use the sidebar.
  useEffect(() => {
    window.localStorage.setItem(MODE_KEY, preferredMode);
  }, [preferredMode]);

  // Reflect the *effective* mode onto <html> so global CSS only offsets content
  // for the rail when it is actually rendered.
  useEffect(() => {
    document.documentElement.dataset.navMode = navMode;
  }, [navMode]);

  useEffect(() => {
    document.documentElement.dataset.navCollapsed = String(railCollapsed);
    window.localStorage.setItem(COLLAPSED_KEY, String(railCollapsed));
  }, [railCollapsed]);

  const setNavMode = useCallback((mode: NavMode) => setPreferredMode(mode), []);
  const toggleNavMode = useCallback(
    () =>
      setPreferredMode((current) =>
        current === "sidebar" ? "mega" : "sidebar",
      ),
    [],
  );
  const setRailCollapsed = useCallback(
    (collapsed: boolean) => setCollapsedState(collapsed),
    [],
  );
  const toggleRail = useCallback(
    () => setCollapsedState((current) => !current),
    [],
  );

  const value = useMemo(
    () => ({
      navMode,
      setNavMode,
      toggleNavMode,
      railCollapsed,
      setRailCollapsed,
      toggleRail,
    }),
    [
      navMode,
      setNavMode,
      toggleNavMode,
      railCollapsed,
      setRailCollapsed,
      toggleRail,
    ],
  );

  return (
    <NavModeContext.Provider value={value}>{children}</NavModeContext.Provider>
  );
}
