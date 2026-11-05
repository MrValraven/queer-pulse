import { createContext, useContext, useLayoutEffect } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  /** The theme on screen: a forced theme while a surface holds one (Studio
   *  is always dark), the member's own choice otherwise. */
  theme: Theme;
  /** Sets the member's choice. A forced theme still wins while it is held,
   *  and the choice shows again once the last hold lets go. */
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

export interface ForcedThemeContextValue {
  /** Holds `theme` on screen until the returned release runs. Holds are
   *  counted, so one surface unmounting while another mounts (in either
   *  order) never drops the forced theme mid-visit. */
  holdForcedTheme: (theme: Theme) => () => void;
  /** Ends the dark theme the provider starts with on a first load straight
   *  onto a Studio URL. AppRoutes calls it once the route leaves Studio,
   *  for the visit a gate redirects away before any Studio surface mounts. */
  releaseStudioBootTheme: () => void;
}

export const ForcedThemeContext = createContext<ForcedThemeContextValue | null>(
  null,
);

/** True for `/studio` and every path under it. */
export function isStudioThemePath(pathname: string): boolean {
  return pathname === "/studio" || pathname.startsWith("/studio/");
}

/**
 * Forces `theme` on <html> while the calling component is mounted, without
 * touching the member's stored choice: leaving the surface brings their own
 * theme back. A layout effect, so the attribute lands before the first
 * paint, the same technique as useStudioShellSignal. Outside a
 * ThemeProvider (an isolated component test) it does nothing.
 */
export function useForcedTheme(theme: Theme) {
  const forcedThemeContext = useContext(ForcedThemeContext);
  const holdForcedTheme = forcedThemeContext?.holdForcedTheme;
  useLayoutEffect(() => {
    if (!holdForcedTheme) return;
    return holdForcedTheme(theme);
  }, [holdForcedTheme, theme]);
}

/** Lets go of the provider's Studio boot theme once `pathname` is outside
 *  Studio. Mounted once, inside the router (AppRoutes). */
export function useReleaseStudioBootTheme(pathname: string) {
  const forcedThemeContext = useContext(ForcedThemeContext);
  const releaseStudioBootTheme = forcedThemeContext?.releaseStudioBootTheme;
  const isStudioPath = isStudioThemePath(pathname);
  useLayoutEffect(() => {
    if (!isStudioPath) releaseStudioBootTheme?.();
  }, [isStudioPath, releaseStudioBootTheme]);
}
