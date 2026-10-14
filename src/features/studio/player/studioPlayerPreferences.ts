import { safeStorage } from "../../../shared/storage/safeStorage";
import { STUDIO_CROSSFADE_MAX_SECONDS } from "../api/studio.types";
import type { StudioPlayerPreferences } from "./studioPlayerContext";

/** Device preferences (contract C.4, F.2): volume, mute and even loudness.
 *  The crossfade length is a server setting (Open pages'
 *  useStudioPlaybackPreferences) and never lands here. */
export const STUDIO_PLAYER_PREFERENCES_KEY = "studio.player.preferences";

export type StudioLocalPlayerPreferences = Omit<
  StudioPlayerPreferences,
  "crossfadeSeconds"
>;

export const DEFAULT_PLAYER_PREFERENCES: StudioLocalPlayerPreferences = {
  volume: 1,
  isMuted: false,
  isLoudnessEven: true,
};

export function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) return DEFAULT_PLAYER_PREFERENCES.volume;
  return Math.round(Math.min(Math.max(volume, 0), 1) * 100) / 100;
}

export function clampCrossfadeSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.min(
    Math.max(Math.round(seconds), 0),
    STUDIO_CROSSFADE_MAX_SECONDS,
  );
}

export function normalizePlayerPreferences(
  value: unknown,
): StudioLocalPlayerPreferences {
  if (typeof value !== "object" || value === null)
    return DEFAULT_PLAYER_PREFERENCES;
  const record = value as Record<string, unknown>;
  return {
    volume:
      typeof record.volume === "number"
        ? clampVolume(record.volume)
        : DEFAULT_PLAYER_PREFERENCES.volume,
    isMuted:
      typeof record.isMuted === "boolean"
        ? record.isMuted
        : DEFAULT_PLAYER_PREFERENCES.isMuted,
    isLoudnessEven:
      typeof record.isLoudnessEven === "boolean"
        ? record.isLoudnessEven
        : DEFAULT_PLAYER_PREFERENCES.isLoudnessEven,
  };
}

export function readPlayerPreferences(): StudioLocalPlayerPreferences {
  const raw = safeStorage.get(STUDIO_PLAYER_PREFERENCES_KEY);
  if (raw === null) return DEFAULT_PLAYER_PREFERENCES;
  try {
    return normalizePlayerPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_PLAYER_PREFERENCES;
  }
}

export function writePlayerPreferences(
  preferences: StudioLocalPlayerPreferences,
): void {
  // normalize drops any key outside the three local ones.
  safeStorage.set(
    STUDIO_PLAYER_PREFERENCES_KEY,
    JSON.stringify(normalizePlayerPreferences(preferences)),
  );
}
