import { createContext, useContext } from "react";

export type DisplayMode = "standalone" | "browser";

export interface DisplayModeContextValue {
  /** How the app is being presented right now. */
  displayMode: DisplayMode;
  /** Convenience alias: true when running as an installed app. */
  isInstalled: boolean;
}

/**
 * Safe default rather than a throwing hook (cf. useNavMode). The shells and the
 * bottom tab bar render in isolated tests and inside bespoke frames that don't
 * mount the provider; defaulting to "browser" degrades to today's navigation
 * instead of crashing the tree.
 */
export const DisplayModeContext = createContext<DisplayModeContextValue>({
  displayMode: "browser",
  isInstalled: false,
});

export function useDisplayMode(): DisplayModeContextValue {
  return useContext(DisplayModeContext);
}
