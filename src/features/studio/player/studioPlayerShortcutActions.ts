import { formatTrackTime } from "../api/studio.adapters";
import { noteMemberPlayToggle } from "./studioPlaybackSignals";
import { clampVolume } from "./studioPlayerPreferences";
import type {
  StudioPlayerValue,
  StudioRepeatMode,
} from "./studioPlayerContext";
import type { StudioPlayerSurfaceValue } from "./studioPlayerSurface";
import type { StudioPlayerShortcutId } from "./useStudioPlayerShortcuts";

export const SHORTCUT_SEEK_SECONDS = 5;
export const SHORTCUT_VOLUME_STEP = 0.1;

/** What a shortcut changed, as a catalog key the player's live region reads
 *  out (DES-20). Track changes are announced by the track itself, and the
 *  shortcuts that open a panel are announced by that panel. */
export interface StudioShortcutAnnouncement {
  key: string;
  values?: Record<string, string | number>;
}

/** The mode a press of Repeat moves to (the reducer's cycle). */
const NEXT_REPEAT_MODE: Record<StudioRepeatMode, StudioRepeatMode> = {
  off: "all",
  all: "one",
  one: "off",
};

const REPEAT_LABEL_KEY: Record<StudioRepeatMode, string> = {
  off: "studio:player.repeat.off",
  all: "studio:player.repeat.all",
  one: "studio:player.repeat.one",
};

/** The second a seek lands on, kept inside the track as the seek is. */
function positionAnnouncement(
  seconds: number,
  durationSeconds: number | null | undefined,
): StudioShortcutAnnouncement {
  const ceiling = durationSeconds ?? Math.max(seconds, 0);
  const landedSeconds = Math.min(Math.max(0, seconds), ceiling);
  return {
    key: "studio:player.announce.position",
    values: { time: formatTrackTime(landedSeconds) ?? "0:00" },
  };
}

/** What each shortcut does (spec 7.9), and what it says it did. */
export function runPlayerShortcut(
  shortcutId: StudioPlayerShortcutId,
  context: {
    player: StudioPlayerValue;
    surface: StudioPlayerSurfaceValue;
    currentTime: number;
    /** The track's length, so the spoken seek stays inside it. */
    duration?: number | null;
  },
): StudioShortcutAnnouncement | null {
  const { player, surface, currentTime, duration } = context;
  const volumeBy = (step: number): StudioShortcutAnnouncement => {
    const volume = clampVolume(
      Math.round((player.preferences.volume + step) * 10) / 10,
    );
    player.setVolume(volume);
    return {
      key: "studio:player.announce.volume",
      values: { percent: Math.round(volume * 100) },
    };
  };
  switch (shortcutId) {
    case "playPause": {
      // A press while the track loads waits for it, so it says nothing.
      if (player.status === "loading") return null;
      const wasPlaying = player.status === "playing";
      noteMemberPlayToggle();
      player.togglePlay();
      return {
        key: wasPlaying
          ? "studio:player.announce.paused"
          : "studio:player.announce.playing",
      };
    }
    case "seekBack":
      player.seek(currentTime - SHORTCUT_SEEK_SECONDS);
      return positionAnnouncement(
        currentTime - SHORTCUT_SEEK_SECONDS,
        duration,
      );
    case "seekForward":
      player.seek(currentTime + SHORTCUT_SEEK_SECONDS);
      return positionAnnouncement(
        currentTime + SHORTCUT_SEEK_SECONDS,
        duration,
      );
    case "previousTrack":
      player.previous();
      return null;
    case "nextTrack":
      if (!player.hasNext) return { key: "studio:player.announce.noNextTrack" };
      player.next();
      return null;
    case "volumeUp":
      return volumeBy(SHORTCUT_VOLUME_STEP);
    case "volumeDown":
      return volumeBy(-SHORTCUT_VOLUME_STEP);
    case "mute": {
      const wasMuted = player.preferences.isMuted;
      player.toggleMute();
      return {
        key: wasMuted
          ? "studio:player.announce.unmuted"
          : "studio:player.announce.muted",
      };
    }
    case "shuffle": {
      const wasShuffled = player.queue.isShuffled;
      player.toggleShuffle();
      return {
        key: wasShuffled
          ? "studio:player.announce.shuffleOff"
          : "studio:player.announce.shuffleOn",
      };
    }
    case "repeat":
      player.cycleRepeat();
      return { key: REPEAT_LABEL_KEY[NEXT_REPEAT_MODE[player.queue.repeat]] };
    case "lyrics":
      surface.openNowPlaying("lyrics");
      return null;
    case "queue":
      // With Now playing open, Q switches its tab; the desktop side panel
      // would open underneath the dialog and take focus out of it.
      if (surface.isNowPlayingOpen) surface.setNowPlayingTab("queue");
      else surface.openQueue();
      return null;
    case "help":
      surface.openShortcuts();
      return null;
  }
}
