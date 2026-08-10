import { createContext, useContext } from "react";

export interface MagazineShellOverlayState {
  isPaletteOpen: boolean;
  isNotificationsOpen: boolean;
}

const DEFAULT_STATE: MagazineShellOverlayState = {
  isPaletteOpen: false,
  isNotificationsOpen: false,
};

/**
 * Whether `MagazineDeskShell`'s hoisted ⌘K palette or "Since Friday" panel is
 * currently open. Editor pages with their own single-key keyboard shortcuts
 * (the desk's j/k/o/c/y/n) read this so those shortcuts don't fire underneath
 * an open overlay — see `EditorDashboardPage`. Defaults to "closed" for any
 * page rendered outside `MagazineDeskShell`.
 */
export const MagazineShellOverlayContext =
  createContext<MagazineShellOverlayState>(DEFAULT_STATE);

export function useMagazineShellOverlay(): MagazineShellOverlayState {
  return useContext(MagazineShellOverlayContext);
}
