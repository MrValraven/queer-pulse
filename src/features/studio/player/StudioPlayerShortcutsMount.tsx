import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useStudioPlayer, useStudioPlayerClock } from "./studioPlayerContext";
import { announceStudioPlayer } from "./studioPlayerAnnouncer";
import { StudioPlayerLiveRegion } from "./StudioPlayerLiveRegion";
import { runPlayerShortcut } from "./studioPlayerShortcutActions";
import { useStudioPlayerSurface } from "./studioPlayerSurface";
import { useStudioPlayerShortcuts } from "./useStudioPlayerShortcuts";
import { useStudioPlayerWatchers } from "./useStudioPlayerWatchers";

/** The key listener, on its own so the clock's ticks re-render only it. */
function StudioPlayerShortcutKeys() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { currentTime, duration } = useStudioPlayerClock();
  const surface = useStudioPlayerSurface();
  useStudioPlayerShortcuts({
    hasQueue: player.hasQueue,
    isNowPlayingOpen: surface.isNowPlayingOpen,
    onShortcut: (shortcutId) => {
      const announcement = runPlayerShortcut(shortcutId, {
        player,
        surface,
        currentTime,
        duration,
      });
      if (announcement)
        announceStudioPlayer(t(announcement.key, announcement.values));
    },
  });
  return null;
}

/** Mounts the player's keyboard shortcuts (contract C.3), its one polite
 *  live region (DES-20), the "Playing:" tab title and the offline pause. */
export function StudioPlayerShortcutsMount() {
  useStudioPlayerWatchers();
  return (
    <>
      <StudioPlayerShortcutKeys />
      <StudioPlayerLiveRegion />
    </>
  );
}
