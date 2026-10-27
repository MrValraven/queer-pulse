import { useMemo, useState, type ReactNode } from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { mediaMax } from "../../../shared/theme/breakpoints";
import {
  StudioPlayerSurfaceContext,
  type StudioPlayerSurfaceValue,
  type StudioSidePanelView,
} from "./studioPlayerSurface";
import {
  STUDIO_SIDE_PANEL_DOCK_QUERY,
  useIsStudioSidePanelDockHostMounted,
} from "./studioSidePanelDock";
import {
  useStudioSidePanelPreference,
  writeStudioSidePanelPreference,
} from "./studioSidePanelPreference";
import {
  CLOSED_STUDIO_SURFACES,
  closeFloatingView,
  openFloatingView,
  openPhoneNowPlaying,
  resolveStudioSidePanel,
  resolveStudioSidePanelPlacement,
  toggleFloatingView,
  togglePhoneNowPlaying,
  type StudioSurfaceState,
} from "./studioSidePanelState";

/** Studio's phone cut (the player's own breakpoint, as StudioShell uses). */
const PHONE_QUERY = mediaMax(880);

export function StudioPlayerSurfaceProvider({
  hasQueue,
  children,
}: {
  hasQueue: boolean;
  children: ReactNode;
}) {
  const isPhone = useMediaQuery(PHONE_QUERY);
  const isDockWide = useMediaQuery(STUDIO_SIDE_PANEL_DOCK_QUERY);
  const isDockHostMounted = useIsStudioSidePanelDockHostMounted();
  const preference = useStudioSidePanelPreference();
  const placement = resolveStudioSidePanelPlacement({
    isPhone,
    isDockHostMounted,
    isDockWide,
  });
  const [surface, setSurface] = useState<StudioSurfaceState>(
    CLOSED_STUDIO_SURFACES,
  );
  // A floating card belongs to the placement it opened in: moving between
  // placements drops it, so narrowing the window hides the docked column
  // and leaves the page clear.
  const [seenPlacement, setSeenPlacement] = useState(placement);
  if (seenPlacement !== placement) {
    setSeenPlacement(placement);
    setSurface(closeFloatingView);
  }
  // The bar leaves with the queue, and its surfaces go with it. The docked
  // preference stays saved and shows again with the next queue.
  const isAnyOpen =
    surface.isNowPlayingOpen ||
    surface.floatingView !== null ||
    surface.isShortcutsOpen ||
    surface.openPopoverId !== null;
  if (!hasQueue && isAnyOpen)
    setSurface((previous) => ({
      ...CLOSED_STUDIO_SURFACES,
      nowPlayingTab: previous.nowPlayingTab,
    }));
  const sidePanel = resolveStudioSidePanel({
    placement,
    preference,
    floatingView: surface.floatingView,
    hasQueue,
  });

  const value = useMemo<StudioPlayerSurfaceValue>(() => {
    const isDocked = placement === "docked";
    const openSidePanel = (view: StudioSidePanelView) => {
      if (isDocked) writeStudioSidePanelPreference({ isOpen: true, view });
      else
        setSurface((previous) =>
          placement === null
            ? openPhoneNowPlaying(previous, view)
            : openFloatingView(previous, view),
        );
    };
    // Phones carry no card, so closing there changes nothing; Now playing
    // closes through closeNowPlaying.
    const closeSidePanel = () => {
      if (isDocked)
        writeStudioSidePanelPreference({
          isOpen: false,
          view: preference.view,
        });
      else setSurface(closeFloatingView);
    };
    const toggleSidePanel = (view: StudioSidePanelView) => {
      if (isDocked) {
        if (sidePanel === view) closeSidePanel();
        else openSidePanel(view);
        return;
      }
      setSurface((previous) =>
        placement === null
          ? togglePhoneNowPlaying(previous, view)
          : toggleFloatingView(previous, view),
      );
    };
    return {
      hasQueue,
      isNowPlayingOpen: surface.isNowPlayingOpen,
      nowPlayingTab: surface.nowPlayingTab,
      isShortcutsOpen: surface.isShortcutsOpen,
      openPopoverId: surface.openPopoverId,
      sidePanel,
      sidePanelPlacement: placement,
      openSidePanel,
      toggleSidePanel,
      closeSidePanel,
      isQueuePanelOpen: sidePanel === "queue",
      openQueue: () => openSidePanel("queue"),
      toggleQueuePanel: () => toggleSidePanel("queue"),
      // The docked column answers to its own buttons and the saved
      // preference; this wrapper only reaches the floating card.
      closeQueuePanel: () => setSurface(closeFloatingView),
      openNowPlaying: (tab) =>
        setSurface((previous) => ({
          ...previous,
          isNowPlayingOpen: true,
          nowPlayingTab: tab ?? previous.nowPlayingTab,
        })),
      closeNowPlaying: () =>
        setSurface((previous) => ({ ...previous, isNowPlayingOpen: false })),
      setNowPlayingTab: (tab) =>
        setSurface((previous) => ({ ...previous, nowPlayingTab: tab })),
      openShortcuts: () =>
        setSurface((previous) => ({
          ...previous,
          isShortcutsOpen: true,
          openPopoverId: null,
        })),
      closeShortcuts: () =>
        setSurface((previous) => ({ ...previous, isShortcutsOpen: false })),
      // A popover closes the floating card; the docked column stays open.
      openPopover: (id) =>
        setSurface((previous) => ({
          ...previous,
          openPopoverId: id,
          floatingView: null,
        })),
      closePopover: (id) =>
        setSurface((previous) =>
          previous.openPopoverId === id
            ? { ...previous, openPopoverId: null }
            : previous,
        ),
    };
  }, [hasQueue, surface, placement, sidePanel, preference.view]);

  return (
    <StudioPlayerSurfaceContext.Provider value={value}>
      {children}
    </StudioPlayerSurfaceContext.Provider>
  );
}
