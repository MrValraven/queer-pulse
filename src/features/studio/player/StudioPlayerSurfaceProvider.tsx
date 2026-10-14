import { useMemo, useState, type ReactNode } from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { mediaMax } from "../../../shared/theme/breakpoints";
import {
  StudioPlayerSurfaceContext,
  type StudioNowPlayingTab,
  type StudioPlayerSurfaceValue,
} from "./studioPlayerSurface";

interface SurfaceState {
  isNowPlayingOpen: boolean;
  nowPlayingTab: StudioNowPlayingTab;
  isQueuePanelOpen: boolean;
  isShortcutsOpen: boolean;
}

const CLOSED_SURFACES: SurfaceState = {
  isNowPlayingOpen: false,
  nowPlayingTab: "lyrics",
  isQueuePanelOpen: false,
  isShortcutsOpen: false,
};

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
  const [surface, setSurface] = useState<SurfaceState>(CLOSED_SURFACES);
  // The bar leaves with the queue, and its surfaces go with it.
  const isAnyOpen =
    surface.isNowPlayingOpen ||
    surface.isQueuePanelOpen ||
    surface.isShortcutsOpen;
  if (!hasQueue && isAnyOpen)
    setSurface({ ...CLOSED_SURFACES, nowPlayingTab: surface.nowPlayingTab });

  const value = useMemo<StudioPlayerSurfaceValue>(
    () => ({
      ...surface,
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
      openQueue: () =>
        setSurface((previous) =>
          isPhone
            ? { ...previous, isNowPlayingOpen: true, nowPlayingTab: "queue" }
            : { ...previous, isQueuePanelOpen: true },
        ),
      closeQueuePanel: () =>
        setSurface((previous) => ({ ...previous, isQueuePanelOpen: false })),
      toggleQueuePanel: () =>
        setSurface((previous) => {
          if (!isPhone)
            return {
              ...previous,
              isQueuePanelOpen: !previous.isQueuePanelOpen,
            };
          const isShowingQueue =
            previous.isNowPlayingOpen && previous.nowPlayingTab === "queue";
          return isShowingQueue
            ? { ...previous, isNowPlayingOpen: false }
            : { ...previous, isNowPlayingOpen: true, nowPlayingTab: "queue" };
        }),
      openShortcuts: () =>
        setSurface((previous) => ({ ...previous, isShortcutsOpen: true })),
      closeShortcuts: () =>
        setSurface((previous) => ({ ...previous, isShortcutsOpen: false })),
    }),
    [surface, isPhone],
  );

  return (
    <StudioPlayerSurfaceContext.Provider value={value}>
      {children}
    </StudioPlayerSurfaceContext.Provider>
  );
}
