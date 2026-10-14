import {
  STUDIO_GENRES,
  STUDIO_MOODS,
  type StudioGenre,
  type StudioMood,
  type StudioRadioFilter,
} from "../api/studio.types";
import type { StudioQueueItem, StudioQueueSource } from "./studioPlayerContext";
import type { StudioQueueState } from "./studioQueueReducer";

/**
 * The queue saved for this tab (contract C.4, spec 5.3): sessionStorage under
 * `studio.queue.<memberId>`. It holds the queue rows and the playhead only;
 * stream URLs live in memory and are fetched again on play. Every access is
 * guarded: blocked or full storage means nothing is saved.
 */
export const STUDIO_QUEUE_STORAGE_PREFIX = "studio.queue.";
const SNAPSHOT_VERSION = 1;

export interface StudioQueueSnapshot {
  state: StudioQueueState;
  positionSeconds: number;
}

export function studioQueueStorageKey(memberId: string): string {
  return `${STUDIO_QUEUE_STORAGE_PREFIX}${memberId}`;
}

function sessionStore(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

const TINTS: ReadonlySet<string> = new Set([
  "default",
  "coral",
  "jade",
  "plum",
]);
const SOURCE_KINDS: ReadonlySet<string> = new Set([
  "release",
  "playlist",
  "artist",
  "tracks",
  "radio",
]);
const REPEAT_MODES: ReadonlySet<string> = new Set(["off", "all", "one"]);
const GENRES: ReadonlySet<string> = new Set<string>(STUDIO_GENRES);
const MOODS: ReadonlySet<string> = new Set<string>(STUDIO_MOODS);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const isText = (value: unknown): value is string => typeof value === "string";
/** An app route such as /studio/track?id=...; links to other sites are refused. */
const isAppPath = (value: unknown): value is string =>
  isText(value) && value.startsWith("/") && !value.startsWith("//");

/** The known queue fields, copied one by one; anything else is dropped. */
function pickQueueItem(value: unknown): StudioQueueItem | null {
  if (!isRecord(value)) return null;
  const {
    queueEntryId,
    trackId,
    title,
    durationSeconds,
    trackHref,
    releaseId,
  } = value;
  const { releaseTitle, coverUrl, tint, artistId, artistName, artistHref } =
    value;
  const { isExplicit, previewToken, isEpisode } = value;
  if (!isText(queueEntryId) || !isText(trackId) || !isText(title)) return null;
  if (!isText(releaseId) || !isText(releaseTitle)) return null;
  if (!isText(artistId) || !isText(artistName)) return null;
  if (!isAppPath(trackHref) || !isAppPath(artistHref)) return null;
  if (durationSeconds !== null && typeof durationSeconds !== "number")
    return null;
  if (coverUrl !== null && !isText(coverUrl)) return null;
  if (!isText(tint) || !TINTS.has(tint)) return null;
  return {
    queueEntryId,
    trackId,
    title,
    durationSeconds,
    trackHref,
    releaseId,
    releaseTitle,
    coverUrl,
    tint: tint as StudioQueueItem["tint"],
    artistId,
    artistName,
    artistHref,
    // A snapshot from before the explicit flag reads as not explicit.
    isExplicit: isExplicit === true,
    // A preview queue keeps its link, so the restored track can stream.
    ...(isText(previewToken) && previewToken !== "" ? { previewToken } : {}),
    // Artist kinds: a restored episode keeps its speed and its skips; music
    // and older snapshots carry no key and read as music.
    ...(isEpisode === true ? { isEpisode: true } : {}),
  };
}

function pickQueueItems(value: unknown): StudioQueueItem[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.map(pickQueueItem);
  return items.every((entry) => entry !== null) ? items : null;
}

/** A radio's filter: one known genre or one known mood; null otherwise. */
function pickRadioFilter(value: unknown): StudioRadioFilter | null {
  if (!isRecord(value) || !isText(value.value)) return null;
  if (value.kind === "genre" && GENRES.has(value.value))
    return { kind: "genre", value: value.value as StudioGenre };
  if (value.kind === "mood" && MOODS.has(value.value))
    return { kind: "mood", value: value.value as StudioMood };
  return null;
}

function pickSource(value: unknown): StudioQueueSource | null | undefined {
  if (value === null) return null;
  if (!isRecord(value) || !isText(value.kind) || !SOURCE_KINDS.has(value.kind))
    return undefined;
  if (!isText(value.label)) return undefined;
  if (value.href !== null && !isAppPath(value.href)) return undefined;
  const source: StudioQueueSource = {
    kind: value.kind as StudioQueueSource["kind"],
    label: value.label,
    href: value.href,
  };
  if (source.kind !== "radio") return source;
  // A restored radio reseeds its pool from its filter; one without a filter
  // plays the saved rows as a finite queue.
  const radioFilter = pickRadioFilter(value.radioFilter);
  return radioFilter
    ? { ...source, radioFilter }
    : { ...source, kind: "tracks" };
}

function pickState(value: unknown): StudioQueueState | null {
  if (!isRecord(value)) return null;
  const sourceItems = pickQueueItems(value.sourceItems);
  const originalSourceItems = pickQueueItems(value.originalSourceItems);
  const userItems = pickQueueItems(value.userItems);
  const current = pickQueueItem(value.current);
  const source = pickSource(value.source);
  const { currentFrom, sourceIndex, isShuffled, repeat } = value;
  if (!sourceItems || !originalSourceItems || !userItems || !current)
    return null;
  if (source === undefined) return null;
  if (currentFrom !== "source" && currentFrom !== "user") return null;
  if (typeof sourceIndex !== "number" || !Number.isInteger(sourceIndex))
    return null;
  if (sourceIndex < -1 || sourceIndex >= sourceItems.length) return null;
  if (typeof isShuffled !== "boolean") return null;
  if (!isText(repeat) || !REPEAT_MODES.has(repeat)) return null;
  return {
    source,
    sourceItems,
    originalSourceItems,
    userItems,
    current,
    currentFrom,
    sourceIndex,
    isShuffled,
    repeat: repeat as StudioQueueState["repeat"],
  };
}

function parseSnapshot(raw: string): StudioQueueSnapshot | null {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || parsed.version !== SNAPSHOT_VERSION) return null;
  const state = pickState(parsed.state);
  if (!state?.current) return null;
  const rawPosition = parsed.positionSeconds;
  const position =
    typeof rawPosition === "number" && Number.isFinite(rawPosition)
      ? Math.max(0, rawPosition)
      : 0;
  const duration = state.current.durationSeconds;
  return {
    state,
    positionSeconds:
      duration === null ? position : Math.min(position, duration),
  };
}

export function readQueueSnapshot(
  memberId: string,
): StudioQueueSnapshot | null {
  try {
    const raw =
      sessionStore()?.getItem(studioQueueStorageKey(memberId)) ?? null;
    return raw === null ? null : parseSnapshot(raw);
  } catch {
    return null;
  }
}

/** Set by Quick Exit for the rest of this page: leaving fires pagehide and
 *  visibilitychange, and a save then would write the queue straight back. */
let areQueueSavesEnded = false;

/** Quick Exit: no queue is saved again on this page, and every saved one is
 *  removed. Never throws. */
export function endStudioQueueSaving(): void {
  areQueueSavesEnded = true;
  clearStudioQueueSnapshots();
}

/** Tests only: saving starts again after a test that ended it. */
export function resumeStudioQueueSavingForTests(): void {
  areQueueSavesEnded = false;
}

export function writeQueueSnapshot(
  memberId: string,
  snapshot: StudioQueueSnapshot,
): void {
  if (areQueueSavesEnded) return;
  const { state } = snapshot;
  const rows = (items: StudioQueueItem[]) =>
    items.map(pickQueueItem).filter((entry) => entry !== null);
  const payload = {
    version: SNAPSHOT_VERSION,
    state: {
      source: pickSource(state.source) ?? null,
      sourceItems: rows(state.sourceItems),
      originalSourceItems: rows(state.originalSourceItems),
      userItems: rows(state.userItems),
      current: pickQueueItem(state.current),
      currentFrom: state.currentFrom,
      sourceIndex: state.sourceIndex,
      isShuffled: state.isShuffled,
      repeat: state.repeat,
    },
    positionSeconds: snapshot.positionSeconds,
  };
  try {
    sessionStore()?.setItem(
      studioQueueStorageKey(memberId),
      JSON.stringify(payload),
    );
  } catch {
    // Full or blocked storage: the queue stays in memory for this visit.
  }
}

export function clearQueueSnapshot(memberId: string): void {
  try {
    sessionStore()?.removeItem(studioQueueStorageKey(memberId));
  } catch {
    // Blocked storage holds nothing to clear.
  }
}

/** Every member's saved queue in this tab: Quick Exit, sign-out and a switch
 *  between demo and live. */
export function clearStudioQueueSnapshots(): void {
  const store = sessionStore();
  if (!store) return;
  try {
    const keys: string[] = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key?.startsWith(STUDIO_QUEUE_STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => store.removeItem(key));
  } catch {
    // Blocked storage holds nothing to clear.
  }
}
