import { safeStorage } from "../../../shared/storage/safeStorage";
import { clearStudioRailMemory } from "../useStudioRailMemory";
import {
  STUDIO_TASTE_STORAGE_KEY,
  STUDIO_WELCOME_SEEN_STORAGE_KEY,
} from "../studioFirstRunConstants";
import { STUDIO_RECENT_SEARCHES_STORAGE_KEY } from "../studioSearch.data";

/**
 * Studio's listening memory on this device (PRD-17, PRD-18): the opt-in
 * resume copy of the queue and the recently played list. Both live in
 * localStorage only and are never sent to the server. Quick Exit, sign-out,
 * loss of Studio access and a demo/live switch remove both through
 * `clearStudioListeningMemory`, which `clearStudioQueueSnapshots` calls, so
 * every path that wipes the tab's queue wipes these with it. Any other
 * feature that forgets listening state calls the same function.
 */
export const STUDIO_RESUME_STORAGE_KEY = "qp.studio.resume.v1";
export const STUDIO_RECENT_STORAGE_KEY = "qp.studio.recent.v1";
export const STUDIO_RECENTLY_PLAYED_LIMIT = 50;
/** Set and removed at once by every wipe, so other open tabs hear it as a
 *  storage event and stop writing. It never stays in storage. */
export const STUDIO_LISTENING_ENDED_MARKER_KEY = "qp.studio.listening.ended";
const RECENT_VERSION = 1;

export interface StudioRecentlyPlayedEntry {
  trackId: string;
  /** ISO 8601. */
  playedAt: string;
}

const EMPTY_RECENTLY_PLAYED: readonly StudioRecentlyPlayedEntry[] = [];

/** Set by Quick Exit for the rest of this page: leaving fires pagehide, and a
 *  save then would write the memory straight back. Another tab's Quick Exit
 *  sets it here too. */
let isListeningMemoryEnded = false;
/** Set when another tab wipes for any other reason (sign-out, loss of
 *  access, a demo/live switch): no writes until this tab's member settles
 *  with access again (resumeStudioListeningMemoryWrites). */
let isListeningMemoryPaused = false;

const areWritesStopped = () =>
  isListeningMemoryEnded || isListeningMemoryPaused;

/** The same gate for device memory kept outside this module (the recent
 *  searches): true after Quick Exit, or while another tab's wipe pauses
 *  writes. */
export function areStudioListeningMemoryWritesStopped(): boolean {
  return areWritesStopped();
}

// ── Subscribe and notify ──────────────────────────────────────────────────

const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

/** Always listening, subscribed or not: a wipe in another tab stops this
 *  tab's writes, so it never writes the memory back. */
function handleWipeMarker(event: StorageEvent): void {
  if (event.key !== STUDIO_LISTENING_ENDED_MARKER_KEY) return;
  if (event.newValue === null) return;
  if (event.newValue.startsWith("ended")) endStudioListeningMemory();
  else isListeningMemoryPaused = true;
  notifyListeners();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", handleWipeMarker);
  // Dev reloads of this module drop the old listener.
  import.meta.hot?.dispose(() =>
    window.removeEventListener("storage", handleWipeMarker),
  );
}

function handleStorageEvent(event: StorageEvent): void {
  if (
    event.key === null ||
    event.key === STUDIO_RECENT_STORAGE_KEY ||
    event.key === STUDIO_RESUME_STORAGE_KEY
  )
    notifyListeners();
}

/** For useSyncExternalStore: a write here or in another tab notifies. */
export function subscribeStudioListeningMemory(
  listener: () => void,
): () => void {
  listeners.add(listener);
  if (listeners.size === 1)
    window.addEventListener("storage", handleStorageEvent);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0)
      window.removeEventListener("storage", handleStorageEvent);
  };
}

// ── Recently played ───────────────────────────────────────────────────────

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function pickEntry(value: unknown): StudioRecentlyPlayedEntry | null {
  if (!isRecord(value)) return null;
  const { trackId, playedAt } = value;
  if (typeof trackId !== "string" || trackId === "") return null;
  if (typeof playedAt !== "string" || Number.isNaN(Date.parse(playedAt)))
    return null;
  return { trackId, playedAt };
}

interface StoredRecentlyPlayed {
  memberId: string;
  entries: StudioRecentlyPlayedEntry[];
}

function parseRecentlyPlayed(raw: string | null): StoredRecentlyPlayed | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== RECENT_VERSION) return null;
    if (typeof parsed.memberId !== "string" || !Array.isArray(parsed.entries))
      return null;
    const seenTrackIds = new Set<string>();
    const entries: StudioRecentlyPlayedEntry[] = [];
    for (const candidate of parsed.entries) {
      const entry = pickEntry(candidate);
      if (!entry || seenTrackIds.has(entry.trackId)) continue;
      seenTrackIds.add(entry.trackId);
      entries.push(entry);
    }
    entries.sort((left, right) => right.playedAt.localeCompare(left.playedAt));
    return {
      memberId: parsed.memberId,
      entries: entries.slice(0, STUDIO_RECENTLY_PLAYED_LIMIT),
    };
  } catch {
    return null;
  }
}

const recentCache: {
  memberId: string | null;
  raw: string | null;
  entries: readonly StudioRecentlyPlayedEntry[];
} = { memberId: null, raw: null, entries: EMPTY_RECENTLY_PLAYED };

/** The member's recently played tracks, newest first. Another member's list
 *  reads as empty. Cached by the stored text and member, so the snapshot
 *  stays the same array until storage changes, a change made in another tab
 *  while nothing listened included. */
export function readStudioRecentlyPlayed(
  memberId: string | null,
): readonly StudioRecentlyPlayedEntry[] {
  if (!memberId) return EMPTY_RECENTLY_PLAYED;
  const raw = safeStorage.get(STUDIO_RECENT_STORAGE_KEY);
  if (recentCache.memberId === memberId && recentCache.raw === raw)
    return recentCache.entries;
  const stored = parseRecentlyPlayed(raw);
  const entries =
    stored && stored.memberId === memberId
      ? stored.entries
      : EMPTY_RECENTLY_PLAYED;
  recentCache.memberId = memberId;
  recentCache.raw = raw;
  recentCache.entries = entries;
  return entries;
}

/** Puts the track first (one row per track) and keeps the newest 50. A list
 *  left by another member on this device is replaced. */
export function recordStudioRecentlyPlayed(
  memberId: string,
  trackId: string,
  now: Date = new Date(),
): void {
  if (areWritesStopped() || trackId === "") return;
  const stored = parseRecentlyPlayed(
    safeStorage.get(STUDIO_RECENT_STORAGE_KEY),
  );
  const previous = stored && stored.memberId === memberId ? stored.entries : [];
  const entries = [
    { trackId, playedAt: now.toISOString() },
    ...previous.filter((entry) => entry.trackId !== trackId),
  ].slice(0, STUDIO_RECENTLY_PLAYED_LIMIT);
  safeStorage.set(
    STUDIO_RECENT_STORAGE_KEY,
    JSON.stringify({ version: RECENT_VERSION, memberId, entries }),
  );
  notifyListeners();
}

/** The member's own Clear, and switching Recently played off. */
export function clearStudioRecentlyPlayed(): void {
  safeStorage.remove(STUDIO_RECENT_STORAGE_KEY);
  notifyListeners();
}

// ── Resume copy of the queue (written and parsed by studioQueueStorage) ────

/** The raw resume record, or null when absent or storage is blocked. */
export function readStudioResumeRecord(): string | null {
  return safeStorage.get(STUDIO_RESUME_STORAGE_KEY);
}

export function writeStudioResumeRecord(serialized: string): void {
  if (areWritesStopped()) return;
  safeStorage.set(STUDIO_RESUME_STORAGE_KEY, serialized);
}

/** Switching resume off, emptying the queue, or a record that is not the
 *  signed-in member's. */
export function clearStudioResumeRecord(): void {
  safeStorage.remove(STUDIO_RESUME_STORAGE_KEY);
}

// ── The wipe ──────────────────────────────────────────────────────────────

/** Quick Exit, sign-out, loss of Studio access and a demo/live switch: the
 *  resume copy and the recently played list go, for every member on this
 *  device. Never throws. */
export function clearStudioListeningMemory(): void {
  clearStudioResumeRecord();
  // DES-40: the recent searches go with them. Removed before the notify
  // below, so a mounted list reads empty at once.
  safeStorage.remove(STUDIO_RECENT_SEARCHES_STORAGE_KEY);
  safeStorage.remove(STUDIO_TASTE_STORAGE_KEY); // PRD-12 welcome picks (device copy)
  clearStudioRecentlyPlayed();
  // The rail's scroll offset and sort in this tab (qp.studio.railPlaylists.v1.*).
  clearStudioRailMemory();
  // Tells every other open tab, then leaves no trace: "ended" after Quick
  // Exit (endStudioQueueSaving ends this tab first), "paused" otherwise.
  // The time makes each marker new, so a repeat wipe still fires the event.
  const reason = isListeningMemoryEnded ? "ended" : "paused";
  safeStorage.set(STUDIO_LISTENING_ENDED_MARKER_KEY, `${reason}:${Date.now()}`);
  safeStorage.remove(STUDIO_LISTENING_ENDED_MARKER_KEY);
}

/** Quick Exit, after the wipe: nothing is written again on this page. */
export function endStudioListeningMemory(): void {
  isListeningMemoryEnded = true;
  // Quick Exit only: the welcome-seen bit outlives sign-out (PRD-12). This is
  // the device copy alone; the account's welcome flag stays, so the welcome
  // never replays after Quick Exit.
  safeStorage.remove(STUDIO_WELCOME_SEEN_STORAGE_KEY);
}

/** The member settled with Studio access in this tab: writes paused by
 *  another tab's wipe start again. A Quick Exit end stays. */
export function resumeStudioListeningMemoryWrites(): void {
  isListeningMemoryPaused = false;
}

/** Tests only: saving starts again after a test that ended it. */
export function resumeStudioListeningMemoryForTests(): void {
  isListeningMemoryEnded = false;
  isListeningMemoryPaused = false;
}
