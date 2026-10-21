import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "../../app/providers/authContext";
import { safeStorage } from "../../shared/storage/safeStorage";
import { foldForSearch } from "../../shared/lib/foldForSearch";
import {
  areStudioListeningMemoryWritesStopped,
  subscribeStudioListeningMemory,
} from "./player/studioListeningMemory";
import {
  STUDIO_RECENT_SEARCHES_LIMIT,
  STUDIO_RECENT_SEARCHES_STORAGE_KEY,
} from "./studioSearch.data";

/**
 * DES-40: the member's recent Studio searches, on this device only. Nothing
 * here is sent to the server. The list belongs to one member, so another
 * member signing in on the same device reads an empty list, and the
 * listening-memory wipe (Quick Exit, sign-out, loss of access) removes it
 * with the queue and Recently played.
 */

const RECENT_SEARCHES_VERSION = 1;
const EMPTY_TERMS: readonly string[] = [];

interface StoredRecentSearches {
  memberId: string;
  terms: string[];
}

function parseRecentSearches(raw: string | null): StoredRecentSearches | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    if (record.version !== RECENT_SEARCHES_VERSION) return null;
    if (typeof record.memberId !== "string" || !Array.isArray(record.terms))
      return null;
    const terms = record.terms
      .filter((term): term is string => typeof term === "string")
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
      .slice(0, STUDIO_RECENT_SEARCHES_LIMIT);
    return { memberId: record.memberId, terms };
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key === null || event.key === STUDIO_RECENT_SEARCHES_STORAGE_KEY)
    notifyListeners();
}

/** A write here or in another tab, and the listening-memory wipe, notify. */
function subscribeRecentSearches(listener: () => void): () => void {
  listeners.add(listener);
  const unsubscribeWipe = subscribeStudioListeningMemory(listener);
  if (listeners.size === 1)
    window.addEventListener("storage", handleStorageEvent);
  return () => {
    listeners.delete(listener);
    unsubscribeWipe();
    if (listeners.size === 0)
      window.removeEventListener("storage", handleStorageEvent);
  };
}

const snapshotCache: {
  memberId: string | null;
  raw: string | null;
  terms: readonly string[];
} = { memberId: null, raw: null, terms: EMPTY_TERMS };

/** Newest first. Cached by the stored text, so the snapshot stays the same
 *  array until storage changes. */
function readRecentSearches(memberId: string): readonly string[] {
  const raw = safeStorage.get(STUDIO_RECENT_SEARCHES_STORAGE_KEY);
  if (snapshotCache.memberId === memberId && snapshotCache.raw === raw)
    return snapshotCache.terms;
  const stored = parseRecentSearches(raw);
  snapshotCache.memberId = memberId;
  snapshotCache.raw = raw;
  snapshotCache.terms =
    stored && stored.memberId === memberId ? stored.terms : EMPTY_TERMS;
  return snapshotCache.terms;
}

/** Puts the term first (one entry per term, compared without case or
 *  accents) and keeps the newest eight. Nothing is written after Quick Exit
 *  or while another tab's wipe pauses the listening memory. */
function rememberRecentSearch(memberId: string, term: string): void {
  if (areStudioListeningMemoryWritesStopped()) return;
  const trimmed = term.trim();
  if (!trimmed) return;
  const folded = foldForSearch(trimmed);
  const previous = readRecentSearches(memberId);
  if (previous[0] === trimmed) return;
  const terms = [
    trimmed,
    ...previous.filter((candidate) => foldForSearch(candidate) !== folded),
  ].slice(0, STUDIO_RECENT_SEARCHES_LIMIT);
  safeStorage.set(
    STUDIO_RECENT_SEARCHES_STORAGE_KEY,
    JSON.stringify({ version: RECENT_SEARCHES_VERSION, memberId, terms }),
  );
  notifyListeners();
}

function clearRecentSearches(): void {
  safeStorage.remove(STUDIO_RECENT_SEARCHES_STORAGE_KEY);
  notifyListeners();
}

export interface StudioRecentSearches {
  /** Newest first, at most eight. */
  terms: readonly string[];
  remember: (term: string) => void;
  /** Removes the whole list from this device. */
  clear: () => void;
}

/** The signed-in member's recent searches on this device. */
export function useStudioRecentSearches(): StudioRecentSearches {
  const { user } = useAuth();
  const memberId = user?.id ?? "";
  const terms = useSyncExternalStore(subscribeRecentSearches, () =>
    readRecentSearches(memberId),
  );
  const remember = useCallback(
    (term: string) => rememberRecentSearch(memberId, term),
    [memberId],
  );
  return useMemo(
    () => ({ terms, remember, clear: clearRecentSearches }),
    [terms, remember],
  );
}
