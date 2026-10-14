import { safeStorage } from "../../../shared/storage/safeStorage";
import {
  DEFAULT_EPISODE_SPEED,
  isStudioEpisodeSpeed,
  type StudioEpisodeSpeed,
} from "./studioEpisodeRules";

// Studio artist kinds (spec 5.7): which episodes a member played, where they
// stopped and their speed, kept on this device only and never sent anywhere.
// Every read and write goes through safeStorage, so a blocked store reads as
// empty and writes nothing. Cleared wherever Listening clears its queue.

/** Every key this module writes starts with it. */
export const EPISODE_STORAGE_KEY_PREFIX = "studio.episode";
export const EPISODE_MEMORY_CAP = 500;

export const episodeMemoryKey = (memberId: string) =>
  `${EPISODE_STORAGE_KEY_PREFIX}Memory.${memberId}`;
export const episodeSpeedKey = (memberId: string) =>
  `${EPISODE_STORAGE_KEY_PREFIX}Speed.${memberId}`;

export interface StudioEpisodeMemoryEntry {
  positionSeconds?: number;
  playedAt?: string;
  touchedAt: string;
}

export type StudioEpisodeMemory = Readonly<
  Record<string, StudioEpisodeMemoryEntry>
>;

export const EMPTY_EPISODE_MEMORY: StudioEpisodeMemory = Object.freeze({});

function entryOf(value: unknown): StudioEpisodeMemoryEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.touchedAt !== "string") return null;
  const entry: StudioEpisodeMemoryEntry = { touchedAt: record.touchedAt };
  if (record.positionSeconds !== undefined) {
    const position = record.positionSeconds;
    if (
      typeof position !== "number" ||
      !Number.isFinite(position) ||
      position < 0
    )
      return null;
    entry.positionSeconds = position;
  }
  if (record.playedAt !== undefined) {
    if (typeof record.playedAt !== "string") return null;
    entry.playedAt = record.playedAt;
  }
  return entry;
}

/** Parsed and checked entry by entry; anything unreadable reads as empty. */
export function parseEpisodeMemory(raw: string | null): StudioEpisodeMemory {
  if (!raw) return EMPTY_EPISODE_MEMORY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return EMPTY_EPISODE_MEMORY;
    const memory: Record<string, StudioEpisodeMemoryEntry> = {};
    for (const [trackId, value] of Object.entries(parsed)) {
      const entry = entryOf(value);
      if (entry) memory[trackId] = entry;
    }
    return memory;
  } catch {
    return EMPTY_EPISODE_MEMORY;
  }
}

/** The newest `cap` entries by `touchedAt` (ISO strings sort by time). */
export function capEpisodeMemory(
  memory: StudioEpisodeMemory,
  cap: number = EPISODE_MEMORY_CAP,
): StudioEpisodeMemory {
  const entries = Object.entries(memory);
  if (entries.length <= cap) return memory;
  entries.sort(([, left], [, right]) =>
    right.touchedAt.localeCompare(left.touchedAt),
  );
  return Object.fromEntries(entries.slice(0, cap));
}

// ── Subscribe and notify ──────────────────────────────────────────────────

let storeVersion = 0;
const listeners = new Set<() => void>();

function notifyListeners() {
  storeVersion += 1;
  listeners.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key === null || event.key.startsWith(EPISODE_STORAGE_KEY_PREFIX))
    notifyListeners();
}

/** For useSyncExternalStore: a write here or in another tab notifies. */
export function subscribeEpisodeMemory(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1)
    window.addEventListener("storage", handleStorageEvent);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0)
      window.removeEventListener("storage", handleStorageEvent);
  };
}

const snapshotCache: {
  memberId: string | null;
  version: number;
  memory: StudioEpisodeMemory;
} = { memberId: null, version: -1, memory: EMPTY_EPISODE_MEMORY };

/** One parse per write and member, so a snapshot stays the same object
 *  between writes. */
export function readEpisodeMemory(memberId: string): StudioEpisodeMemory {
  if (
    snapshotCache.memberId === memberId &&
    snapshotCache.version === storeVersion
  )
    return snapshotCache.memory;
  const memory = parseEpisodeMemory(
    safeStorage.get(episodeMemoryKey(memberId)),
  );
  snapshotCache.memberId = memberId;
  snapshotCache.version = storeVersion;
  snapshotCache.memory = memory;
  return memory;
}

/** Set by Quick Exit for the rest of this page: leaving fires pagehide, and
 *  the episode tracker's save then would write the memory straight back. */
let areEpisodeSavesEnded = false;

function updateEntry(
  memberId: string,
  trackId: string,
  change: (
    entry: StudioEpisodeMemoryEntry | undefined,
    touchedAt: string,
  ) => StudioEpisodeMemoryEntry,
  now: Date,
) {
  if (areEpisodeSavesEnded) return;
  const memory = readEpisodeMemory(memberId);
  const next = {
    ...memory,
    [trackId]: change(memory[trackId], now.toISOString()),
  };
  safeStorage.set(
    episodeMemoryKey(memberId),
    JSON.stringify(capEpisodeMemory(next)),
  );
  notifyListeners();
}

export function saveEpisodePosition(
  memberId: string,
  trackId: string,
  positionSeconds: number,
  now: Date = new Date(),
): void {
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0) return;
  updateEntry(
    memberId,
    trackId,
    (entry, touchedAt) => ({
      ...entry,
      positionSeconds: Math.floor(positionSeconds),
      touchedAt,
    }),
    now,
  );
}

/** Played drops the saved place (spec 5.7). */
export function markEpisodePlayed(
  memberId: string,
  trackId: string,
  now: Date = new Date(),
): void {
  updateEntry(
    memberId,
    trackId,
    (_entry, touchedAt) => ({ playedAt: touchedAt, touchedAt }),
    now,
  );
}

/** Unplayed drops the played mark and keeps any saved place. */
export function markEpisodeUnplayed(
  memberId: string,
  trackId: string,
  now: Date = new Date(),
): void {
  updateEntry(
    memberId,
    trackId,
    (entry, touchedAt) =>
      entry?.positionSeconds === undefined
        ? { touchedAt }
        : { positionSeconds: entry.positionSeconds, touchedAt },
    now,
  );
}

export function readEpisodeSpeed(memberId: string | null): StudioEpisodeSpeed {
  if (!memberId) return DEFAULT_EPISODE_SPEED;
  const stored = Number(safeStorage.get(episodeSpeedKey(memberId)));
  return isStudioEpisodeSpeed(stored) ? stored : DEFAULT_EPISODE_SPEED;
}

export function writeEpisodeSpeed(
  memberId: string,
  speed: StudioEpisodeSpeed,
): void {
  if (areEpisodeSavesEnded) return;
  safeStorage.set(episodeSpeedKey(memberId), String(speed));
  notifyListeners();
}

/** Sign-out, Quick Exit and loss of Studio access: every studio.episode* key
 *  of every member goes. */
export function clearStudioEpisodeMemory(): void {
  for (const key of safeStorage.keys()) {
    if (key.startsWith(EPISODE_STORAGE_KEY_PREFIX)) safeStorage.remove(key);
  }
  notifyListeners();
}

/** Quick Exit, right after clearStudioEpisodeMemory: no position, mark or
 *  speed is saved again on this page, so the pagehide the leave fires writes
 *  nothing back. Sign-out only clears, since the app keeps running. */
export function endStudioEpisodeSaving(): void {
  areEpisodeSavesEnded = true;
}

/** Tests only: saving starts again after a test that ended it. */
export function resumeStudioEpisodeSavingForTests(): void {
  areEpisodeSavesEnded = false;
}
