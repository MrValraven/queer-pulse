import { safeStorage } from "../../../shared/storage/safeStorage";
import { STUDIO_CROSSFADE_MAX_SECONDS } from "../api/studio.types";
import type { StudioPlayerPreferences } from "./studioPlayerContext";
import {
  clearStudioRecentlyPlayed,
  clearStudioResumeRecord,
} from "./studioListeningMemory";

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

/** The crossfade length the mounted player uses now (a server setting,
 *  mirrored by useStudioPlayerPreferences). The recently played recorder
 *  widens its track-end check by it, since a crossfade starts the next track
 *  that many seconds early. */
let activeCrossfadeSeconds = 0;

export function setActiveCrossfadeSeconds(seconds: number): void {
  activeCrossfadeSeconds = clampCrossfadeSeconds(seconds);
}

export function readActiveCrossfadeSeconds(): number {
  return activeCrossfadeSeconds;
}

// ── Listening preferences (PRD-17, PRD-18, DES-21) ────────────────────────

/** This device's listening switches, kept apart from the volume record so a
 *  volume change never writes over them. Studio Settings shows them. */
export const STUDIO_LISTENING_PREFERENCES_KEY = "studio.player.listening";

export interface StudioListeningPreferences {
  /** Keep the queue and playhead on this device after the tab closes, and
   *  cue them, paused, in a fresh tab. Default false (opt-in). */
  shouldResumeAcrossSessions: boolean;
  /** Keep a recently played list on this device. Default true. */
  isRecentlyPlayedOn: boolean;
  /** The single-letter player shortcuts, such as L for the lyrics and Q for
   *  the queue. Default true. */
  areSingleKeyShortcutsOn: boolean;
}

export const DEFAULT_LISTENING_PREFERENCES: StudioListeningPreferences = {
  shouldResumeAcrossSessions: false,
  isRecentlyPlayedOn: true,
  areSingleKeyShortcutsOn: true,
};

const LISTENING_PREFERENCE_FIELDS = [
  "shouldResumeAcrossSessions",
  "isRecentlyPlayedOn",
  "areSingleKeyShortcutsOn",
] as const;

export function normalizeListeningPreferences(
  value: unknown,
): StudioListeningPreferences {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const preferences = { ...DEFAULT_LISTENING_PREFERENCES };
  for (const field of LISTENING_PREFERENCE_FIELDS) {
    const stored = record[field];
    if (typeof stored === "boolean") preferences[field] = stored;
  }
  return preferences;
}

const listeningListeners = new Set<() => void>();
/** Blocked storage keeps the switches for this page only. */
let inMemoryListeningPreferences: StudioListeningPreferences | null = null;
const listeningCache: {
  raw: string | null;
  inMemory: StudioListeningPreferences | null;
  preferences: StudioListeningPreferences;
} = { raw: null, inMemory: null, preferences: DEFAULT_LISTENING_PREFERENCES };

function notifyListeningListeners(): void {
  listeningListeners.forEach((listener) => listener());
}

function handleListeningStorageEvent(event: StorageEvent): void {
  if (event.key === null || event.key === STUDIO_LISTENING_PREFERENCES_KEY)
    notifyListeningListeners();
}

/** For useSyncExternalStore: a change here or in another tab notifies. */
export function subscribeListeningPreferences(
  listener: () => void,
): () => void {
  listeningListeners.add(listener);
  if (listeningListeners.size === 1)
    window.addEventListener("storage", handleListeningStorageEvent);
  return () => {
    listeningListeners.delete(listener);
    if (listeningListeners.size === 0)
      window.removeEventListener("storage", handleListeningStorageEvent);
  };
}

/** The current switches; the same object until they change. Safe to call
 *  from any handler (the shortcut listener reads it on every key). */
export function readListeningPreferences(): StudioListeningPreferences {
  const raw = safeStorage.get(STUDIO_LISTENING_PREFERENCES_KEY);
  if (
    raw === listeningCache.raw &&
    inMemoryListeningPreferences === listeningCache.inMemory
  )
    return listeningCache.preferences;
  let preferences =
    inMemoryListeningPreferences ?? DEFAULT_LISTENING_PREFERENCES;
  if (raw !== null) {
    try {
      preferences = normalizeListeningPreferences(JSON.parse(raw));
    } catch {
      preferences = DEFAULT_LISTENING_PREFERENCES;
    }
  }
  listeningCache.raw = raw;
  listeningCache.inMemory = inMemoryListeningPreferences;
  listeningCache.preferences = preferences;
  return preferences;
}

/** Saves one or more switches. Turning resume off removes the resume copy,
 *  and turning Recently played off removes the list, at once. */
export function writeListeningPreferences(
  patch: Partial<StudioListeningPreferences>,
): StudioListeningPreferences {
  const next = normalizeListeningPreferences({
    ...readListeningPreferences(),
    ...patch,
  });
  inMemoryListeningPreferences = next;
  safeStorage.set(STUDIO_LISTENING_PREFERENCES_KEY, JSON.stringify(next));
  if (!next.shouldResumeAcrossSessions) clearStudioResumeRecord();
  if (!next.isRecentlyPlayedOn) clearStudioRecentlyPlayed();
  notifyListeningListeners();
  return next;
}

// ── Equaliser (PRD-14) ────────────────────────────────────────────────────

/** This device's equaliser: five band gains in dB, low to high. Kept apart
 *  from the volume record, and never sent to the server. Flat (all zero)
 *  takes the equaliser out of the audio graph. */
export const STUDIO_EQUALIZER_KEY = "studio.player.equalizer";
export const STUDIO_EQUALIZER_BAND_COUNT = 5;
export const STUDIO_EQUALIZER_MAX_GAIN_DB = 12;

export const FLAT_EQUALIZER_GAINS: readonly number[] = Object.freeze(
  Array.from({ length: STUDIO_EQUALIZER_BAND_COUNT }, () => 0),
);

export function clampEqualizerGain(gainDb: unknown): number {
  if (typeof gainDb !== "number" || !Number.isFinite(gainDb)) return 0;
  const clamped = Math.min(
    Math.max(gainDb, -STUDIO_EQUALIZER_MAX_GAIN_DB),
    STUDIO_EQUALIZER_MAX_GAIN_DB,
  );
  // Half-decibel steps; `+ 0` turns -0 into 0.
  return Math.round(clamped * 2) / 2 + 0;
}

export function isFlatEqualizer(gainsDb: readonly number[]): boolean {
  return gainsDb.every((gainDb) => gainDb === 0);
}

export function normalizeEqualizerGains(value: unknown): readonly number[] {
  const stored =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>).gainsDb
      : null;
  if (!Array.isArray(stored) || stored.length !== STUDIO_EQUALIZER_BAND_COUNT)
    return FLAT_EQUALIZER_GAINS;
  const gainsDb = stored.map(clampEqualizerGain);
  return isFlatEqualizer(gainsDb) ? FLAT_EQUALIZER_GAINS : gainsDb;
}

const equalizerListeners = new Set<() => void>();
/** Blocked storage keeps the equaliser for this page only. */
let inMemoryEqualizerGains: readonly number[] | null = null;
const equalizerCache: {
  raw: string | null;
  inMemory: readonly number[] | null;
  gainsDb: readonly number[];
} = { raw: null, inMemory: null, gainsDb: FLAT_EQUALIZER_GAINS };

function handleEqualizerStorageEvent(event: StorageEvent): void {
  if (event.key === null || event.key === STUDIO_EQUALIZER_KEY)
    equalizerListeners.forEach((listener) => listener());
}

/** For useSyncExternalStore and the audio graph: a change here or in
 *  another tab notifies. */
export function subscribeEqualizerGains(listener: () => void): () => void {
  equalizerListeners.add(listener);
  if (equalizerListeners.size === 1)
    window.addEventListener("storage", handleEqualizerStorageEvent);
  return () => {
    equalizerListeners.delete(listener);
    if (equalizerListeners.size === 0)
      window.removeEventListener("storage", handleEqualizerStorageEvent);
  };
}

/** The current gains; the same array until they change. */
export function readEqualizerGains(): readonly number[] {
  const raw = safeStorage.get(STUDIO_EQUALIZER_KEY);
  if (
    raw === equalizerCache.raw &&
    inMemoryEqualizerGains === equalizerCache.inMemory
  )
    return equalizerCache.gainsDb;
  let gainsDb = inMemoryEqualizerGains ?? FLAT_EQUALIZER_GAINS;
  if (raw !== null) {
    try {
      gainsDb = normalizeEqualizerGains(JSON.parse(raw));
    } catch {
      gainsDb = FLAT_EQUALIZER_GAINS;
    }
  }
  equalizerCache.raw = raw;
  equalizerCache.inMemory = inMemoryEqualizerGains;
  equalizerCache.gainsDb = gainsDb;
  return gainsDb;
}

/** Saves the gains on this device. Flat is stored as a record too, so a
 *  reset in one tab reaches every other tab through the storage event. */
export function writeEqualizerGains(
  gainsDb: readonly number[],
): readonly number[] {
  const next = normalizeEqualizerGains({ gainsDb });
  inMemoryEqualizerGains = next;
  safeStorage.set(STUDIO_EQUALIZER_KEY, JSON.stringify({ gainsDb: next }));
  equalizerListeners.forEach((listener) => listener());
  return next;
}
