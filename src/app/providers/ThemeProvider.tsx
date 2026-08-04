import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext, type Theme } from "./themeContext";
import { safeStorage } from "../../shared/storage/safeStorage";

const STORAGE_KEY = "qp-theme";

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Reflect the active theme onto <html> so token overrides apply globally.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // Guarded write (see `getInitialTheme`): a blocked store must not throw.
    safeStorage.set(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
