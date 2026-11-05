// Fills the clip cache for one pack (contract 5.4, 2.2, 8.5). Cached clips are
// ready at once; the rest get presigned URLs from one media request and are
// fetched without credentials, two at a time. A URL that expired before its
// fetch started, or that the storage answered with 403 (a presigned GET past
// its expiry), is re-requested once through clipIds; a second expiry fails
// the clip. Nothing here logs: a failure is reported by its code only.

import type {
  VjClipMediaDTO,
  VjPackMediaDTO,
  VjPreloadFailure,
  VjScreenClipStatus,
} from "../../../shared/contracts/vj";
import type { VjClipCache } from "./vjClipCache";

export interface VjPreloadClip {
  clipId: string;
  byteSize: number;
}

export interface VjPreloaderDependencies {
  cache: VjClipCache;
  /** PLAN-2's VjPackMediaFetcher, injected by the caller. */
  fetchMedia: (
    packId: string,
    clipIds: string[] | null,
    signal?: AbortSignal,
  ) => Promise<VjPackMediaDTO>;
  /** Default globalThis.fetch. */
  fetchBytes?: typeof fetch;
  /** Default Date.now. */
  now?: () => number;
  /** Default navigator.onLine. */
  isOnline?: () => boolean;
}

export interface VjPreloadInput {
  packId: string;
  clips: readonly VjPreloadClip[];
  signal: AbortSignal;
  onUpdate: (statuses: VjScreenClipStatus[]) => void;
}

export const VJ_PRELOAD_CONCURRENCY = 2;

/** Progress moves of at least this much reach onUpdate while a clip loads. */
const PROGRESS_REPORT_STEP = 0.01;

/** What object storage answers a presigned GET whose signature has expired. */
const EXPIRED_URL_STATUS = 403;

interface PreloadRun {
  input: VjPreloadInput;
  cache: VjClipCache;
  fetchMedia: VjPreloaderDependencies["fetchMedia"];
  fetchBytes: typeof fetch;
  now: () => number;
  statuses: VjScreenClipStatus[];
  byteSizeByClipId: Map<string, number>;
}

class VjPreloadError extends Error {
  readonly failure: VjPreloadFailure;
  constructor(failure: VjPreloadFailure) {
    super(failure);
    this.name = "VjPreloadError";
    this.failure = failure;
  }
}

function defaultIsOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function isAborted(run: PreloadRun): boolean {
  return run.input.signal.aborted;
}

function emit(run: PreloadRun): void {
  if (isAborted(run)) return;
  run.input.onUpdate(run.statuses.map((status) => ({ ...status })));
}

function setStatus(
  run: PreloadRun,
  clipId: string,
  patch: Partial<Omit<VjScreenClipStatus, "clipId">>,
): void {
  run.statuses = run.statuses.map((status) =>
    status.clipId === clipId ? { ...status, ...patch } : status,
  );
}

function markFailed(
  run: PreloadRun,
  clipId: string,
  failure: VjPreloadFailure,
): void {
  setStatus(run, clipId, { state: "failed", progress: 0, failure });
}

async function isCached(cache: VjClipCache, clipId: string): Promise<boolean> {
  try {
    return await cache.has(clipId);
  } catch {
    return false;
  }
}

async function readBody(
  run: PreloadRun,
  item: VjClipMediaDTO,
  response: Response,
): Promise<Blob> {
  if (response.body === null) return response.blob();
  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  const packByteSize = run.byteSizeByClipId.get(item.clipId) ?? 0;
  const expectedBytes = packByteSize > 0 ? packByteSize : item.byteSize;
  let receivedBytes = 0;
  let reportedProgress = 0;
  for (;;) {
    const { done: isDone, value } = await reader.read();
    if (isDone) break;
    chunks.push(value);
    receivedBytes += value.byteLength;
    if (expectedBytes <= 0) continue;
    const progress = Math.min(receivedBytes / expectedBytes, 1);
    if (progress - reportedProgress >= PROGRESS_REPORT_STEP) {
      reportedProgress = progress;
      setStatus(run, item.clipId, { progress });
      emit(run);
    }
  }
  return new Blob(chunks, { type: item.mimeType });
}

async function downloadClip(
  run: PreloadRun,
  item: VjClipMediaDTO,
): Promise<void> {
  let blob: Blob;
  try {
    const response = await run.fetchBytes(item.url, {
      credentials: "omit",
      mode: "cors",
      signal: run.input.signal,
    });
    if (response.status === EXPIRED_URL_STATUS) {
      throw new VjPreloadError("url_expired");
    }
    if (!response.ok) throw new VjPreloadError("network");
    blob = await readBody(run, item, response);
  } catch (error) {
    if (error instanceof VjPreloadError) throw error;
    throw new VjPreloadError("network");
  }
  try {
    await run.cache.put(item.clipId, blob, item.mimeType);
  } catch {
    // Cache Storage refused the write (QuotaExceededError).
    throw new VjPreloadError("storage_full");
  }
}

/**
 * Fetches one clip. Answers true when its URL had already expired or the
 * storage refused it with 403, so the caller re-requests it; otherwise the
 * clip ends ready or failed.
 */
async function preloadOneClip(
  run: PreloadRun,
  item: VjClipMediaDTO,
): Promise<boolean> {
  if (isAborted(run)) return false;
  if (Date.parse(item.expiresAt) <= run.now()) return true;
  setStatus(run, item.clipId, { state: "loading", progress: 0, failure: null });
  emit(run);
  try {
    await downloadClip(run, item);
    if (isAborted(run)) return false;
    setStatus(run, item.clipId, { state: "ready", progress: 1, failure: null });
  } catch (error) {
    if (isAborted(run)) return false;
    const failure = error instanceof VjPreloadError ? error.failure : "network";
    if (failure === "url_expired") {
      setStatus(run, item.clipId, { state: "queued", progress: 0 });
      emit(run);
      return true;
    }
    markFailed(run, item.clipId, failure);
  }
  emit(run);
  return false;
}

/** Runs every item, VJ_PRELOAD_CONCURRENCY at a time; answers the expired ones. */
async function preloadItems(
  run: PreloadRun,
  items: readonly VjClipMediaDTO[],
): Promise<VjClipMediaDTO[]> {
  const expiredItems: VjClipMediaDTO[] = [];
  let nextItemIndex = 0;
  const runWorker = async (): Promise<void> => {
    while (nextItemIndex < items.length && !isAborted(run)) {
      const item = items[nextItemIndex];
      nextItemIndex += 1;
      if (item === undefined) continue;
      const hasExpired = await preloadOneClip(run, item);
      if (hasExpired) expiredItems.push(item);
    }
  };
  const workerCount = Math.min(VJ_PRELOAD_CONCURRENCY, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return expiredItems;
}

/**
 * Asks for URLs of the given clips (null asks for the whole pack) and keeps
 * the ones still missing from the cache, in pack order. Clips the answer
 * leaves out fail not_found. Answers null when the request failed or aborted.
 */
async function requestMedia(
  run: PreloadRun,
  missingClipIds: readonly string[],
  requestedClipIds: string[] | null,
): Promise<VjClipMediaDTO[] | null> {
  let media: VjPackMediaDTO;
  try {
    media = await run.fetchMedia(
      run.input.packId,
      requestedClipIds,
      run.input.signal,
    );
  } catch {
    if (isAborted(run)) return null;
    missingClipIds.forEach((clipId) => markFailed(run, clipId, "network"));
    emit(run);
    return null;
  }
  if (isAborted(run)) return null;
  const itemByClipId = new Map(media.items.map((item) => [item.clipId, item]));
  const items: VjClipMediaDTO[] = [];
  missingClipIds.forEach((clipId) => {
    const item = itemByClipId.get(clipId);
    if (item === undefined) markFailed(run, clipId, "not_found");
    else items.push(item);
  });
  emit(run);
  return items;
}

async function markCachedClipsReady(run: PreloadRun): Promise<string[]> {
  const missingClipIds: string[] = [];
  for (const status of run.statuses) {
    if (await isCached(run.cache, status.clipId)) {
      setStatus(run, status.clipId, { state: "ready", progress: 1 });
    } else if (!missingClipIds.includes(status.clipId)) {
      missingClipIds.push(status.clipId);
    }
  }
  return missingClipIds;
}

async function runPreload(
  run: PreloadRun,
  isOnline: () => boolean,
): Promise<void> {
  const missingClipIds = await markCachedClipsReady(run);
  emit(run);
  if (missingClipIds.length === 0 || isAborted(run) || !isOnline()) return;

  const firstItems = await requestMedia(run, missingClipIds, null);
  if (firstItems === null) return;
  const expiredItems = await preloadItems(run, firstItems);
  if (expiredItems.length === 0 || isAborted(run)) return;

  const expiredClipIds = expiredItems.map((item) => item.clipId);
  const retryItems = await requestMedia(run, expiredClipIds, expiredClipIds);
  if (retryItems === null) return;
  const expiredAgainItems = await preloadItems(run, retryItems);
  if (expiredAgainItems.length === 0 || isAborted(run)) return;
  expiredAgainItems.forEach((item) =>
    markFailed(run, item.clipId, "url_expired"),
  );
  emit(run);
}

export async function preloadVjPack(
  input: VjPreloadInput,
  dependencies: VjPreloaderDependencies,
): Promise<VjScreenClipStatus[]> {
  const run: PreloadRun = {
    input,
    cache: dependencies.cache,
    fetchMedia: dependencies.fetchMedia,
    fetchBytes: dependencies.fetchBytes ?? globalThis.fetch.bind(globalThis),
    now: dependencies.now ?? Date.now,
    statuses: input.clips.map((clip) => ({
      clipId: clip.clipId,
      state: "queued",
      progress: 0,
      failure: null,
    })),
    byteSizeByClipId: new Map(
      input.clips.map((clip) => [clip.clipId, clip.byteSize]),
    ),
  };
  try {
    await runPreload(run, dependencies.isOnline ?? defaultIsOnline);
  } catch {
    // Never rejects: whatever was not settled stays as it stands.
  }
  return run.statuses.map((status) => ({ ...status }));
}
