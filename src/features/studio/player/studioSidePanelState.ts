import type {
  StudioNowPlayingTab,
  StudioSidePanelPlacement,
  StudioSidePanelView,
} from "./studioPlayerSurface";
import type { StudioSidePanelPreference } from "./studioSidePanelPreference";

/** The provider's own state. The floating card's view lives here for the
 *  visit; the docked state comes from the saved preference. */
export interface StudioSurfaceState {
  isNowPlayingOpen: boolean;
  nowPlayingTab: StudioNowPlayingTab;
  floatingView: StudioSidePanelView | null;
  isShortcutsOpen: boolean;
  openPopoverId: string | null;
}

export const CLOSED_STUDIO_SURFACES: StudioSurfaceState = {
  isNowPlayingOpen: false,
  nowPlayingTab: "lyrics",
  floatingView: null,
  isShortcutsOpen: false,
  openPopoverId: null,
};

/** Phones carry no side panel; desktop docks inside the listener shell from
 *  1280px and floats everywhere else. */
export function resolveStudioSidePanelPlacement(input: {
  isPhone: boolean;
  isDockHostMounted: boolean;
  isDockWide: boolean;
}): StudioSidePanelPlacement | null {
  if (input.isPhone) return null;
  return input.isDockHostMounted && input.isDockWide ? "docked" : "floating";
}

/** The view showing in the current placement, or null while closed. */
export function resolveStudioSidePanel(input: {
  placement: StudioSidePanelPlacement | null;
  preference: StudioSidePanelPreference;
  floatingView: StudioSidePanelView | null;
  hasQueue: boolean;
}): StudioSidePanelView | null {
  if (!input.hasQueue || input.placement === null) return null;
  if (input.placement === "floating") return input.floatingView;
  return input.preference.isOpen ? input.preference.view : null;
}

/** The Now playing tab a phone opens for each side panel view. */
const PHONE_TAB_OF_VIEW: Record<StudioSidePanelView, StudioNowPlayingTab> = {
  nowPlaying: "artist",
  queue: "queue",
};

/** Every player menu is exclusive, so opening a view closes a popover. */
export function openPhoneNowPlaying(
  previous: StudioSurfaceState,
  view: StudioSidePanelView,
): StudioSurfaceState {
  return {
    ...previous,
    isNowPlayingOpen: true,
    nowPlayingTab: PHONE_TAB_OF_VIEW[view],
    openPopoverId: null,
  };
}

export function togglePhoneNowPlaying(
  previous: StudioSurfaceState,
  view: StudioSidePanelView,
): StudioSurfaceState {
  const isShowingView =
    previous.isNowPlayingOpen &&
    previous.nowPlayingTab === PHONE_TAB_OF_VIEW[view];
  return isShowingView
    ? { ...previous, isNowPlayingOpen: false }
    : openPhoneNowPlaying(previous, view);
}

export function openFloatingView(
  previous: StudioSurfaceState,
  view: StudioSidePanelView,
): StudioSurfaceState {
  return { ...previous, floatingView: view, openPopoverId: null };
}

export function toggleFloatingView(
  previous: StudioSurfaceState,
  view: StudioSidePanelView,
): StudioSurfaceState {
  return previous.floatingView === view
    ? { ...previous, floatingView: null }
    : openFloatingView(previous, view);
}

export function closeFloatingView(
  previous: StudioSurfaceState,
): StudioSurfaceState {
  return previous.floatingView === null
    ? previous
    : { ...previous, floatingView: null };
}
