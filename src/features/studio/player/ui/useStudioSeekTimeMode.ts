import { useSyncExternalStore } from "react";
import { safeStorage } from "../../../../shared/storage/safeStorage";

/** What the label after the seek bar shows: the track's length or the time left. */
export type StudioSeekTimeMode = "total" | "remaining";

const TIME_DISPLAY_STORAGE_KEY = "studio.player.timeDisplay";
const DEFAULT_TIME_MODE: StudioSeekTimeMode = "total";

/** Every mounted seek bar, told when the pick changes. */
const timeModeListeners = new Set<() => void>();
/** The pick while storage refuses writes (private mode, blocked site data). */
let unpersistedTimeMode: StudioSeekTimeMode | null = null;

function isSeekTimeMode(value: unknown): value is StudioSeekTimeMode {
  return value === "total" || value === "remaining";
}

function readStoredTimeMode(): StudioSeekTimeMode {
  try {
    const raw = safeStorage.get(TIME_DISPLAY_STORAGE_KEY);
    if (raw != null) {
      const parsed: unknown = JSON.parse(raw);
      if (isSeekTimeMode(parsed)) return parsed;
    }
  } catch {
    // corrupt payload: fall back to the default
  }
  return DEFAULT_TIME_MODE;
}

function readTimeMode(): StudioSeekTimeMode {
  return unpersistedTimeMode ?? readStoredTimeMode();
}

function readServerTimeMode(): StudioSeekTimeMode {
  return DEFAULT_TIME_MODE;
}

function notifyTimeModeListeners() {
  timeModeListeners.forEach((listener) => listener());
}

/** Saves the pick and tells every seek bar. A write the storage drops is
 *  kept in memory for this page. */
function writeTimeMode(nextMode: StudioSeekTimeMode) {
  const serialized = JSON.stringify(nextMode);
  safeStorage.set(TIME_DISPLAY_STORAGE_KEY, serialized);
  unpersistedTimeMode =
    safeStorage.get(TIME_DISPLAY_STORAGE_KEY) === serialized ? null : nextMode;
  notifyTimeModeListeners();
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key === null || event.key === TIME_DISPLAY_STORAGE_KEY)
    notifyTimeModeListeners();
}

function subscribeToTimeMode(listener: () => void): () => void {
  if (timeModeListeners.size === 0)
    window.addEventListener("storage", handleStorageEvent);
  timeModeListeners.add(listener);
  return () => {
    timeModeListeners.delete(listener);
    if (timeModeListeners.size === 0)
      window.removeEventListener("storage", handleStorageEvent);
  };
}

function toggleTimeMode() {
  writeTimeMode(readTimeMode() === "total" ? "remaining" : "total");
}

/** The member's pick between length and time left, kept on this device and
 *  shared by every mounted seek bar, so the player bar and Now Playing
 *  always agree. */
export function useStudioSeekTimeMode(): {
  mode: StudioSeekTimeMode;
  toggleMode: () => void;
} {
  const mode = useSyncExternalStore(
    subscribeToTimeMode,
    readTimeMode,
    readServerTimeMode,
  );
  return { mode, toggleMode: toggleTimeMode };
}
