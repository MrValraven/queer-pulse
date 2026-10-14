import type { StudioPlayerValue } from "./studioPlayerContext";
import type { StudioPlayerSurfaceValue } from "./studioPlayerSurface";
import type { StudioPlayerShortcutId } from "./useStudioPlayerShortcuts";

export const SHORTCUT_SEEK_SECONDS = 5;
export const SHORTCUT_VOLUME_STEP = 0.1;

/** What each shortcut does (spec 7.9). */
export function runPlayerShortcut(
  shortcutId: StudioPlayerShortcutId,
  context: {
    player: StudioPlayerValue;
    surface: StudioPlayerSurfaceValue;
    currentTime: number;
  },
): void {
  const { player, surface, currentTime } = context;
  const volumeBy = (step: number) =>
    player.setVolume(Math.round((player.preferences.volume + step) * 10) / 10);
  switch (shortcutId) {
    case "playPause":
      player.togglePlay();
      return;
    case "seekBack":
      player.seek(currentTime - SHORTCUT_SEEK_SECONDS);
      return;
    case "seekForward":
      player.seek(currentTime + SHORTCUT_SEEK_SECONDS);
      return;
    case "previousTrack":
      player.previous();
      return;
    case "nextTrack":
      player.next();
      return;
    case "volumeUp":
      volumeBy(SHORTCUT_VOLUME_STEP);
      return;
    case "volumeDown":
      volumeBy(-SHORTCUT_VOLUME_STEP);
      return;
    case "mute":
      player.toggleMute();
      return;
    case "shuffle":
      player.toggleShuffle();
      return;
    case "repeat":
      player.cycleRepeat();
      return;
    case "lyrics":
      surface.openNowPlaying("lyrics");
      return;
    case "queue":
      // With Now playing open, Q switches its tab; the desktop side panel
      // would open underneath the dialog and take focus out of it.
      if (surface.isNowPlayingOpen) surface.setNowPlayingTab("queue");
      else surface.openQueue();
      return;
    case "help":
      surface.openShortcuts();
      return;
  }
}
