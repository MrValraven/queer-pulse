import { createContext, useContext } from "react";

export type StudioNowPlayingTab = "lyrics" | "queue" | "credits" | "chapters";

/** Which player surfaces are open (contract C.1). Lives inside
 *  StudioPlayerProvider; nothing here is saved anywhere. */
export interface StudioPlayerSurfaceValue {
  isNowPlayingOpen: boolean;
  nowPlayingTab: StudioNowPlayingTab;
  /** Desktop side panel; on phones openQueue opens Now playing on "queue". */
  isQueuePanelOpen: boolean;
  isShortcutsOpen: boolean;
  /** The bar's one open popover (settings, sleep timer), keyed by its
   *  trigger id. Opening one closes the queue panel, and the queue closes it. */
  openPopoverId: string | null;
  openNowPlaying: (tab?: StudioNowPlayingTab) => void;
  closeNowPlaying: () => void;
  setNowPlayingTab: (tab: StudioNowPlayingTab) => void;
  openQueue: () => void;
  closeQueuePanel: () => void;
  toggleQueuePanel: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  openPopover: (id: string) => void;
  /** Clears only a matching id, so a stale close leaves another popover open. */
  closePopover: (id: string) => void;
}

export const StudioPlayerSurfaceContext =
  createContext<StudioPlayerSurfaceValue | null>(null);

export function useStudioPlayerSurface(): StudioPlayerSurfaceValue {
  const value = useContext(StudioPlayerSurfaceContext);
  if (!value)
    throw new Error(
      "useStudioPlayerSurface must be used within StudioPlayerProvider",
    );
  return value;
}
