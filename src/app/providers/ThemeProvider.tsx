import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ForcedThemeContext,
  ThemeContext,
  isStudioThemePath,
  type Theme,
} from "./themeContext";
import { safeStorage } from "../../shared/storage/safeStorage";

const STORAGE_KEY = "qp-theme";

interface ForcedThemeHold {
  holdId: number;
  theme: Theme;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  // Default to light; honour a previous explicit choice from the navbar toggle.
  // We intentionally do NOT follow the system's dark preference.
  //
  // Guarded read: ThemeProvider lives in `RootProviders`, ABOVE the app's
  // `<ErrorBoundary>`, so an unguarded `localStorage` access here would
  // white-screen the whole app at boot in browsers that block site data.
  // `safeStorage` degrades a blocked store to `null` (→ light) instead.
  const stored = safeStorage.get(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

/** Studio is always dark. The provider sits above the router, so a first
 *  load straight onto a Studio URL reads the address bar and starts dark,
 *  before any Studio surface has mounted to hold it, so the page never
 *  paints light first. */
function getInitialIsStudioBoot(): boolean {
  if (typeof window === "undefined") return false;
  return isStudioThemePath(window.location.pathname);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The member's own choice, the only theme ever stored.
  const [preferredTheme, setPreferredTheme] = useState<Theme>(getInitialTheme);
  const [forcedThemeHolds, setForcedThemeHolds] = useState<
    readonly ForcedThemeHold[]
  >([]);
  const [isStudioBoot, setIsStudioBoot] = useState(getInitialIsStudioBoot);
  const nextHoldIdRef = useRef(0);

  // The newest hold wins; with none, the Studio boot theme, then the choice.
  const latestHold = forcedThemeHolds.at(-1);
  const studioBootTheme: Theme | null = isStudioBoot ? "dark" : null;
  const theme: Theme = latestHold?.theme ?? studioBootTheme ?? preferredTheme;

  // Reflect the theme on screen onto <html> so token overrides apply
  // globally. A layout effect, so a forced theme lands before the paint of
  // the surface that holds it.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Only the member's choice is stored: a forced theme never overwrites it.
  useEffect(() => {
    // Guarded write (see `getInitialTheme`): a blocked store must not throw.
    safeStorage.set(STORAGE_KEY, preferredTheme);
  }, [preferredTheme]);

  const setTheme = useCallback((next: Theme) => setPreferredTheme(next), []);
  const toggleTheme = useCallback(
    () =>
      setPreferredTheme((current) => (current === "dark" ? "light" : "dark")),
    [],
  );

  const holdForcedTheme = useCallback((heldTheme: Theme) => {
    nextHoldIdRef.current += 1;
    const holdId = nextHoldIdRef.current;
    setForcedThemeHolds((holds) => [...holds, { holdId, theme: heldTheme }]);
    // A real hold has taken over from the boot theme.
    setIsStudioBoot(false);
    return () =>
      setForcedThemeHolds((holds) =>
        holds.filter((hold) => hold.holdId !== holdId),
      );
  }, []);
  const releaseStudioBootTheme = useCallback(() => setIsStudioBoot(false), []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );
  const forcedThemeValue = useMemo(
    () => ({ holdForcedTheme, releaseStudioBootTheme }),
    [holdForcedTheme, releaseStudioBootTheme],
  );

  return (
    <ForcedThemeContext.Provider value={forcedThemeValue}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </ForcedThemeContext.Provider>
  );
}
