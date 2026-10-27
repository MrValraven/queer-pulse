import { createContext, useContext } from "react";

export type StudioNowPlayingTab =
  "lyrics" | "queue" | "credits" | "artist" | "chapters";

/** The two views of the desktop side panel. */
export type StudioSidePanelView = "nowPlaying" | "queue";

/** Docked: a column inside the listener shell from 1280px, kept open or
 *  closed by the saved preference. Floating: a card over any page, open for
 *  this visit only. */
export type StudioSidePanelPlacement = "docked" | "floating";

/** Which player surfaces are open (contract C.1). Lives inside
 *  StudioPlayerProvider. Only the docked side panel's open state and view
 *  are saved (studioSidePanelPreference.ts); the rest lasts for the visit. */
export interface StudioPlayerSurfaceValue {
  /** Something is queued (the player's own `hasQueue`). Read here, the
   *  listener shell skips the player context's per-tick changes. */
  hasQueue: boolean;
  isNowPlayingOpen: boolean;
  nowPlayingTab: StudioNowPlayingTab;
  /** The view showing in the current placement; null while it is closed,
   *  on phones, and once the queue empties. */
  sidePanel: StudioSidePanelView | null;
  /** Null on phones, where Now playing carries both views as tabs. */
  sidePanelPlacement: StudioSidePanelPlacement | null;
  /** Docked: saves the panel open on this view. Floating: opens the card.
   *  Phones: opens Now playing on the matching tab. */
  openSidePanel: (view: StudioSidePanelView) => void;
  /** Closes when this view is the one showing, otherwise opens it. */
  toggleSidePanel: (view: StudioSidePanelView) => void;
  closeSidePanel: () => void;
  /** Kept for existing callers: `sidePanel === "queue"`. */
  isQueuePanelOpen: boolean;
  isShortcutsOpen: boolean;
  /** The bar's one open popover (settings, sleep timer), keyed by its
   *  trigger id. Opening one closes the floating card, and the card closes
   *  it. The docked column stays put. */
  openPopoverId: string | null;
  openNowPlaying: (tab?: StudioNowPlayingTab) => void;
  closeNowPlaying: () => void;
  setNowPlayingTab: (tab: StudioNowPlayingTab) => void;
  /** `openSidePanel("queue")`; on phones Now playing opens on "queue". */
  openQueue: () => void;
  /** Closes the floating card only and leaves the saved preference alone. */
  closeQueuePanel: () => void;
  /** `toggleSidePanel("queue")`. */
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
