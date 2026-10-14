import { useStudioPlayer, useStudioPlayerClock } from "./studioPlayerContext";
import { runPlayerShortcut } from "./studioPlayerShortcutActions";
import { useStudioPlayerSurface } from "./studioPlayerSurface";
import { useStudioPlayerShortcuts } from "./useStudioPlayerShortcuts";

/** Mounts the player's keyboard shortcuts (contract C.3). Renders nothing. */
export function StudioPlayerShortcutsMount() {
  const player = useStudioPlayer();
  const { currentTime } = useStudioPlayerClock();
  const surface = useStudioPlayerSurface();
  useStudioPlayerShortcuts({
    hasQueue: player.hasQueue,
    isNowPlayingOpen: surface.isNowPlayingOpen,
    onShortcut: (shortcutId) =>
      runPlayerShortcut(shortcutId, { player, surface, currentTime }),
  });
  return null;
}
